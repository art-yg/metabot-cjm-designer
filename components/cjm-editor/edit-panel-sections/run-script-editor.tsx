"use client"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import type { CJMNode } from "@/app/cjm-editor/types"
import type { RunScriptNodeData } from "@/components/cjm-editor/nodes/run-script-node"

interface RunScriptEditorProps {
  node: CJMNode
  onUpdateData: (nodeId: string, newData: Partial<RunScriptNodeData>) => void
}

function RunScriptEditor({ node, onUpdateData }: RunScriptEditorProps) {
  const data = node.data as RunScriptNodeData

  const handleFieldChange = (field: keyof RunScriptNodeData, value: string) => {
    onUpdateData(node.id, { [field]: value })
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="script_code" className="block text-sm font-medium text-gray-600 mb-1">
          Код скрипта для выполнения:
        </label>
        <Input
          id="script_code"
          type="text"
          value={data.script_code}
          onChange={(e) => handleFieldChange("script_code", e.target.value)}
          className="w-full"
          placeholder="e.g., send_welcome_email"
        />
        <p className="text-xs text-gray-500 mt-1">Название функции или скрипта для выполнения</p>
      </div>

      <div>
        <label htmlFor="note" className="block text-sm font-medium text-gray-600 mb-1">
          Заметка (описание):
        </label>
        <Textarea
          id="note"
          value={data.note || ""}
          onChange={(e) => handleFieldChange("note", e.target.value)}
          rows={3}
          className="w-full custom-scrollbar"
          placeholder="Краткое описание того, что делает скрипт..."
        />
        <p className="text-xs text-gray-500 mt-1">Будет отображаться под нодой для удобства</p>
      </div>

      <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
        <p className="text-sm text-amber-700">
          <strong>Запуск скрипта</strong> выполняет пользовательский код или функцию. Это терминальная команда - после
          выполнения сценарий завершается.
        </p>
      </div>
    </div>
  )
}

export default RunScriptEditor
