"use client"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { PlusCircle, Trash2 } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

import type { CJMNode } from "@/app/cjm-editor/types"
import type { SwitchNodeData, SwitchCase } from "@/components/cjm-editor/nodes/switch-node"

interface SwitchEditorProps {
  node: CJMNode
  onUpdateData: (nodeId: string, newData: Partial<SwitchNodeData>) => void
}

function SwitchEditor({ node, onUpdateData }: SwitchEditorProps) {
  const data = node.data as SwitchNodeData

  const addCase = () => {
    const newCase: SwitchCase = {
      id: uuidv4(),
      condition: "",
      step: null,
    }
    const updatedCases = [...data.cases, newCase]
    onUpdateData(node.id, { cases: updatedCases })
  }

  const updateCase = (index: number, field: keyof SwitchCase, value: string | null) => {
    const updatedCases = [...data.cases]
    updatedCases[index] = {
      ...updatedCases[index],
      [field]: value,
    }
    onUpdateData(node.id, { cases: updatedCases })
  }

  const removeCase = (index: number) => {
    const updatedCases = data.cases.filter((_, i) => i !== index)
    onUpdateData(node.id, { cases: updatedCases })
  }

  const handleDefaultStepChange = (value: string) => {
    onUpdateData(node.id, { default_step: value || null })
  }

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-700">
          <strong>Множественное ветвление</strong> позволяет направить пользователя по одному из нескольких путей в
          зависимости от выполнения условий. Условия проверяются по порядку сверху вниз. Аналитика записывается в
          конечных точках выполнения, а не в развилке.
        </p>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">Условия:</h3>
        <Button variant="outline" size="sm" onClick={addCase} className="h-8 text-xs">
          <PlusCircle size={14} className="mr-1.5" /> Добавить условие
        </Button>
      </div>

      {data.cases.length === 0 ? (
        <div className="text-center p-4 border border-dashed border-gray-300 rounded-md">
          <p className="text-sm text-gray-500">Нет условий. Добавьте хотя бы одно условие.</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
          {data.cases.map((caseItem, index) => (
            <div key={caseItem.id} className="p-3 border border-blue-200 bg-blue-50 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-blue-700">Условие {index + 1}</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCase(index)}
                  className="h-7 w-7 text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <label htmlFor={`condition-${index}`} className="block text-xs font-medium text-gray-600 mb-1">
                    Условие (JavaScript):
                  </label>
                  <Textarea
                    id={`condition-${index}`}
                    value={caseItem.condition}
                    onChange={(e) => updateCase(index, "condition", e.target.value)}
                    rows={2}
                    className="w-full text-xs custom-scrollbar"
                    placeholder="Введите условие, например: variables.age > 18"
                  />
                </div>

                <div>
                  <label htmlFor={`step-${index}`} className="block text-xs font-medium text-gray-600 mb-1">
                    Переход к шагу:
                  </label>
                  <Input
                    id={`step-${index}`}
                    type="text"
                    value={caseItem.step || ""}
                    onChange={(e) => updateCase(index, "step", e.target.value || null)}
                    className="w-full text-xs"
                    placeholder="Код шага для перехода"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-2 border-t border-gray-200">
        <label htmlFor="default_step" className="block text-sm font-medium text-gray-600 mb-1">
          Шаг по умолчанию (если ни одно условие не выполнено):
        </label>
        <Input
          id="default_step"
          type="text"
          value={data.default_step || ""}
          onChange={(e) => handleDefaultStepChange(e.target.value)}
          className="w-full"
          placeholder="Код шага для перехода по умолчанию"
        />
      </div>
    </div>
  )
}

export default SwitchEditor
