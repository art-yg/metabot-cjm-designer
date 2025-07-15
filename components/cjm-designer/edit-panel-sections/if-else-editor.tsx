"use client"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import type { CJMNode } from "@/app/cjm-editor/types"
import type { IfElseNodeData } from "@/components/cjm-editor/nodes/if-else-node"

interface IfElseEditorProps {
  node: CJMNode
  onUpdateData: (nodeId: string, newData: Partial<IfElseNodeData>) => void
}

function IfElseEditor({ node, onUpdateData }: IfElseEditorProps) {
  const data = node.data as IfElseNodeData

  const handleFieldChange = (field: keyof IfElseNodeData, value: string | null) => {
    onUpdateData(node.id, { [field]: value })
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="condition" className="block text-sm font-medium text-gray-600 mb-1">
          Условие (JavaScript):
        </label>
        <Textarea
          id="condition"
          value={data.condition}
          onChange={(e) => handleFieldChange("condition", e.target.value)}
          rows={4}
          className="w-full custom-scrollbar"
          placeholder="Введите условие на JavaScript, например: lead.hasTag('vip')"
        />
        <p className="text-xs text-gray-500 mt-1">
          Условие должно возвращать true или false. Доступны переменные: lead, variables, bot.
        </p>
      </div>

      <div>
        <label htmlFor="next_step" className="block text-sm font-medium text-gray-600 mb-1">
          Шаг если ИСТИНА (THEN):
        </label>
        <Input
          id="next_step"
          type="text"
          value={data.next_step || ""}
          onChange={(e) => handleFieldChange("next_step", e.target.value || null)}
          className="w-full"
          placeholder="Код шага для перехода"
        />
      </div>

      <div>
        <label htmlFor="else_step" className="block text-sm font-medium text-gray-600 mb-1">
          Шаг если ЛОЖЬ (ELSE):
        </label>
        <Input
          id="else_step"
          type="text"
          value={data.else_step || ""}
          onChange={(e) => handleFieldChange("else_step", e.target.value || null)}
          className="w-full"
          placeholder="Код шага для перехода"
        />
      </div>

      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm text-yellow-700">
          <strong>Условное ветвление</strong> позволяет направить пользователя по одному из двух путей в зависимости от
          выполнения условия. Аналитика записывается в конечных точках выполнения, а не в развилке.
        </p>
      </div>
    </div>
  )
}

export default IfElseEditor
