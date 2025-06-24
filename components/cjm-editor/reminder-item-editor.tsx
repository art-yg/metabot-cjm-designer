"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Trash2, Settings2 } from "lucide-react"

import type { ReminderItem } from "./nodes/value-input-node"
import type { Channel } from "@/lib/format-presets"
import { CHANNEL_FRIENDLY_NAMES } from "@/lib/format-presets"
import ChannelOverrideEditor from "./channel-override-editor"
import type { ChannelContent } from "@/lib/channel-types"

interface ReminderItemEditorProps {
  reminder: ReminderItem
  onUpdateReminder: (updatedReminder: ReminderItem) => void
  onDeleteReminder: (reminderId: string) => void
  index: number // For unique IDs and accordion state
}

const ReminderItemEditor: React.FC<ReminderItemEditorProps> = ({
  reminder,
  onUpdateReminder,
  onDeleteReminder,
  index,
}) => {
  const [localReminder, setLocalReminder] = useState<ReminderItem>(reminder)
  const [customizePerChannel, setCustomizePerChannel] = useState(reminder.content_per_channel !== undefined)

  useEffect(() => {
    setLocalReminder(reminder)
    // Key line - synchronize toggle state based on whether content_per_channel exists at all
    setCustomizePerChannel(reminder.content_per_channel !== undefined)
  }, [reminder])

  const handleInputChange = (field: keyof ReminderItem, value: any) => {
    const updatedReminder = { ...localReminder, [field]: value }
    setLocalReminder(updatedReminder)
    onUpdateReminder(updatedReminder)
  }

  const handleChannelDataChange = (channel: Channel, channelContentData: ChannelContent | null) => {
    const newContentPerChannel = { ...(localReminder.content_per_channel || {}) }
    if (channelContentData === null || !channelContentData.content.trim()) {
      delete newContentPerChannel[channel]
    } else {
      newContentPerChannel[channel] = channelContentData
    }

    // Create updated reminder with the new content_per_channel
    const updatedReminder = { ...localReminder, content_per_channel: newContentPerChannel }
    setLocalReminder(updatedReminder)
    onUpdateReminder(updatedReminder)
  }

  const toggleCustomizePerChannel = (checked: boolean) => {
    setCustomizePerChannel(checked) // Update local UI state

    if (checked) {
      // Enabling - create empty object if it doesn't exist
      const updatedReminder = {
        ...localReminder,
        content_per_channel: localReminder.content_per_channel || {},
      }
      setLocalReminder(updatedReminder)
      onUpdateReminder(updatedReminder)
    } else {
      // Disabling - remove the object completely
      const updatedReminder = {
        ...localReminder,
        content_per_channel: undefined,
      }
      setLocalReminder(updatedReminder)
      onUpdateReminder(updatedReminder)
    }
  }

  const defaultOpenChannelAccordionItems = useMemo(() => {
    if (!localReminder.content_per_channel) return []
    return Object.keys(localReminder.content_per_channel).filter(
      (ch) => !!localReminder.content_per_channel?.[ch as Channel]?.content?.trim(),
    ) as Channel[]
  }, [localReminder.content_per_channel])

  return (
    <div className="p-3 border rounded-md bg-gray-50/50 space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-semibold text-gray-700">Reminder #{index + 1}</h4>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDeleteReminder(localReminder.id)}
          className="h-7 w-7 text-red-500 hover:text-red-700"
        >
          <Trash2 size={16} />
        </Button>
      </div>

      <div>
        <Label htmlFor={`delay_sec_${localReminder.id}`} className="text-xs font-medium text-gray-600">
          Delay (seconds)
        </Label>
        <Input
          id={`delay_sec_${localReminder.id}`}
          type="number"
          value={localReminder.delay_sec}
          onChange={(e) => handleInputChange("delay_sec", Number.parseInt(e.target.value, 10) || 0)}
          className="h-9 text-sm"
          min="0"
        />
      </div>

      <div>
        <Label htmlFor={`content_${localReminder.id}`} className="text-xs font-medium text-gray-600">
          Default Message Content
        </Label>
        <Textarea
          id={`content_${localReminder.id}`}
          value={localReminder.content}
          onChange={(e) => handleInputChange("content", e.target.value)}
          rows={3}
          className="custom-scrollbar text-sm"
          placeholder="Enter default reminder message..."
        />
      </div>

      <div className="flex items-center space-x-2 py-1.5 border-t border-b my-2">
        <Switch
          id={`customize-channels-reminder-${localReminder.id}`}
          checked={customizePerChannel}
          onCheckedChange={toggleCustomizePerChannel}
        />
        <Label
          htmlFor={`customize-channels-reminder-${localReminder.id}`}
          className="text-xs font-medium text-gray-700"
        >
          Customize content per channel for this reminder
        </Label>
      </div>

      {customizePerChannel && (
        <div className="space-y-3">
          <Accordion type="multiple" defaultValue={defaultOpenChannelAccordionItems} className="w-full text-xs">
            {(Object.keys(CHANNEL_FRIENDLY_NAMES) as Channel[]).map((channelKey) => (
              <AccordionItem value={channelKey} key={channelKey} className="border-b">
                <AccordionTrigger className="text-xs py-1.5 hover:no-underline">
                  <div className="flex items-center">
                    <Settings2 size={13} className="mr-1.5 text-gray-500" />
                    {CHANNEL_FRIENDLY_NAMES[channelKey]}
                    {localReminder.content_per_channel?.[channelKey]?.content?.trim() && (
                      <span className="ml-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full" title="Customized"></span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="border-t pt-1.5 pb-0">
                  <ChannelOverrideEditor
                    channel={channelKey}
                    channelData={localReminder.content_per_channel?.[channelKey]}
                    onDataChange={handleChannelDataChange}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  )
}

export default ReminderItemEditor
