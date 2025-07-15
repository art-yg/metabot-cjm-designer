"use client"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import type { CJMNode } from "@/app/cjm-designer/types"
import type { CustomFieldNodeData } from "@/components/cjm-designer/nodes/custom-field-node"

interface CustomFieldEditorProps {
  node: CJMNode
  onUpdateData: (nodeId: string, newData: Partial<CustomFieldNodeData>) => void
}

function CustomFieldEditor({ node, onUpdateData }: CustomFieldEditorProps) {
  const data = node.data as CustomFieldNodeData

  const handleFieldChange = (field: keyof CustomFieldNodeData, value: any) => {
    onUpdateData(node.id, { [field]: value })
  }

  const renderValueInput = () => {
    switch (data.value_type) {
      case "boolean":
        return (
          <Select value={data.value} onValueChange={(value) => handleFieldChange("value", value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Выберите значение" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Да (true)</SelectItem>
              <SelectItem value="false">Нет (false)</SelectItem>
            </SelectContent>
          </Select>
        )
      case "number":
        return (
          <Input
            type="number"
            value={data.value}
            onChange={(e) => handleFieldChange("value", e.target.value)}
            className="w-full"
            placeholder="Введите число"
          />
        )
      case "datetime":
        return (
          <Input
            type="datetime-local"
            value={data.value}
            onChange={(e) => handleFieldChange("value", e.target.value)}
            className="w-full"
          />
        )
      case "json":
        return (
          <Textarea
            value={data.value}
            onChange={(e) => handleFieldChange("value", e.target.value)}
            rows={4}
            className="w-full custom-scrollbar"
            placeholder='{"key": "value"}'
          />
        )
      default: // string
        return (
          <Input
            type="text"
            value={data.value}
            onChange={(e) => handleFieldChange("value", e.target.value)}
            className="w-full"
            placeholder="Введите значение"
          />
        )
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="scope" className="block text-sm font-medium text-gray-600 mb-1">
          Область применения:
        </label>
        <Select value={data.scope} onValueChange={(value: "lead" | "bot") => handleFieldChange("scope", value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Выберите область" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lead">Лид (пользователь)</SelectItem>
            <SelectItem value="bot">Бот</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 mt-1">
          Лид — поле сохраняется для конкретного пользователя, Бот — глобальное поле бота
        </p>
      </div>

      <div>
        <label htmlFor="key" className="block text-sm font-medium text-gray-600 mb-1">
          Название поля:
        </label>
        <Input
          id="key"
          type="text"
          value={data.key}
          onChange={(e) => handleFieldChange("key", e.target.value)}
          className="w-full"
          placeholder="e.g., last_payment_date"
        />
      </div>

      <div>
        <label htmlFor="value_type" className="block text-sm font-medium text-gray-600 mb-1">
          Тип значения:
        </label>
        <Select
          value={data.value_type}
          onValueChange={(value: CustomFieldNodeData["value_type"]) => {
            handleFieldChange("value_type", value)
            handleFieldChange("value", value === "boolean" ? "true" : "")
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Выберите тип" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="string">Текст (string)</SelectItem>
            <SelectItem value="number">Число (number)</SelectItem>
            <SelectItem value="boolean">Да/Нет (boolean)</SelectItem>
            <SelectItem value="datetime">Дата и время</SelectItem>
            <SelectItem value="json">JSON объект</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="value" className="block text-sm font-medium text-gray-600 mb-1">
          Значение:
        </label>
        {renderValueInput()}
      </div>

      <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-md">
        <p className="text-sm text-indigo-700">
          <strong>Кастомные поля</strong> позволяют сохранять дополнительную информацию о пользователях или боте для
          использования в других частях сценария.
        </p>
      </div>
    </div>
  )
}

export default CustomFieldEditor
