"use client"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import type { CJMNode } from "@/app/cjm-editor/types"
import type { LogActionNodeData, LogActionType, TagAction } from "@/components/cjm-editor/nodes/log-action-node"

interface LogActionEditorProps {
  node: CJMNode
  onUpdateData: (nodeId: string, newData: Partial<LogActionNodeData>) => void
}

function LogActionEditor({ node, onUpdateData }: LogActionEditorProps) {
  const data = node.data as LogActionNodeData

  const handleFieldChange = (field: keyof LogActionNodeData, value: any) => {
    onUpdateData(node.id, { [field]: value })
  }

  const handleLogTypeChange = (newLogType: LogActionType) => {
    const updatedData: Partial<LogActionNodeData> = {
      log_type: newLogType,
      // Clear fields that don't apply to the new type
      step: newLogType === "step" ? data.step : undefined,
      event: newLogType === "event" ? data.event : undefined,
      tag: newLogType === "tag" ? data.tag : undefined,
      tag_action: newLogType === "tag" ? data.tag_action : undefined,
      utter: newLogType === "utter" ? data.utter : undefined,
    }
    onUpdateData(node.id, updatedData)
  }

  return (
    <div className="space-y-4">
      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md">
        <p className="text-sm text-emerald-700">
          <strong>Записать в аналитику</strong> позволяет зафиксировать событие, шаг, тег или высказывание в аналитике
          WayLogger для построения воронок и статистики.
        </p>
      </div>

      <div>
        <label htmlFor="log_type" className="block text-sm font-medium text-gray-600 mb-1">
          Тип записи:
        </label>
        <Select value={data.log_type} onValueChange={handleLogTypeChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Выберите тип записи" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="step">Шаг (Step)</SelectItem>
            <SelectItem value="event">Событие (Event)</SelectItem>
            <SelectItem value="tag">Тег (Tag)</SelectItem>
            <SelectItem value="utter">Высказывание (Utter)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="way" className="block text-sm font-medium text-gray-600 mb-1">
          Way (путь аналитики):
        </label>
        <Input
          id="way"
          type="text"
          value={data.way || ""}
          onChange={(e) => handleFieldChange("way", e.target.value)}
          className="w-full"
          placeholder="e.g., lead_magnet"
        />
        <p className="text-xs text-gray-500 mt-1">
          {data.log_type === "step" ? "Обязательно для типа 'step'" : "Опционально для других типов"}
        </p>
      </div>

      {data.log_type === "step" && (
        <div>
          <label htmlFor="step" className="block text-sm font-medium text-gray-600 mb-1">
            Шаг:
          </label>
          <Input
            id="step"
            type="text"
            value={data.step || ""}
            onChange={(e) => handleFieldChange("step", e.target.value)}
            className="w-full"
            placeholder="e.g., platform_selected"
          />
        </div>
      )}

      {data.log_type === "event" && (
        <div>
          <label htmlFor="event" className="block text-sm font-medium text-gray-600 mb-1">
            Событие:
          </label>
          <Input
            id="event"
            type="text"
            value={data.event || ""}
            onChange={(e) => handleFieldChange("event", e.target.value)}
            className="w-full"
            placeholder="e.g., button_clicked"
          />
        </div>
      )}

      {data.log_type === "tag" && (
        <>
          <div>
            <label htmlFor="tag" className="block text-sm font-medium text-gray-600 mb-1">
              Тег:
            </label>
            <Input
              id="tag"
              type="text"
              value={data.tag || ""}
              onChange={(e) => handleFieldChange("tag", e.target.value)}
              className="w-full"
              placeholder="e.g., interested"
            />
          </div>
          <div>
            <label htmlFor="tag_action" className="block text-sm font-medium text-gray-600 mb-1">
              Действие с тегом:
            </label>
            <Select
              value={data.tag_action || "add"}
              onValueChange={(value: TagAction) => handleFieldChange("tag_action", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите действие" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">Добавить (add)</SelectItem>
                <SelectItem value="remove">Удалить (remove)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {data.log_type === "utter" && (
        <div>
          <label htmlFor="utter" className="block text-sm font-medium text-gray-600 mb-1">
            Высказывание:
          </label>
          <Input
            id="utter"
            type="text"
            value={data.utter || ""}
            onChange={(e) => handleFieldChange("utter", e.target.value)}
            className="w-full"
            placeholder="e.g., greeting_message"
          />
        </div>
      )}

      <div>
        <label htmlFor="note" className="block text-sm font-medium text-gray-600 mb-1">
          Заметка (необязательно):
        </label>
        <Textarea
          id="note"
          value={data.note || ""}
          onChange={(e) => handleFieldChange("note", e.target.value)}
          rows={3}
          className="w-full custom-scrollbar"
          placeholder="Пояснение для разработчика..."
        />
      </div>
    </div>
  )
}

export default LogActionEditor
