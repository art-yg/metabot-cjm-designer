"use client"
import { Input } from "@/components/ui/input"
import DeepLinkSection from "../deep-link-section"
import type { DeepLink } from "@/lib/deep-link-types"
import type { MapSettings } from "@/lib/map-settings"

import type { CJMNode } from "@/app/cjm-designer/types"
import type { EntryPointNodeData } from "@/components/cjm-designer/nodes/entry-point-node"

interface EntryPointEditorProps {
  node: CJMNode
  onUpdateData: (nodeId: string, newData: Partial<EntryPointNodeData>) => void
  mapSettings: MapSettings
}

function EntryPointEditor({ node, onUpdateData, mapSettings }: EntryPointEditorProps) {
  const data = node.data as EntryPointNodeData

  const handleNameChange = (name: string) => {
    onUpdateData(node.id, { name })
  }

  const handleDeepLinksChange = (deepLinks: DeepLink[]) => {
    onUpdateData(node.id, { deep_links: deepLinks })
  }

  // Получаем настройки каналов из mapSettings
  const channels = mapSettings?.channels || {
    telegram_bot_name: "",
    whatsapp_phone_number: "",
    vk_group_name: "",
    use_chat_widget: false,
  }

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1">
          Название точки входа:
        </label>
        <Input
          id="name"
          type="text"
          value={data.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="w-full"
          placeholder="e.g., Стартовая точка"
        />
      </div>

      <DeepLinkSection deepLinks={data.deep_links || []} channels={channels} onUpdate={handleDeepLinksChange} />

      <div className="p-3 bg-green-50 border border-green-200 rounded-md">
        <p className="text-sm text-green-700">
          <strong>Точка входа</strong> определяет начальную точку сценария. Из других воронок можно ссылаться на эту
          точку по её коду.
        </p>
      </div>
    </div>
  )
}

export default EntryPointEditor
