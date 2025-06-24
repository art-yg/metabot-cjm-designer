"use client"

import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, Clock, Trash2 } from "lucide-react" // Added PlusCircle, Clock

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { X, Save, Settings2 } from "lucide-react"
import { toast } from "react-hot-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button" // Assuming you have a Button component
import { Input } from "@/components/ui/input"

// Update the import statement to include the new type
import type { CJMNode, CJMNodeData } from "@/app/cjm-editor/page" // This will now include RunScriptNodeData
import type { SendTextNodeData, ChannelContent } from "./nodes/send-text-node"
import type { ValueInputNodeData, ReminderItem } from "./nodes/value-input-node" // Assuming this is still used
import ChannelOverrideEditor from "./channel-override-editor"
import ReminderItemEditor from "./reminder-item-editor" // Added
import ButtonEditor from "./button-editor" // Added
import type { Channel } from "@/lib/format-presets"
import { CHANNEL_FRIENDLY_NAMES } from "@/lib/format-presets"
import { v4 as uuidv4 } from "uuid" // Added
// Add import for the new node type
import type { RunScriptNodeData } from "./nodes/run-script-node"
import type { EntryPointNodeData } from "./nodes/entry-point-node"
import type { GoToMapEntryNodeData } from "./nodes/go-to-map-entry-node"
import type { WaitNodeData } from "./nodes/wait-node"
import type { TagsNodeData } from "./nodes/tags-node"
import type { CustomFieldNodeData } from "./nodes/custom-field-node"
import TagsInput from "./tags-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// Add imports for the new node types
import type { IfElseNodeData } from "./nodes/if-else-node"
import type { SwitchNodeData, SwitchCase } from "./nodes/switch-node"
import type { LogActionNodeData, LogActionType, TagAction } from "./nodes/log-action-node"
import LogWaySection from "./log-way-section"

interface EditPanelProps {
  node: CJMNode
  onClose: () => void
  onUpdateData: (nodeId: string, newData: Partial<CJMNodeData>) => void
}

// For ValueInputNode (existing logic)
const VALIDATION_TEMPLATES: Record<string, string> = {
  "regexp.email": String.raw`^[\w._%+-]+@[\w.-]+\.[a-zA-Z]{2,}$`,
  "regexp.phone": String.raw`^\+?\d{10,15}$`,
  "regexp.number": String.raw`^[\d]+$`,
}
function getTemplateFromRegexp(regexp: string | undefined): string {
  if (!regexp) return "none"
  const found = Object.entries(VALIDATION_TEMPLATES).find(([, value]) => value === regexp)
  return found ? found[0] : "regexp.custom"
}

function ValueInputForm({
  data,
  setData,
}: {
  data: ValueInputNodeData
  setData: React.Dispatch<React.SetStateAction<CJMNodeData>>
}) {
  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateKey = e.target.value
    let newRegexp = VALIDATION_TEMPLATES[templateKey] || data.regexp || ""
    if (templateKey === "none") {
      newRegexp = ""
    }
    setData((prev) => ({ ...prev, validation_template: templateKey, regexp: newRegexp }) as ValueInputNodeData)
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="variable" className="block text-sm font-medium text-gray-600 mb-1">
          Variable Name:
        </label>
        <input
          id="variable"
          type="text"
          value={data.variable}
          onChange={(e) => setData((prev) => ({ ...prev, variable: e.target.value }))}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., user_email"
        />
      </div>
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-600 mb-1">
          Prompt Message:
        </label>
        <textarea
          id="prompt"
          value={data.prompt}
          onChange={(e) => setData((prev) => ({ ...prev, prompt: e.target.value }))}
          rows={4}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 custom-scrollbar"
          placeholder="Enter the question for the user..."
        />
      </div>
      <div>
        <label htmlFor="validation_template" className="block text-sm font-medium text-gray-600 mb-1">
          Validation Template:
        </label>
        <select
          id="validation_template"
          value={data.validation_template || ""}
          onChange={handleTemplateChange}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="none">No Validation</option>
          <option value="regexp.email">Email</option>
          <option value="regexp.phone">Phone</option>
          <option value="regexp.number">Number</option>
          <option value="regexp.custom">Custom</option>
        </select>
      </div>
      {data.validation_template === "regexp.custom" && (
        <div>
          <label htmlFor="regexp" className="block text-sm font-medium text-gray-600 mb-1">
            Custom RegExp:
          </label>
          <input
            id="regexp"
            type="text"
            value={data.regexp}
            onChange={(e) => setData((prev) => ({ ...prev, regexp: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter custom regular expression"
            disabled={data.validation_template !== "regexp.custom"}
          />
        </div>
      )}
      <div>
        <label htmlFor="errmsg" className="block text-sm font-medium text-gray-600 mb-1">
          Error Message:
        </label>
        <input
          id="errmsg"
          type="text"
          value={data.errmsg || ""}
          onChange={(e) => setData((prev) => ({ ...prev, errmsg: e.target.value }))}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., Invalid input, please try again."
        />
      </div>
      <div>
        <label htmlFor="exit_condition" className="block text-sm font-medium text-gray-600 mb-1">
          Exit Condition (RegExp):
        </label>
        <input
          id="exit_condition"
          type="text"
          value={data.exit_condition || ""}
          onChange={(e) => setData((prev) => ({ ...prev, exit_condition: e.target.value }))}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., стоп|отмена|не хочу"
        />
      </div>

      {/* Reminders Section */}
      <div className="space-y-3 pt-4 mt-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id="enable-reminders"
              checked={!!(data.reminders && data.reminders.length > 0)}
              onCheckedChange={(checked) => {
                if (checked) {
                  // Add a default first reminder if enabling and none exist
                  const newReminder: ReminderItem = {
                    id: uuidv4(),
                    delay_sec: 60,
                    content: "This is a reminder.",
                    // content_per_channel не указываем, будет undefined
                  }
                  setData((prev) => ({ ...prev, reminders: [newReminder] }))
                } else {
                  // Clear reminders if disabling
                  setData((prev) => ({ ...prev, reminders: [] }))
                }
              }}
            />
            <Label htmlFor="enable-reminders" className="text-sm font-medium text-gray-700 flex items-center">
              <Clock size={16} className="mr-2 text-orange-600" />
              Enable Reminders
            </Label>
          </div>
          {data.reminders && data.reminders.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newReminder: ReminderItem = {
                  id: uuidv4(),
                  delay_sec: (data.reminders?.slice(-1)[0]?.delay_sec || 0) + 60,
                  content: "Another reminder.",
                  // content_per_channel не указываем, будет undefined
                }
                setData((prev) => ({
                  ...prev,
                  reminders: [...(prev.reminders || []), newReminder],
                }))
              }}
              className="h-8 text-xs"
            >
              <PlusCircle size={14} className="mr-1.5" /> Add Reminder
            </Button>
          )}
        </div>

        {data.reminders && data.reminders.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-1">
            {data.reminders.map((reminder, index) => (
              <Accordion key={reminder.id} type="single" collapsible className="w-full">
                <AccordionItem value={`reminder-${reminder.id}`} className="border-none">
                  <AccordionTrigger className="text-xs py-1.5 px-2 bg-slate-100 hover:bg-slate-200 rounded-md hover:no-underline">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">
                        Reminder {index + 1} ({reminder.delay_sec}s)
                      </span>
                      <span className="text-slate-500 text-xs truncate max-w-[150px] mr-2">{reminder.content}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-0 pb-0">
                    <ReminderItemEditor
                      reminder={reminder}
                      index={index}
                      onUpdateReminder={(updatedReminder) => {
                        setData((prev) => ({
                          ...prev,
                          reminders: (prev.reminders || []).map((r) =>
                            r.id === updatedReminder.id ? updatedReminder : r,
                          ),
                        }))
                      }}
                      onDeleteReminder={(reminderId) => {
                        setData((prev) => ({
                          ...prev,
                          reminders: (prev.reminders || []).filter((r) => r.id !== reminderId),
                        }))
                      }}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </div>
        )}
      </div>

      {/* Timeout Section */}
      <div className="space-y-3 pt-4 mt-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id="enable-timeout"
              checked={!!(data.timeout && data.timeout.timeout_seconds > 0)}
              onCheckedChange={(checked) => {
                if (checked) {
                  // Enable timeout with default values
                  const newTimeout = {
                    timeout_seconds: 120, // Default 2 minutes
                    exit_step: null,
                  }
                  setData((prev) => ({ ...prev, timeout: newTimeout }))
                } else {
                  // Disable timeout
                  setData((prev) => ({ ...prev, timeout: undefined }))
                }
              }}
            />
            <Label htmlFor="enable-timeout" className="text-sm font-medium text-gray-700 flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded-full mr-2" />
              Enable Timeout Exit
            </Label>
          </div>
        </div>

        {data.timeout && data.timeout.timeout_seconds > 0 && (
          <div className="space-y-3 p-3 bg-blue-50 rounded-md border border-blue-200">
            <div>
              <label htmlFor="timeout_seconds" className="block text-sm font-medium text-gray-600 mb-1">
                Timeout Duration (seconds):
              </label>
              <input
                id="timeout_seconds"
                type="number"
                min="10"
                value={data.timeout.timeout_seconds}
                onChange={(e) => {
                  const seconds = Math.max(10, Number.parseInt(e.target.value, 10) || 10)
                  setData((prev) => ({
                    ...prev,
                    timeout: { ...prev.timeout!, timeout_seconds: seconds },
                  }))
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 120"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum: 10 seconds</p>
            </div>
            <div>
              <label htmlFor="timeout_exit_step" className="block text-sm font-medium text-gray-600 mb-1">
                Timeout Exit Step:
              </label>
              <input
                id="timeout_exit_step"
                type="text"
                value={data.timeout.exit_step || ""}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    timeout: { ...prev.timeout!, exit_step: e.target.value || null },
                  }))
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter step code for timeout exit"
              />
              <p className="text-xs text-gray-500 mt-1">Step to execute when timeout occurs</p>
            </div>
          </div>
        )}
      </div>
      {/* Analytics Section */}
      <LogWaySection
        logWayData={data.log_way_steps}
        onLogWayChange={(logWayData) => {
          setData((prev) => ({
            ...(prev as ValueInputNodeData),
            log_way_steps: logWayData,
          }))
        }}
      />
    </div>
  )
}

function SendTextForm({
  data,
  setData,
}: {
  data: SendTextNodeData
  setData: React.Dispatch<React.SetStateAction<CJMNodeData>>
}) {
  const [customizePerChannel, setCustomizePerChannel] = useState(
    !!data.content_per_channel && Object.keys(data.content_per_channel).length > 0,
  )

  // Новое состояние для записи значений кнопок
  const [enableButtonValues, setEnableButtonValues] = useState(
    !!(data.buttons_value_target && data.buttons_value_target.key),
  )

  const handleChannelDataChange = (channel: Channel, channelContent: ChannelContent | null) => {
    setData((prev) => {
      const currentSendTextData = prev as SendTextNodeData
      const newContentPerChannel = { ...(currentSendTextData.content_per_channel || {}) }
      if (channelContent === null) {
        delete newContentPerChannel[channel]
      } else {
        newContentPerChannel[channel] = channelContent
      }
      // If all overrides are removed, turn off customization
      if (Object.keys(newContentPerChannel).length === 0) {
        setCustomizePerChannel(false)
        return { ...currentSendTextData, content_per_channel: undefined } // Set to undefined to remove from JSON
      }
      return { ...currentSendTextData, content_per_channel: newContentPerChannel }
    })
  }

  const toggleCustomizePerChannel = (checked: boolean) => {
    setCustomizePerChannel(checked)
    if (!checked) {
      // If toggling off, clear all channel-specific content
      setData((prev) => ({ ...(prev as SendTextNodeData), content_per_channel: undefined }))
    } else {
      // If toggling on and no data exists, initialize content_per_channel
      setData((prev) => {
        const currentData = prev as SendTextNodeData
        if (!currentData.content_per_channel) {
          return { ...currentData, content_per_channel: {} }
        }
        return currentData
      })
    }
  }

  // Новая функция для переключения записи значений кнопок
  const toggleButtonValues = (checked: boolean) => {
    setEnableButtonValues(checked)
    if (!checked) {
      setData((prev) => ({ ...(prev as SendTextNodeData), buttons_value_target: undefined }))
    } else {
      setData((prev) => ({
        ...(prev as SendTextNodeData),
        buttons_value_target: { scope: "lead", key: "" },
      }))
    }
  }

  // Determine which accordion items should be open by default
  const defaultOpenAccordionItems = useMemo(() => {
    if (!data.content_per_channel) return []
    return Object.keys(data.content_per_channel).filter(
      (ch) => !!data.content_per_channel?.[ch as Channel]?.content?.trim(),
    ) as Channel[]
  }, [data.content_per_channel])

  const hasButtons = data.buttons && data.buttons.length > 0

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-600 mb-1">
          Universal Message Content (Fallback):
        </label>
        <Textarea
          id="content"
          value={data.content}
          onChange={(e) => setData((prev) => ({ ...prev, content: e.target.value }))}
          rows={4}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 custom-scrollbar"
          placeholder="Enter universal message text here..."
        />
      </div>

      {/* Buttons Section */}
      <div className="pt-4 border-t">
        <ButtonEditor
          buttons={data.buttons || []}
          onButtonsChange={(buttons) => {
            setData((prev) => ({
              ...prev,
              buttons: buttons.length > 0 ? buttons : undefined,
            }))
          }}
        />
      </div>

      {/* Button Values Section - показывается только если есть кнопки */}
      {hasButtons && (
        <div className="pt-4 border-t">
          <div className="flex items-center space-x-2 mb-3">
            <Switch id="enable-button-values" checked={enableButtonValues} onCheckedChange={toggleButtonValues} />
            <Label htmlFor="enable-button-values" className="text-sm font-medium text-gray-700 flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2" />
              Записывать значение при выборе кнопки
            </Label>
          </div>

          {enableButtonValues && (
            <div className="space-y-3 p-3 bg-purple-50 rounded-md border border-purple-200">
              <div>
                <Label htmlFor="value-scope" className="text-sm font-medium text-gray-600 mb-1">
                  Область атрибута:
                </Label>
                <Select
                  value={data.buttons_value_target?.scope || "lead"}
                  onValueChange={(value: "lead" | "bot") => {
                    setData((prev) => ({
                      ...(prev as SendTextNodeData),
                      buttons_value_target: {
                        ...prev.buttons_value_target,
                        scope: value,
                        key: prev.buttons_value_target?.key || "",
                      },
                    }))
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Выберите область" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">Лид (пользователь)</SelectItem>
                    <SelectItem value="bot">Бот</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="value-key" className="text-sm font-medium text-gray-600 mb-1">
                  Название атрибута <span className="text-red-500">*</span>:
                </Label>
                <Input
                  id="value-key"
                  value={data.buttons_value_target?.key || ""}
                  onChange={(e) => {
                    setData((prev) => ({
                      ...(prev as SendTextNodeData),
                      buttons_value_target: {
                        ...prev.buttons_value_target,
                        scope: prev.buttons_value_target?.scope || "lead",
                        key: e.target.value,
                      },
                    }))
                  }}
                  className="w-full"
                  placeholder="Например: user_choice, selected_option"
                />
                <p className="text-xs text-gray-500 mt-1">Значения кнопок будут записаны в этот атрибут при нажатии</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center space-x-2 py-2 border-t border-b">
        <Switch id="customize-channels" checked={customizePerChannel} onCheckedChange={toggleCustomizePerChannel} />
        <Label htmlFor="customize-channels" className="text-sm font-medium text-gray-700">
          Customize content per channel
        </Label>
      </div>

      {customizePerChannel && (
        <Accordion type="multiple" defaultValue={defaultOpenAccordionItems} className="w-full">
          {(Object.keys(CHANNEL_FRIENDLY_NAMES) as Channel[]).map((channelKey) => (
            <AccordionItem value={channelKey} key={channelKey}>
              <AccordionTrigger className="text-sm py-2 hover:no-underline">
                <div className="flex items-center">
                  <Settings2 size={14} className="mr-2 text-gray-500" />
                  {CHANNEL_FRIENDLY_NAMES[channelKey]}
                  {data.content_per_channel?.[channelKey]?.content?.trim() && (
                    <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full" title="Customized"></span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="border-t pt-2">
                <ChannelOverrideEditor
                  channel={channelKey}
                  channelData={data.content_per_channel?.[channelKey]}
                  onDataChange={handleChannelDataChange}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
      {/* Analytics Section */}
      <LogWaySection
        logWayData={data.log_way_steps}
        onLogWayChange={(logWayData) => {
          setData((prev) => ({
            ...(prev as SendTextNodeData),
            log_way_steps: logWayData,
          }))
        }}
      />
    </div>
  )
}

// Add the RunScriptForm component before the EditPanel component
function RunScriptForm({
  data,
  setData,
}: {
  data: RunScriptNodeData
  setData: React.Dispatch<React.SetStateAction<CJMNodeData>>
}) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="script_code" className="block text-sm font-medium text-gray-600 mb-1">
          Код скрипта для выполнения:
        </label>
        <input
          id="script_code"
          type="text"
          value={data.script_code}
          onChange={(e) => setData((prev) => ({ ...prev, script_code: e.target.value }))}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
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
          onChange={(e) => setData((prev) => ({ ...prev, note: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 custom-scrollbar"
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

function EntryPointForm({
  data,
  setData,
}: {
  data: EntryPointNodeData
  setData: React.Dispatch<React.SetStateAction<CJMNodeData>>
}) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1">
          Название точки входа:
        </label>
        <input
          id="name"
          type="text"
          value={data.name}
          onChange={(e) => setData((prev) => ({ ...prev, name: e.target.value }))}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
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

function GoToMapEntryForm({
  data,
  setData,
}: {
  data: GoToMapEntryNodeData
  setData: React.Dispatch<React.SetStateAction<CJMNodeData>>
}) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="target_map" className="block text-sm font-medium text-gray-600 mb-1">
          Код целевой воронки:
        </label>
        <input
          id="target_map"
          type="text"
          value={data.target_map}
          onChange={(e) => setData((prev) => ({ ...prev, target_map: e.target.value }))}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
          placeholder="e.g., sales_funnel"
        />
      </div>
      <div>
        <label htmlFor="entry_point" className="block text-sm font-medium text-gray-600 mb-1">
          Код точки входа:
        </label>
        <input
          id="entry_point"
          type="text"
          value={data.entry_point}
          onChange={(e) => setData((prev) => ({ ...prev, entry_point: e.target.value }))}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
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
          onChange={(e) => setData((prev) => ({ ...prev, note: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 custom-scrollbar"
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

function WaitForm({
  data,
  setData,
}: {
  data: WaitNodeData
  setData: React.Dispatch<React.SetStateAction<CJMNodeData>>
}) {
  const handleDelayChange = (field: keyof typeof data.delay, value: number) => {
    setData((prev) => ({
      ...prev,
      delay: {
        ...(prev as WaitNodeData).delay,
        [field]: Math.max(0, value), // Ensure non-negative values
      },
    }))
  }

  return (
    <div className="space-y-4">
      <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
        <p className="text-sm text-orange-700 mb-2">
          <strong>Ожидание</strong> создает паузу в выполнении сценария на указанное время.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="days" className="block text-sm font-medium text-gray-600 mb-1">
            Дни:
          </label>
          <input
            id="days"
            type="number"
            min="0"
            value={data.delay.days}
            onChange={(e) => handleDelayChange("days", Number.parseInt(e.target.value, 10) || 0)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        <div>
          <label htmlFor="hours" className="block text-sm font-medium text-gray-600 mb-1">
            Часы:
          </label>
          <input
            id="hours"
            type="number"
            min="0"
            max="23"
            value={data.delay.hours}
            onChange={(e) => handleDelayChange("hours", Number.parseInt(e.target.value, 10) || 0)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        <div>
          <label htmlFor="minutes" className="block text-sm font-medium text-gray-600 mb-1">
            Минуты:
          </label>
          <input
            id="minutes"
            type="number"
            min="0"
            max="59"
            value={data.delay.minutes}
            onChange={(e) => handleDelayChange("minutes", Number.parseInt(e.target.value, 10) || 0)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        <div>
          <label htmlFor="seconds" className="block text-sm font-medium text-gray-600 mb-1">
            Секунды:
          </label>
          <input
            id="seconds"
            type="number"
            min="0"
            max="59"
            value={data.delay.seconds}
            onChange={(e) => handleDelayChange("seconds", Number.parseInt(e.target.value, 10) || 0)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>

      <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
        <p className="text-sm text-gray-600">
          <strong>Общее время ожидания:</strong> {data.delay.days > 0 && `${data.delay.days} дн. `}
          {data.delay.hours > 0 && `${data.delay.hours} ч. `}
          {data.delay.minutes > 0 && `${data.delay.minutes} мин. `}
          {data.delay.seconds > 0 && `${data.delay.seconds} сек.`}
          {data.delay.days === 0 &&
            data.delay.hours === 0 &&
            data.delay.minutes === 0 &&
            data.delay.seconds === 0 &&
            "0 секунд"}
        </p>
      </div>
    </div>
  )
}

function TagsForm({
  data,
  setData,
}: {
  data: TagsNodeData
  setData: React.Dispatch<React.SetStateAction<CJMNodeData>>
}) {
  const isAddTags = data.type === "add_tags"

  const handleTypeChange = (newType: "add_tags" | "remove_tags") => {
    setData((prev) => ({
      ...prev,
      type: newType,
      label: newType === "add_tags" ? "Добавить теги" : "Удалить теги",
    }))
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="tag_type" className="block text-sm font-medium text-gray-600 mb-1">
          Тип операции:
        </label>
        <Select value={data.type} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Выберите операцию" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="add_tags">Добавить теги</SelectItem>
            <SelectItem value="remove_tags">Удалить теги</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-600 mb-1">
          Теги:
        </label>
        <TagsInput
          tags={data.tags}
          onChange={(newTags) => setData((prev) => ({ ...prev, tags: newTags }))}
          placeholder="Введите тег и нажмите Enter или запятую"
          variant={isAddTags ? "add" : "remove"}
        />
        <p className="text-xs text-gray-500 mt-1">Введите теги через запятую или нажмите Enter после каждого тега</p>
      </div>

      <div
        className={`p-3 border rounded-md ${isAddTags ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
      >
        <p className={`text-sm ${isAddTags ? "text-green-700" : "text-red-700"}`}>
          <strong>{isAddTags ? "Добавление тегов" : "Удаление тегов"}</strong> используется для сегментации
          пользователей и создания условий в сценариях.
        </p>
      </div>
      {/* Analytics Section */}
      <LogWaySection
        logWayData={data.log_way_steps}
        onLogWayChange={(logWayData) => {
          setData((prev) => ({
            ...(prev as TagsNodeData),
            log_way_steps: logWayData,
          }))
        }}
      />
    </div>
  )
}

function CustomFieldForm({
  data,
  setData,
}: {
  data: CustomFieldNodeData
  setData: React.Dispatch<React.SetStateAction<CJMNodeData>>
}) {
  const renderValueInput = () => {
    switch (data.value_type) {
      case "boolean":
        return (
          <Select value={data.value} onValueChange={(value) => setData((prev) => ({ ...prev, value }))}>
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
          <input
            type="number"
            value={data.value}
            onChange={(e) => setData((prev) => ({ ...prev, value: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Введите число"
          />
        )
      case "datetime":
        return (
          <input
            type="datetime-local"
            value={data.value}
            onChange={(e) => setData((prev) => ({ ...prev, value: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        )
      case "json":
        return (
          <Textarea
            value={data.value}
            onChange={(e) => setData((prev) => ({ ...prev, value: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 custom-scrollbar"
            placeholder='{"key": "value"}'
          />
        )
      default: // string
        return (
          <input
            type="text"
            value={data.value}
            onChange={(e) => setData((prev) => ({ ...prev, value: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
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
        <Select
          value={data.scope}
          onValueChange={(value: "lead" | "bot") => setData((prev) => ({ ...prev, scope: value }))}
        >
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
        <input
          id="key"
          type="text"
          value={data.key}
          onChange={(e) => setData((prev) => ({ ...prev, key: e.target.value }))}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
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
            setData((prev) => ({
              ...prev,
              value_type: value,
              value: value === "boolean" ? "true" : "", // Reset value when type changes
            }))
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
      {/* Analytics Section */}
      <LogWaySection
        logWayData={data.log_way_steps}
        onLogWayChange={(logWayData) => {
          setData((prev) => ({
            ...(prev as CustomFieldNodeData),
            log_way_steps: logWayData,
          }))
        }}
      />
    </div>
  )
}

// Add the IfElseForm component
function IfElseForm({
  data,
  setData,
}: {
  data: IfElseNodeData
  setData: React.Dispatch<React.SetStateAction<CJMNodeData>>
}) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="condition" className="block text-sm font-medium text-gray-600 mb-1">
          Условие (JavaScript):
        </label>
        <Textarea
          id="condition"
          value={data.condition}
          onChange={(e) => setData((prev) => ({ ...prev, condition: e.target.value }))}
          rows={4}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500 custom-scrollbar"
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
        <input
          id="next_step"
          type="text"
          value={data.next_step || ""}
          onChange={(e) => setData((prev) => ({ ...prev, next_step: e.target.value || null }))}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          placeholder="Код шага для перехода"
        />
      </div>

      <div>
        <label htmlFor="else_step" className="block text-sm font-medium text-gray-600 mb-1">
          Шаг если ЛОЖЬ (ELSE):
        </label>
        <input
          id="else_step"
          type="text"
          value={data.else_step || ""}
          onChange={(e) => setData((prev) => ({ ...prev, else_step: e.target.value || null }))}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
          placeholder="Код шага для перехода"
        />
      </div>

      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm text-yellow-700">
          <strong>Условное ветвление</strong> позволяет направить пользователя по одному из двух путей в зависимости от
          выполнения условия.
        </p>
      </div>
      {/* Analytics Section */}
      <LogWaySection
        logWayData={data.log_way_steps}
        onLogWayChange={(logWayData) => {
          setData((prev) => ({
            ...(prev as IfElseNodeData),
            log_way_steps: logWayData,
          }))
        }}
      />
    </div>
  )
}

// Add the SwitchForm component
function SwitchForm({
  data,
  setData,
}: {
  data: SwitchNodeData
  setData: React.Dispatch<React.SetStateAction<CJMNodeData>>
}) {
  const addCase = () => {
    const newCase: SwitchCase = {
      id: uuidv4(),
      condition: "",
      step: null,
    }
    setData((prev) => ({
      ...prev,
      cases: [...(prev as SwitchNodeData).cases, newCase],
    }))
  }

  const updateCase = (index: number, field: keyof SwitchCase, value: string | null) => {
    setData((prev) => {
      const prevData = prev as SwitchNodeData
      const updatedCases = [...prevData.cases]
      updatedCases[index] = {
        ...updatedCases[index],
        [field]: value,
      }
      return {
        ...prev,
        cases: updatedCases,
      }
    })
  }

  const removeCase = (index: number) => {
    setData((prev) => {
      const prevData = prev as SwitchNodeData
      const updatedCases = [...prevData.cases]
      updatedCases.splice(index, 1)
      return {
        ...prev,
        cases: updatedCases,
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-700">
          <strong>Множественное ветвление</strong> позволяет направить пользователя по одному из нескольких путей в
          зависимости от выполнения условий. Условия проверяются по порядку сверху вниз.
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
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 custom-scrollbar"
                    placeholder="Введите условие, например: variables.age > 18"
                  />
                </div>

                <div>
                  <label htmlFor={`step-${index}`} className="block text-xs font-medium text-gray-600 mb-1">
                    Переход к шагу:
                  </label>
                  <input
                    id={`step-${index}`}
                    type="text"
                    value={caseItem.step || ""}
                    onChange={(e) => updateCase(index, "step", e.target.value || null)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
        <input
          id="default_step"
          type="text"
          value={data.default_step || ""}
          onChange={(e) => setData((prev) => ({ ...prev, default_step: e.target.value || null }))}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
          placeholder="Код шага для перехода по умолчанию"
        />
      </div>
      {/* Analytics Section */}
      <LogWaySection
        logWayData={data.log_way_steps}
        onLogWayChange={(logWayData) => {
          setData((prev) => ({
            ...(prev as SwitchNodeData),
            log_way_steps: logWayData,
          }))
        }}
      />
    </div>
  )
}

// Add the LogActionForm component
function LogActionForm({
  data,
  setData,
}: {
  data: LogActionNodeData
  setData: React.Dispatch<React.SetStateAction<CJMNodeData>>
}) {
  const handleLogTypeChange = (newLogType: LogActionType) => {
    setData((prev) => ({
      ...prev,
      log_type: newLogType,
      // Clear fields that don't apply to the new type
      step: newLogType === "step" ? prev.step : undefined,
      event: newLogType === "event" ? prev.event : undefined,
      tag: newLogType === "tag" ? prev.tag : undefined,
      tag_action: newLogType === "tag" ? prev.tag_action : undefined,
      utter: newLogType === "utter" ? prev.utter : undefined,
    }))
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
        <input
          id="way"
          type="text"
          value={data.way || ""}
          onChange={(e) => setData((prev) => ({ ...prev, way: e.target.value }))}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
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
          <input
            id="step"
            type="text"
            value={data.step || ""}
            onChange={(e) => setData((prev) => ({ ...prev, step: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="e.g., platform_selected"
          />
        </div>
      )}

      {data.log_type === "event" && (
        <div>
          <label htmlFor="event" className="block text-sm font-medium text-gray-600 mb-1">
            Событие:
          </label>
          <input
            id="event"
            type="text"
            value={data.event || ""}
            onChange={(e) => setData((prev) => ({ ...prev, event: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
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
            <input
              id="tag"
              type="text"
              value={data.tag || ""}
              onChange={(e) => setData((prev) => ({ ...prev, tag: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g., interested"
            />
          </div>
          <div>
            <label htmlFor="tag_action" className="block text-sm font-medium text-gray-600 mb-1">
              Действие с тегом:
            </label>
            <Select
              value={data.tag_action || "add"}
              onValueChange={(value: TagAction) => setData((prev) => ({ ...prev, tag_action: value }))}
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
          <input
            id="utter"
            type="text"
            value={data.utter || ""}
            onChange={(e) => setData((prev) => ({ ...prev, utter: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
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
          onChange={(e) => setData((prev) => ({ ...prev, note: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 custom-scrollbar"
          placeholder="Пояснение для разработчика..."
        />
      </div>
    </div>
  )
}

function EditPanel({ node, onClose, onUpdateData }: EditPanelProps) {
  const [localData, setLocalData] = useState<CJMNodeData>(node.data)

  useEffect(() => {
    const initialNodeData = node.data
    if (initialNodeData.type === "value_input") {
      let template = getTemplateFromRegexp(initialNodeData.regexp)
      if (!initialNodeData.validation_template && !initialNodeData.regexp) {
        template = "none"
      }
      // Ensure reminders is an array, and each reminder has an ID
      const remindersWithIds = (initialNodeData.reminders || []).map((r) => ({ ...r, id: r.id || uuidv4() }))
      setLocalData({ ...initialNodeData, validation_template: template, reminders: remindersWithIds })
    } else if (initialNodeData.type === "send_text") {
      // Ensure buttons have IDs
      const buttonsWithIds = (initialNodeData.buttons || []).map((btn) => ({ ...btn, id: btn.id || uuidv4() }))
      setLocalData({ ...initialNodeData, buttons: buttonsWithIds })
    } else {
      setLocalData(initialNodeData)
    }
  }, [node])

  const handleSave = () => {
    let dataToSave = { ...localData }

    if (dataToSave.type === "send_text") {
      const sendTextData = dataToSave as SendTextNodeData
      if (sendTextData.content_per_channel && Object.keys(sendTextData.content_per_channel).length === 0) {
        dataToSave = { ...sendTextData, content_per_channel: undefined }
      }
      // Clean up buttons if empty
      if (sendTextData.buttons && sendTextData.buttons.length === 0) {
        dataToSave = { ...sendTextData, buttons: undefined }
      }
    } else if (dataToSave.type === "value_input") {
      // If reminders array is empty, ensure it's set to undefined or an empty array based on backend preference
      // For now, an empty array is fine, but if backend expects it to be absent, change to undefined.
      if (dataToSave.reminders && dataToSave.reminders.length === 0) {
        // dataToSave.reminders = undefined; // Option 1: remove if empty
        dataToSave.reminders = [] // Option 2: send empty array
      }
      // Ensure each reminder's content_per_channel is undefined if empty
      if (dataToSave.reminders) {
        dataToSave.reminders = dataToSave.reminders.map((rem) => {
          if (rem.content_per_channel && Object.keys(rem.content_per_channel).length === 0) {
            return { ...rem, content_per_channel: undefined }
          }
          return rem
        })
      }
    }
    onUpdateData(node.id, dataToSave)
    toast.success("Step content saved!")
  }

  // Update the renderForm useMemo to include the new case
  const renderForm = useMemo(() => {
    switch (localData.type) {
      case "send_text":
        return <SendTextForm data={localData as SendTextNodeData} setData={setLocalData} />
      case "value_input":
        return <ValueInputForm data={localData as ValueInputNodeData} setData={setLocalData} />
      case "run_custom_script":
        return <RunScriptForm data={localData as RunScriptNodeData} setData={setLocalData} />
      case "entry_point":
        return <EntryPointForm data={localData as EntryPointNodeData} setData={setLocalData} />
      case "go_to_map_entry":
        return <GoToMapEntryForm data={localData as GoToMapEntryNodeData} setData={setLocalData} />
      case "wait":
        return <WaitForm data={localData as WaitNodeData} setData={setLocalData} />
      case "add_tags":
      case "remove_tags":
        return <TagsForm data={localData as TagsNodeData} setData={setLocalData} />
      case "set_custom_field":
        return <CustomFieldForm data={localData as CustomFieldNodeData} setData={setLocalData} />
      case "if_else":
        return <IfElseForm data={localData as IfElseNodeData} setData={setLocalData} />
      case "switch":
        return <SwitchForm data={localData as SwitchNodeData} setData={setLocalData} />
      case "log_action":
        return <LogActionForm data={localData as LogActionNodeData} setData={setLocalData} />
      default:
        // This should ideally not happen if node types are handled correctly
        const exhaustiveCheck: never = localData
        return <p className="text-sm text-gray-500">This node type has no editable properties or is unknown.</p>
    }
  }, [localData]) // localData dependency is crucial here

  return (
    <div className="w-96 bg-white p-4 border-l border-gray-200 shadow-lg flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Edit Step: {node.data.label || node.data.code}</h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          aria-label="Close edit panel"
        >
          <X size={20} />
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-1">Node Code (ID):</label>
        <input
          type="text"
          value={node.data.code}
          readOnly
          className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed"
        />
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2 pb-4">{renderForm}</div>

      <button
        onClick={handleSave}
        className="w-full mt-auto px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center"
      >
        <Save size={16} className="mr-2" />
        Save Content
      </button>
    </div>
  )
}

export default EditPanel
