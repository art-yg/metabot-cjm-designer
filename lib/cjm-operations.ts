import type { Node, Edge } from "reactflow"
import type { CJMNodeData } from "@/app/cjm-editor/page"
import type { MapSettings } from "./map-settings"
import { exportToJson, importFromJson } from "./serialization"
import { toast } from "react-hot-toast"
import { loadApiSettings, saveApiSettings } from "./api-settings"

// Старые захардкоженные настройки - закомментированы для быстрого восстановления
// const METABOT_API_TOKEN =
//   "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI4NCIsImp0aSI6IjUyYzBlMWQ2ZjZjZDdhODNhNTdhOGRiZjIxYzc3NDNiNzAzYzFjMzNiM2VlMjAwMGE5ZTBiOWQ2MzlmMDA3YjI4YzlkNzc4Yzg0ZGNhODIzIiwiaWF0IjoxNzQ5NjM4NjcxLjQxNTk0MSwibmJmIjoxNzQ5NjM4NjcxLjQxNTk2OCwiZXhwIjoyMDY0OTk4NjcxLjQxMTIxNCwic3ViIjoiIiwic2NvcGVzIjpbIioiXX0.S5a4dL8HNZw9GpaDZENMFy9ZDIZEJz0m2c4CxuITFAQABz23C7WJzyh00GrHXKLb_zaOVIcOw7nSaBivKMl0nDVX-60UqfkfejkXFabZLiDyIjTbLT8-1hKuk2rOTC0sI8aypOJ76oEAWRI7wvpTLk3bs0640fLIa2Msw9jjvkwO3Db_yjvdZCOk-grD06bFnEqR7tEGYHvLri0ddmpsre16sICEeBwhhByKAMNeiFSG8bNjk5ARHx50kYy8XHbnnQHK5-G2yAAyhIHcoMo_D1wTsiELny00QlI0Vi5sndj1r_HJroJXruz8WwfhHWhUq331MLuFInkIokA1NitVmu4oA1rVTuCUKChrQReKgS6Gt08aeyvhOcNY8P8Jwvx78OpSvNmXAobxj-Q0A2oxgnT0DoVkfrBBRrtRiC7Epz4E2CEeAourwA8TdvvqLx9erSnr-uZl9_LKLYiIS_zZwQLrcL5eZNtIQKof1l-dFf9yeo-6xu-3xyLR35SsgA3Tnu_mq5TIjLLltP4HXhaUOlrKdXImCe5aaZ5tjdJW6iO7GbEYY2VWv21Vm8PWopcUyhA_-mHDN6MDUfbJbJjE0yiN1dWbb-iaeY7UbTuuZoXZi5PSUbRTxwkEwrZB75vcNkPKg8XqlQn6QyAWQ7sLX6tpHgmLRAwHCPswBK-mL2k"

const LOCAL_STORAGE_KEY = "cjmEditorDraft_v4_with_settings"

export interface CJMOperationsConfig {
  nodes: Node<CJMNodeData>[]
  edges: Edge[]
  mapSettings: MapSettings
}

export function downloadJson(jsonString: string, filename: string) {
  const blob = new Blob([jsonString], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export class CJMOperations {
  async exportToMetabot(config: CJMOperationsConfig): Promise<void> {
    const { nodes, edges, mapSettings } = config

    // Validate settings before export
    const validation = this.validateMapSettings(mapSettings)
    if (!validation.isValid) {
      throw new Error("Пожалуйста, заполните настройки карты перед экспортом")
    }

    // Загружаем API настройки из localStorage
    const apiSettings = loadApiSettings()

    // Подставляем bot_id в URL
    const apiUrl = apiSettings.endpoint.replace("{bot_id}", mapSettings.bot_id.toString())

    const jsonPayload = exportToJson(nodes, edges, mapSettings)
    const payload = JSON.parse(jsonPayload)

    toast.loading("Exporting to Metabot...")
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiSettings.bearerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload, null, 2), // Форматированный JSON
      })

      toast.dismiss()
        
      const result = await response.json()
      
      if (result.success) {
        toast.success("Successfully exported to Metabot!")
        console.log("Export successful:", result)
      } else {
        toast.error(`Export failed: ${result.message}`)
        console.error("Export failed:", result)
      }
    } catch (error) {
      toast.dismiss()
      toast.error("Export error: Could not connect to server.")
      console.error("Export error:", error)
    }
  }

  exportToJson(config: CJMOperationsConfig): string {
    const { nodes, edges, mapSettings } = config
    return exportToJson(nodes, edges, mapSettings)
  }

  importFromJson(jsonString: string): {
    nodes: Node<CJMNodeData>[]
    edges: Edge[]
    mapSettings?: MapSettings
  } {
    const result = importFromJson(jsonString)

    // Если в импортируемом JSON есть формат и версия, обновляем API настройки
    if (result.format || result.version) {
      const currentApiSettings = loadApiSettings()
      const updatedApiSettings = {
        ...currentApiSettings,
        ...(result.format && { format: result.format }),
        ...(result.version && { version: result.version }),
      }
      saveApiSettings(updatedApiSettings)
      toast.success("Формат и версия обновлены из импортированного файла")
    }

    return {
      nodes: result.nodes,
      edges: result.edges,
      mapSettings: result.mapSettings,
    }
  }

  saveDraft(config: CJMOperationsConfig): void {
    try {
      const draft = {
        nodes: config.nodes,
        edges: config.edges,
        mapSettings: config.mapSettings,
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(draft))
      toast.success("Draft saved locally!")
    } catch (error) {
      toast.error("Failed to save draft.")
      console.error("Failed to save draft:", error)
    }
  }

  loadDraft(): CJMOperationsConfig | null {
    try {
      const savedDraft = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft)
        return {
          nodes: parsed.nodes || [],
          edges: parsed.edges || [],
          mapSettings: parsed.mapSettings,
        }
      }
      return null
    } catch (error) {
      console.error("Failed to load draft:", error)
      localStorage.removeItem(LOCAL_STORAGE_KEY)
      return null
    }
  }

  private validateMapSettings(settings: MapSettings): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!settings.bot_id || settings.bot_id.toString().trim() === "") {
      errors.push("Bot ID обязателен для заполнения")
    }

    if (!settings.code || settings.code.toString().trim() === "") {
      errors.push("Код карты обязателен для заполнения")
    }

    if (!settings.title || settings.title.toString().trim() === "") {
      errors.push("Название карты обязательно для заполнения")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}

// Экспортируем синглтон
export const cjmOperations = new CJMOperations()
