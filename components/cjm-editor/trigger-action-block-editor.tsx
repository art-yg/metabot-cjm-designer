"use client"

import type React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tag, ArrowRight, Clock, Calendar, X } from "lucide-react"
import TagsInput from "./tags-input" // Исправил импорт - это default export
import type { TriggerActionBlock } from "@/lib/trigger-types"

interface TriggerActionBlockEditorProps {
  actionBlock?: TriggerActionBlock
  onChange: (updatedBlock: TriggerActionBlock | undefined) => void
  title: string
}

const TriggerActionBlockEditor: React.FC<TriggerActionBlockEditorProps> = ({ actionBlock, onChange, title }) => {
  // Обеспечиваем что у нас всегда есть массивы для тегов
  const addTags = actionBlock?.add_tags || []
  const removeTags = actionBlock?.remove_tags || []

  const updateActionBlock = (updates: Partial<TriggerActionBlock>) => {
    const updatedBlock: TriggerActionBlock = {
      add_tags: [],
      remove_tags: [],
      ...actionBlock,
      ...updates,
    }

    // Если все поля пустые, возвращаем undefined для очистки
    const isEmpty =
      (!updatedBlock.add_tags || updatedBlock.add_tags.length === 0) &&
      (!updatedBlock.remove_tags || updatedBlock.remove_tags.length === 0) &&
      (!updatedBlock.next_step || updatedBlock.next_step.trim() === "") &&
      (updatedBlock.run_after_minutes === null || updatedBlock.run_after_minutes === undefined) &&
      (!updatedBlock.run_at_datetime || updatedBlock.run_at_datetime.trim() === "")

    onChange(isEmpty ? undefined : updatedBlock)
  }

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
      <h4 className="text-sm font-medium text-gray-700 flex items-center">{title}</h4>

      {/* Add Tags Section */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-green-700 flex items-center">
          <Tag className="h-3 w-3 mr-1" />
          Добавить теги
        </Label>
        <TagsInput
          tags={addTags}
          onChange={(tags) => updateActionBlock({ add_tags: tags })}
          placeholder="Введите тег и нажмите Enter"
          className="text-xs"
          variant="add"
        />
      </div>

      {/* Remove Tags Section */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-red-700 flex items-center">
          <X className="h-3 w-3 mr-1" />
          Удалить теги
        </Label>
        <TagsInput
          tags={removeTags}
          onChange={(tags) => updateActionBlock({ remove_tags: tags })}
          placeholder="Введите тег и нажмите Enter"
          className="text-xs"
          variant="remove"
        />
      </div>

      {/* Next Step */}
      <div className="space-y-2">
        <Label htmlFor="next-step" className="text-xs font-medium text-blue-700 flex items-center">
          <ArrowRight className="h-3 w-3 mr-1" />
          Следующий шаг (создает выход)
        </Label>
        <Input
          id="next-step"
          value={actionBlock?.next_step || ""}
          onChange={(e) => updateActionBlock({ next_step: e.target.value || null })}
          placeholder="например, step_code_123"
          className="text-xs"
        />
      </div>

      {/* Timing Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="run-after" className="text-xs font-medium text-orange-700 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Запустить через (минут)
          </Label>
          <Input
            id="run-after"
            type="number"
            value={
              actionBlock?.run_after_minutes === null || actionBlock?.run_after_minutes === undefined
                ? ""
                : String(actionBlock.run_after_minutes)
            }
            onChange={(e) =>
              updateActionBlock({
                run_after_minutes: e.target.value === "" ? null : Number.parseInt(e.target.value, 10),
              })
            }
            placeholder="например, 30"
            className="text-xs"
            min="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="run-at" className="text-xs font-medium text-purple-700 flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            Запустить в (дата и время)
          </Label>
          <Input
            id="run-at"
            type="datetime-local"
            value={actionBlock?.run_at_datetime || ""}
            onChange={(e) => updateActionBlock({ run_at_datetime: e.target.value || null })}
            className="text-xs"
          />
        </div>
      </div>
    </div>
  )
}

export default TriggerActionBlockEditor
