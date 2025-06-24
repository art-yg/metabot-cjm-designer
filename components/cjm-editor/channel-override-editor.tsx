"use client"

import React, { useState, useRef } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle, AlertTriangle, Eye, Info } from "lucide-react"
import { toast } from "react-hot-toast"

import type { Channel, FormatType } from "@/lib/format-presets"
import { CHANNEL_FORMATS, QUICK_TAGS } from "@/lib/format-presets"
import type { ValidationResult } from "@/lib/validation"
import { validateFormattedText } from "@/lib/validation"
import PreviewModal from "./preview-modal"
import type { ChannelContent } from "@/lib/channel-types"

interface ChannelOverrideEditorProps {
  channel: Channel
  channelData: ChannelContent | undefined
  onDataChange: (channel: Channel, data: ChannelContent | null) => void // null to delete override
}

function ChannelOverrideEditor({ channel, channelData, onDataChange }: ChannelOverrideEditorProps) {
  const availableFormats = CHANNEL_FORMATS[channel]
  const [currentFormat, setCurrentFormat] = useState<FormatType>(channelData?.format || availableFormats[0].value)
  const [currentContent, setCurrentContent] = useState<string>(channelData?.content || "")
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Update local state if props change (e.g. loading from JSON)
  React.useEffect(() => {
    setCurrentFormat(channelData?.format || availableFormats[0].value)
    setCurrentContent(channelData?.content || "")
    setValidation(null) // Reset validation on prop change
  }, [channelData, availableFormats])

  const handleFormatChange = (newFormat: FormatType) => {
    setCurrentFormat(newFormat)
    // If there's content, re-validate with new format
    if (currentContent.trim()) {
      const newValidationResult = validateFormattedText(currentContent, newFormat)
      setValidation(newValidationResult)
    } else {
      setValidation(null) // Clear validation if content is empty
    }
    onDataChange(channel, { format: newFormat, content: currentContent })
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setCurrentContent(newContent)
    // Auto-validate on change if content is not empty
    if (newContent.trim()) {
      const newValidationResult = validateFormattedText(newContent, currentFormat)
      setValidation(newValidationResult)
    } else {
      setValidation(null) // Clear validation if content is empty
    }
    onDataChange(channel, { format: currentFormat, content: newContent })
  }

  const handleValidate = () => {
    const result = validateFormattedText(currentContent, currentFormat)
    setValidation(result)
    if (result.ok) {
      toast.success(`${CHANNEL_FORMATS[channel].find((f) => f.value === currentFormat)?.label} format is valid!`)
    } else {
      toast.error(`Validation errors found. (${result.errors.length})`)
    }
  }

  const insertTag = (tagValue: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const selectedText = text.substring(start, end)

    let newTextValue = ""
    let newCursorPosition = 0

    if (
      tagValue.includes("текст") ||
      tagValue.includes("код") ||
      tagValue.includes("URL") ||
      tagValue.includes("ссылки")
    ) {
      // Placeholder tags, replace "текст" or "код" with selected text or leave as is
      let replacement = selectedText || (tagValue.includes("URL") ? "" : "текст")
      if (tagValue.includes("URL") && !selectedText) replacement = "https://example.com"

      const placeholderRegex = /текст ссылки|текст|код|URL/i
      const filledTag = tagValue.replace(placeholderRegex, replacement)

      newTextValue = text.substring(0, start) + filledTag + text.substring(end)
      newCursorPosition = start + filledTag.indexOf(replacement) + replacement.length
      if (filledTag.indexOf(replacement) === -1) {
        // if placeholder wasn't found, put cursor at end of inserted tag
        newCursorPosition = start + filledTag.length
      }
    } else {
      // Simple wrapping tags
      newTextValue =
        text.substring(0, start) +
        tagValue.substring(0, tagValue.length / 2) +
        selectedText +
        tagValue.substring(tagValue.length / 2) +
        text.substring(end)
      newCursorPosition = start + tagValue.length / 2 + selectedText.length
    }

    setCurrentContent(newTextValue)
    onDataChange(channel, { format: currentFormat, content: newTextValue }) // Propagate change

    // Focus and set cursor position
    textarea.focus()
    // Needs a timeout for the state update to reflect in the textarea value
    setTimeout(() => {
      textarea.setSelectionRange(newCursorPosition, newCursorPosition)
      // Trigger validation after programmatic change
      const newValidationResult = validateFormattedText(newTextValue, currentFormat)
      setValidation(newValidationResult)
    }, 0)
  }

  const quickTagsForFormat = QUICK_TAGS[currentFormat] || []

  return (
    <div className="space-y-3 p-1">
      {availableFormats.length > 1 && (
        <div>
          <label className="text-xs font-medium text-gray-500">Format</label>
          <Select value={currentFormat} onValueChange={(value) => handleFormatChange(value as FormatType)}>
            <SelectTrigger className="w-full h-9 text-xs">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {availableFormats.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1">Content</label>

        {quickTagsForFormat.length > 0 && (
          <div className="mb-2">
            <div className="flex flex-wrap gap-1">
              {quickTagsForFormat.map((tag) => (
                <TooltipProvider key={tag.label} delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => insertTag(tag.value)}
                        className="text-xs px-2 py-1"
                      >
                        {tag.label}
                      </Button>
                    </TooltipTrigger>
                    {tag.description && (
                      <TooltipContent>
                        <p>{tag.description}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        )}

        <Textarea
          ref={textareaRef}
          value={currentContent}
          onChange={handleContentChange}
          rows={6}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 custom-scrollbar"
          placeholder={`Enter content for ${channel} in ${currentFormat} format...`}
        />
      </div>

      <div className="flex items-start space-x-2">
        <Button variant="outline" size="sm" onClick={handleValidate} className="text-xs">
          {validation === null ? (
            <Info size={14} className="mr-1.5 text-gray-400" />
          ) : validation.ok ? (
            <CheckCircle size={14} className="mr-1.5 text-green-500" />
          ) : (
            <AlertTriangle size={14} className="mr-1.5 text-red-500" />
          )}
          Validate
        </Button>
        <Button variant="outline" size="sm" onClick={() => setIsPreviewModalOpen(true)} className="text-xs">
          <Eye size={14} className="mr-1.5" />
          Preview
        </Button>
      </div>

      {validation && !validation.ok && validation.errors.length > 0 && (
        <div className="mt-2 p-2 border border-red-200 bg-red-50 rounded-md">
          <p className="text-xs font-semibold text-red-600 mb-1">Validation Errors:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {validation.errors.map((err, idx) => (
              <li key={idx} className="text-xs text-red-500">
                {err}
              </li>
            ))}
          </ul>
        </div>
      )}
      {validation && validation.ok && (
        <div className="mt-2 p-2 border border-green-200 bg-green-50 rounded-md">
          <p className="text-xs text-green-600">Format appears valid.</p>
        </div>
      )}

      <PreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        channel={channel}
        format={currentFormat}
        content={currentContent}
      />
    </div>
  )
}

export default ChannelOverrideEditor
