import type { Node, Edge } from "reactflow"
import type { CJMNodeData } from "@/app/cjm-editor/page"
import type { MapSettings } from "./map-settings"
import { exportToJson, importFromJson } from "./serialization"
import { toast } from "react-hot-toast"

const METABOT_API_TOKEN =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI4NCIsImp0aSI6IjUyYzBlMWQ2ZjZjZDdhODNhNTdhOGRiZjIxYzc3NDNiNzAzYzFjMzNiM2VlMjAwMGE5ZTBiOWQ2MzlmMDA3YjI4YzlkNzc4Yzg0ZGNhODIzIiwiaWF0IjoxNzQ5NjM4NjcxLjQxNTk0MSwibmJmIjoxNzQ5NjM4NjcxLjQxNTk2OCwiZXhwIjoyMDY0OTk4NjcxLjQxMTIxNCwic3ViIjoiIiwic2NvcGVzIjpbIioiXX0.S5a4dL8HNZw9GpaDZENMFy9ZDIZEJz0m2c4CxuITFAQABz23C7WJzyh00GrHXKLb_zaOVIcOw7nSaBivKMl0nDVX-60UqfkfejkXFabZLiDyIjTbLT8-1hKuk2rOTC0sI8aypOJ76oEAWRI7wvpTLk3bs0640fLIa2Msw9jjvkwO3Db_yjvdZCOk-grD06bFnEqR7tEGYHvLri0ddmpsre16sICEeBwhhByKAMNeiFSG8bNjk5ARHx50kYy8XHbnnQHK5-G2yAAyhIHcoMo_D1wTsiELny00QlI0Vi5sndj1r_HJroJXruz8WwfhHWhUq331MLuFInkIokA1NitVmu4oA1rVTuCUKChrQReKgS6Gt08aeyvhOcNY8P8Jwvx78OpSvNmXAobxj-Q0A2oxgnT0DoVkfrBBRrtRiC7Epz4E2CEeAourwA8TdvvqLx9erSnr-uZl9_LKLYiIS_zZwQLrcL5eZNtIQKof1l-dFf9yeo-6xu-3xyLR35SsgA3Tnu_mq5TIjLLltP4HXhaUOlrKdXImCe5aaZ5tjdJW6iO7GbEYY2VWv21Vm8PWopcUyhA_-mHDN6MDUfbJbJjE0yiN1dWbb-iaeY7UbTuuZoXZi5PSUbRTxwkEwrZB75vcNkPKg8XqlQn6QyAWQ7sLX6tpHgmLRAwHCPswBK-mL2k"

const LOCAL_STORAGE_KEY = "cjmEditorDraft_v4_with_settings"

export interface CJMOperationsConfig {
  nodes: Node<CJMNodeData>[]
  edges: Edge[]
  mapSettings: MapSettings
}

export class CJMOperations {
  async exportToMetabot(config: CJMOperationsConfig): Promise<void> {
    const { nodes, edges, mapSettings } = config

    // Validate settings before export
    const validation = this.validateMapSettings(mapSettings)
    if (!validation.isValid) {
      throw new Error("Пожалуйста, заполните настройки карты перед экспортом")
    }

    const jsonPayload = exportToJson(nodes, edges, mapSettings)
    const payload = JSON.parse(jsonPayload)

    toast.loading("Exporting to Metabot...")
    try {
      const response = await fetch(`https://stage.metabot.dev/api/v1/bots/${mapSettings.bot_id}/call/cjm/save`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${METABOT_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      toast.dismiss()
      if (response.ok) {
        const result = await response.json()
        toast.success("Successfully exported to Metabot!")
        console.log("Export successful:", result)
      } else {
        const errorResult = await response.json()
        toast.error(`Export failed: ${errorResult.message || response.statusText}`)
        console.error("Export failed:", errorResult)
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
    return importFromJson(jsonString)
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
