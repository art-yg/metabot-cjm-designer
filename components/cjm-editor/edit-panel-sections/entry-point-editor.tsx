"use client"
import { Input } from "@/components/ui/input"

import type { CJMNode } from "@/app/cjm-editor/types"
import type { EntryPointNodeData } from "@/components/cjm-editor/nodes/entry-point-node"

interface EntryPointEditorProps {
  node: CJMNode
  onUpdateData: (nodeId: string, newData: Partial<EntryPointNodeData>) => void
}

function EntryPointEditor({ node, onUpdateData }: EntryPointEditorProps) {
  const data = node.data as EntryPointNodeData

  const handleNameChange = (name: string) => {
    onUpdateData(node.id, { name })
  }

  return (
    <div className="space-y-4">
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
