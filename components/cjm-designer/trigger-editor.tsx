"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Trash2, Calendar } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import type { Trigger, TriggerActionBlock, TriggerEventType } from "@/lib/trigger-types"
import TriggerActionBlockEditor from "./trigger-action-block-editor"

interface TriggerEditorProps {
  trigger: Trigger
  onChange: (updatedTrigger: Trigger) => void
  onDelete: () => void
  allowedEventTypes?: TriggerEventType[]
  context?: "link" | "custom"
  parentCode?: string // e.g., link code or step code
  autoGenerateTags?: boolean
}

const EVENT_TYPE_LABELS: Record<TriggerEventType | "none", string> = {
  link_clicked: "Клик по ссылке",
  link_ignored: "Игнор ссылки",
  custom_timer: "Кастомный таймер",
  tag_added: "Тег добавлен",
  tag_removed: "Тег удален",
  status_changed: "Статус изменен",
  none: "Без события",
}

const TriggerEditor: React.FC<TriggerEditorProps> = ({
  trigger,
  onChange,
  onDelete,
  allowedEventTypes = ["link_clicked", "link_ignored", "custom_timer"],
  context = "custom",
  parentCode = "",
  autoGenerateTags = true,
}) => {
  const [showJsCondition, setShowJsCondition] = useState(false)

  const generateJsCondition = useCallback(
    (eventType: TriggerEventType, eventVal: string, currentTrigger: Trigger): string => {
      if (context === "link" && parentCode) {
        const clickedTag = `link_clicked_${eventVal || parentCode}`
        const ignoredTag = `link_ignored_${eventVal || parentCode}`

        if (eventType === "link_clicked") {
          return `return !lead.isTagExist('${clickedTag}') && !lead.isTagExist('${ignoredTag}');`
        }
        if (eventType === "link_ignored") {
          return `return !lead.isTagExist('${clickedTag}') && !lead.isTagExist('${ignoredTag}');`
        }
      }
      return currentTrigger.js_condition || "return true;"
    },
    [context, parentCode],
  )

  const handleFieldChange = <K extends keyof Trigger>(field: K, value: Trigger[K]) => {
    const newTrigger = { ...trigger, [field]: value }

    if (field === "event_type" || (field === "event_value" && context === "link")) {
      const eventType = field === "event_type" ? (value as TriggerEventType) : newTrigger.event_type
      const eventVal = field === "event_value" ? (value as string) : newTrigger.event_value || parentCode

      if (!newTrigger.is_js_condition_custom) {
        newTrigger.js_condition = generateJsCondition(eventType, eventVal, newTrigger)
      }

      if (autoGenerateTags && context === "link" && parentCode) {
        const baseTag = `${eventType}_${eventVal || parentCode}`
        if (eventType === "link_clicked" || eventType === "link_ignored") {
          newTrigger.on_true = {
            ...(newTrigger.on_true || {}),
            add_tags: Array.from(new Set([...(newTrigger.on_true?.add_tags || []), baseTag])),
          }
        }
      }
    }

    if (field === "js_condition") {
      newTrigger.is_js_condition_custom = true
    }

    onChange(newTrigger)
  }

  const handleEventTypeChange = (value: string) => {
    if (value === "none") {
      handleFieldChange("event_type", undefined as any)
    } else {
      handleFieldChange("event_type", value as TriggerEventType)
    }
  }

  const handleActionBlockChange = (blockType: "on_true" | "on_false", updatedBlock: TriggerActionBlock | undefined) => {
    handleFieldChange(blockType, updatedBlock)
  }

  const formatDateTime = (dateTimeString: string | null): string => {
    if (!dateTimeString) return ""
    try {
      const date = new Date(dateTimeString)
      return format(date, "dd.MM.yyyy HH:mm", { locale: ru })
    } catch {
      return dateTimeString
    }
  }

  useEffect(() => {
    if (
      trigger.event_type === "link_ignored" &&
      (trigger.run_after_minutes === null || trigger.run_after_minutes === undefined)
    ) {
      // console.warn(`Trigger ${trigger.code} with event_type 'link_ignored' should have 'run_after_minutes' set.`);
    }
  }, [trigger.event_type, trigger.run_after_minutes, trigger.code])

  const currentEventType = trigger.event_type || "none"

  return (
    <div className="space-y-4 p-4 border rounded-lg shadow-sm bg-white">
      <div className="flex justify-between items-center">
        <Input
          value={trigger.title || ""}
          onChange={(e) => handleFieldChange("title", e.target.value)}
          placeholder="Название триггера (опционально)"
          className="text-sm font-medium flex-grow mr-2"
        />
        <div className="flex items-center space-x-2">
          <Label htmlFor={`active-${trigger.id}`} className="text-xs">
            Активен
          </Label>
          <Switch
            id={`active-${trigger.id}`}
            checked={trigger.active}
            onCheckedChange={(checked) => handleFieldChange("active", checked)}
          />
          <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Удалить триггер">
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`event-type-${trigger.id}`} className="text-xs font-medium">
            Тип события
          </Label>
          <Select value={currentEventType} onValueChange={handleEventTypeChange}>
            <SelectTrigger id={`event-type-${trigger.id}`} className="text-xs">
              <SelectValue placeholder="Выберите тип события" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-xs text-gray-500">
                Без события
              </SelectItem>
              {allowedEventTypes.map((type) => (
                <SelectItem key={type} value={type} className="text-xs">
                  {EVENT_TYPE_LABELS[type] || type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor={`event-value-${trigger.id}`} className="text-xs font-medium">
            Значение события
          </Label>
          <Input
            id={`event-value-${trigger.id}`}
            value={trigger.event_value || (context === "link" ? parentCode : "")}
            onChange={(e) => handleFieldChange("event_value", e.target.value)}
            placeholder={context === "link" ? "Код ссылки (авто)" : "например: имя_тега, значение_статуса"}
            className="text-xs"
            disabled={
              context === "link" && (trigger.event_type === "link_clicked" || trigger.event_type === "link_ignored")
            }
          />
          {context === "link" && (trigger.event_type === "link_clicked" || trigger.event_type === "link_ignored") && (
            <p className="text-xs text-slate-500 mt-1">Значение события - это код ссылки для данного контекста.</p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor={`run-after-${trigger.id}`} className="text-xs font-medium">
            Запустить через (минут)
          </Label>
          <Input
            id={`run-after-${trigger.id}`}
            type="number"
            value={
              trigger.run_after_minutes === null || trigger.run_after_minutes === undefined
                ? ""
                : String(trigger.run_after_minutes)
            }
            onChange={(e) =>
              handleFieldChange("run_after_minutes", e.target.value === "" ? null : Number.parseInt(e.target.value, 10))
            }
            placeholder="например: 30 (обязательно для игнора ссылки)"
            className="text-xs"
            min="0"
          />
          {trigger.event_type === "link_ignored" &&
            (trigger.run_after_minutes === null || trigger.run_after_minutes === undefined) && (
              <p className="text-xs text-red-500 mt-1">Обязательно для типа события 'Игнор ссылки'.</p>
            )}
        </div>

        <div>
          <Label htmlFor={`run-at-${trigger.id}`} className="text-xs font-medium">
            Запустить в конкретную дату и время
          </Label>
          <div className="flex gap-2">
            <Input
              id={`run-at-${trigger.id}`}
              type="datetime-local"
              value={trigger.run_at_datetime || ""}
              onChange={(e) => handleFieldChange("run_at_datetime", e.target.value || null)}
              className="text-xs flex-1"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Calendar className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="single"
                  selected={trigger.run_at_datetime ? new Date(trigger.run_at_datetime) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const currentTime = trigger.run_at_datetime
                        ? new Date(trigger.run_at_datetime).toTimeString().slice(0, 5)
                        : "12:00"
                      const dateTimeString = `${date.toISOString().slice(0, 10)}T${currentTime}`
                      handleFieldChange("run_at_datetime", dateTimeString)
                    } else {
                      handleFieldChange("run_at_datetime", null)
                    }
                  }}
                  locale={ru}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          {trigger.run_at_datetime && (
            <p className="text-xs text-slate-500 mt-1">Выбрано: {formatDateTime(trigger.run_at_datetime)}</p>
          )}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <Label htmlFor={`js-condition-${trigger.id}`} className="text-xs font-medium">
            JS Условие {trigger.is_js_condition_custom && <span className="text-orange-500">(Кастомное)</span>}
          </Label>
          <Button variant="ghost" size="sm" onClick={() => setShowJsCondition(!showJsCondition)} className="text-xs">
            {showJsCondition ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
            {showJsCondition ? "Скрыть" : "Показать/Редактировать"}
          </Button>
        </div>
        {showJsCondition && (
          <Textarea
            id={`js-condition-${trigger.id}`}
            value={trigger.js_condition || ""}
            onChange={(e) => handleFieldChange("js_condition", e.target.value)}
            placeholder="return true; // По умолчанию если пусто"
            rows={3}
            className="text-xs font-mono custom-scrollbar"
          />
        )}
      </div>

      <Tabs defaultValue="on_true" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="on_true" className="text-xs">
            Условие True
          </TabsTrigger>
          <TabsTrigger value="on_false" className="text-xs">
            Условие False
          </TabsTrigger>
        </TabsList>
        <TabsContent value="on_true">
          <TriggerActionBlockEditor
            actionBlock={trigger.on_true}
            onChange={(block) => handleActionBlockChange("on_true", block)}
            title="Действия если условие выполнено"
          />
        </TabsContent>
        <TabsContent value="on_false">
          <TriggerActionBlockEditor
            actionBlock={trigger.on_false}
            onChange={(block) => handleActionBlockChange("on_false", block)}
            title="Действия если условие не выполнено"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default TriggerEditor
