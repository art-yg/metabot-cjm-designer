"use client"

import type React from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionItem } from "@/components/ui/accordion"
import { PlusCircle, Clock } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

import type { CJMNode } from "@/app/cjm-editor/types"
import type { ValueInputNodeData, ReminderItem } from "@/components/cjm-editor/nodes/value-input-node"
import ReminderItemEditor from "../reminder-item-editor"

interface ValueInputEditorProps {
  node: CJMNode
  onUpdateData: (nodeId: string, newData: Partial<ValueInputNodeData>) => void
}

// Validation templates
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

function ValueInputEditor({ node, onUpdateData }: ValueInputEditorProps) {
  const data = node.data as ValueInputNodeData

  const handleFieldChange = (field: keyof ValueInputNodeData, value: any) => {
    onUpdateData(node.id, { [field]: value })
  }

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateKey = e.target.value
    let newRegexp = VALIDATION_TEMPLATES[templateKey] || data.regexp || ""
    if (templateKey === "none") {
      newRegexp = ""
    }
    onUpdateData(node.id, { validation_template: templateKey, regexp: newRegexp })
  }

  const hasReminders = data.reminders && data.reminders.length > 0
  const hasTimeout = data.timeout && data.timeout.timeout_seconds > 0

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="variable" className="block text-sm font-medium text-gray-600 mb-1">
          Variable Name:
        </label>
        <Input
          id="variable"
          type="text"
          value={data.variable}
          onChange={(e) => handleFieldChange("variable", e.target.value)}
          className="w-full"
          placeholder="e.g., user_email"
        />
      </div>

      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-600 mb-1">
          Prompt Message:
        </label>
        <Textarea
          id="prompt"
          value={data.prompt}
          onChange={(e) => handleFieldChange("prompt", e.target.value)}
          rows={4}
          className="w-full custom-scrollbar"
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
          <Input
            id="regexp"
            type="text"
            value={data.regexp || ""}
            onChange={(e) => handleFieldChange("regexp", e.target.value)}
            className="w-full"
            placeholder="Enter custom regular expression"
          />
        </div>
      )}

      <div>
        <label htmlFor="errmsg" className="block text-sm font-medium text-gray-600 mb-1">
          Error Message:
        </label>
        <Input
          id="errmsg"
          type="text"
          value={data.errmsg || ""}
          onChange={(e) => handleFieldChange("errmsg", e.target.value)}
          className="w-full"
          placeholder="e.g., Invalid input, please try again."
        />
      </div>

      <div>
        <label htmlFor="exit_condition" className="block text-sm font-medium text-gray-600 mb-1">
          Exit Condition (RegExp):
        </label>
        <Input
          id="exit_condition"
          type="text"
          value={data.exit_condition || ""}
          onChange={(e) => handleFieldChange("exit_condition", e.target.value)}
          className="w-full"
          placeholder="e.g., стоп|отмена|не хочу"
        />
      </div>

      {/* Reminders Section */}
      <div className="space-y-3 pt-4 mt-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id="enable-reminders"
              checked={hasReminders}
              onCheckedChange={(checked) => {
                if (checked) {
                  const newReminder: ReminderItem = {
                    id: uuidv4(),
                    delay_sec: 60,
                    content: "This is a reminder.",
                  }
                  handleFieldChange("reminders", [newReminder])
                } else {
                  handleFieldChange("reminders", [])
                }
              }}
            />
            <Label htmlFor="enable-reminders" className="text-sm font-medium text-gray-700 flex items-center">
              <Clock size={16} className="mr-2 text-orange-600" />
              Enable Reminders
            </Label>
          </div>
          {hasReminders && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newReminder: ReminderItem = {
                  id: uuidv4(),
                  delay_sec: (data.reminders?.slice(-1)[0]?.delay_sec || 0) + 60,
                  content: "Another reminder.",
                }
                handleFieldChange("reminders", [...(data.reminders || []), newReminder])
              }}
              className="h-8 text-xs"
            >
              <PlusCircle size={14} className="mr-1.5" /> Add Reminder
            </Button>
          )}
        </div>

        {hasReminders && (
          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-1">
            {data.reminders!.map((reminder, index) => (
              <Accordion key={reminder.id} type="single" collapsible className="w-full">
                <AccordionItem value={`reminder-${reminder.id}`} className="border-none">
                  <ReminderItemEditor
                    reminder={reminder}
                    index={index}
                    onUpdateReminder={(updatedReminder) => {
                      const updatedReminders = data.reminders!.map((r) =>
                        r.id === updatedReminder.id ? updatedReminder : r,
                      )
                      handleFieldChange("reminders", updatedReminders)
                    }}
                    onDeleteReminder={(reminderId) => {
                      const updatedReminders = data.reminders!.filter((r) => r.id !== reminderId)
                      handleFieldChange("reminders", updatedReminders)
                    }}
                  />
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
              checked={hasTimeout}
              onCheckedChange={(checked) => {
                if (checked) {
                  handleFieldChange("timeout", { timeout_seconds: 120, exit_step: null })
                } else {
                  handleFieldChange("timeout", undefined)
                }
              }}
            />
            <Label htmlFor="enable-timeout" className="text-sm font-medium text-gray-700 flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded-full mr-2" />
              Enable Timeout Exit
            </Label>
          </div>
        </div>

        {hasTimeout && (
          <div className="space-y-3 p-3 bg-blue-50 rounded-md border border-blue-200">
            <div>
              <label htmlFor="timeout_seconds" className="block text-sm font-medium text-gray-600 mb-1">
                Timeout Duration (seconds):
              </label>
              <Input
                id="timeout_seconds"
                type="number"
                min="10"
                value={data.timeout!.timeout_seconds}
                onChange={(e) => {
                  const seconds = Math.max(10, Number.parseInt(e.target.value, 10) || 10)
                  handleFieldChange("timeout", { ...data.timeout!, timeout_seconds: seconds })
                }}
                className="w-full"
                placeholder="e.g., 120"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum: 10 seconds</p>
            </div>
            <div>
              <label htmlFor="timeout_exit_step" className="block text-sm font-medium text-gray-600 mb-1">
                Timeout Exit Step:
              </label>
              <Input
                id="timeout_exit_step"
                type="text"
                value={data.timeout!.exit_step || ""}
                onChange={(e) => handleFieldChange("timeout", { ...data.timeout!, exit_step: e.target.value || null })}
                className="w-full"
                placeholder="Enter step code for timeout exit"
              />
              <p className="text-xs text-gray-500 mt-1">Step to execute when timeout occurs</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ValueInputEditor
