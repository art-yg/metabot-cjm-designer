"use client"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import type { CJMNode } from "@/app/cjm-editor/types"
import type { GoToMapEntryNodeData } from "@/components/cjm-editor/nodes/go-to-map-entry-node"

interface GoToMapEntryEditorProps {
  node: CJMNode
  onUpdateData: (nodeId: string, newData: Partial<GoToMapEntryNodeData>) => void
}

function GoToMapEntryEditor({ node, onUpdateData }: GoToMapEntryEditorProps) {
  const data = node.data as GoToMapEntryNodeData

  const handleFieldChange = (field: keyof GoToMapEntryNodeData, value: string) => {
    onUpdateData(node.id, { [field]: value })
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="target_map" className="block text-sm font-medium text-gray-600 mb-1">
          Код целевой воронки:
        </label>
        <Input
          id="target_map"
          type="text"
          value={data.target_map}
          onChange={(e) => handleFieldChange("target_map", e.target.value)}
          className="w-full"
          placeholder="e.g., sales_funnel"
        />
      </div>

      <div>
        <label htmlFor="entry_point" className="block text-sm font-medium text-gray-600 mb-1">
          Код точки входа:
        </label>
        <Input
          id="entry_point"
          type="text"
          value={data.entry_point}
          onChange={(e) => handleFieldChange("entry_point", e.target.value)}
          className="w-full"
          placeholder="e.g., start_sales"
        />
      </div>

      <div>
        <label htmlFor="note" className="block text-sm font-medium text-gray-600 mb-1">
          Описание перехода (необязательно):
        </label>
        <Textarea
          id="note"
          value={data.note || ""}
          onChange={(e) => handleFieldChange("note", e.target.value)}
          rows={3}
          className="w-full custom-scrollbar"
          placeholder="Подсказка о назначении перехода..."
        />
      </div>

      <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
        <p className="text-sm text-purple-700">
          <strong>Переход в воронку</strong> завершает текущий сценарий и запускает другую CJM-карту с указанной точки
          входа.
        </p>
      </div>
    </div>
  )
}

export default GoToMapEntryEditor
