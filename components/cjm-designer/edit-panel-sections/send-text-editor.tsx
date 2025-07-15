"use client"

import { useState, useMemo } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Settings2 } from "lucide-react"

import type { CJMNode } from "@/app/cjm-designer/types"
import type { SendTextNodeData } from "@/components/cjm-designer/nodes/send-text-node"
import type { Channel } from "@/lib/format-presets"
import { CHANNEL_FRIENDLY_NAMES } from "@/lib/format-presets"
import type { ChannelContent } from "@/lib/channel-types"
import ChannelOverrideEditor from "../channel-override-editor"
import ButtonEditor from "../button-editor"
import LinkSection from "../link-section"
import type { Link } from "@/lib/link-types"

interface SendTextEditorProps {
  node: CJMNode
  onUpdateData: (nodeId: string, newData: Partial<SendTextNodeData>) => void
}

function SendTextEditor({ node, onUpdateData }: SendTextEditorProps) {
  const data = node.data as SendTextNodeData

  const [customizePerChannel, setCustomizePerChannel] = useState(
    !!data.content_per_channel && Object.keys(data.content_per_channel).length > 0,
  )

  const [enableButtonValues, setEnableButtonValues] = useState(
    !!(data.buttons_value_target && data.buttons_value_target.key),
  )

  const handleContentChange = (content: string) => {
    onUpdateData(node.id, { content })
  }

  const handleNextStepChange = (nextStep: string) => {
    onUpdateData(node.id, { next_step: nextStep.trim() || null })
  }

  const handleLinksChange = (updatedLinks: Link[]) => {
    onUpdateData(node.id, { links: updatedLinks.length > 0 ? updatedLinks : undefined })
  }

  const handleChannelDataChange = (channel: Channel, channelContent: ChannelContent | null) => {
    const newContentPerChannel = { ...(data.content_per_channel || {}) }
    if (
      channelContent === null ||
      (channelContent.content === "" &&
        !channelContent.buttons?.length &&
        !channelContent.image_url &&
        !channelContent.image_caption)
    ) {
      delete newContentPerChannel[channel]
    } else {
      newContentPerChannel[channel] = channelContent
    }

    if (Object.keys(newContentPerChannel).length === 0) {
      onUpdateData(node.id, { content_per_channel: undefined })
    } else {
      onUpdateData(node.id, { content_per_channel: newContentPerChannel })
    }
  }

  const toggleCustomizePerChannel = (checked: boolean) => {
    setCustomizePerChannel(checked)
    if (!checked) {
      onUpdateData(node.id, { content_per_channel: undefined })
    } else {
      if (!data.content_per_channel) {
        onUpdateData(node.id, { content_per_channel: {} })
      }
    }
  }

  const toggleButtonValues = (checked: boolean) => {
    setEnableButtonValues(checked)
    if (!checked) {
      onUpdateData(node.id, { buttons_value_target: undefined })
    } else {
      onUpdateData(node.id, { buttons_value_target: { scope: "lead", key: data.buttons_value_target?.key || "" } })
    }
  }

  const defaultOpenAccordionItems = useMemo(() => {
    if (!data.content_per_channel) return []
    return Object.keys(data.content_per_channel).filter((ch) => {
      const content = data.content_per_channel?.[ch as Channel]
      return !!content?.content?.trim() || !!content?.buttons?.length || !!content?.image_url
    }) as Channel[]
  }, [data.content_per_channel])

  const hasButtons = data.buttons && data.buttons.length > 0

  return (
    <div className="space-y-4">
      {/* 1. Universal Message Content */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-600 mb-1">
          Universal Message Content:
        </label>
        <Textarea
          id="content"
          value={data.content}
          onChange={(e) => handleContentChange(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 custom-scrollbar"
          placeholder="Enter universal message text here... You can use {{ link_code }} for trackable links."
        />
        <p className="text-xs text-gray-500 mt-1">
          Use macros like {`{{ lead.name }}`} or {`{{ bot.variable }}`}. For trackable links, define them below and use{" "}
          {`{{ ^link_code }}`}.
        </p>
      </div>

      {/* 2. Next Step Field */}
      <div className="pt-4 border-t">
        <label htmlFor="next-step" className="block text-sm font-medium text-gray-600 mb-1">
          Следующий шаг (Next Step):
        </label>
        <Input
          id="next-step"
          value={data.next_step || ""}
          onChange={(e) => handleNextStepChange(e.target.value)}
          className="w-full"
          placeholder="Код следующего шага (можно оставить пустым)"
        />
        <p className="text-xs text-gray-500 mt-1">
          Основной переход после отправки сообщения. Работает независимо от кнопок.
        </p>
      </div>

      {/* 3. Channel Customization */}
      <div className="pt-4 border-t">
        <div className="flex items-center space-x-2 mb-3">
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
                    {(data.content_per_channel?.[channelKey]?.content?.trim() ||
                      data.content_per_channel?.[channelKey]?.buttons?.length ||
                      data.content_per_channel?.[channelKey]?.image_url) && (
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
      </div>

      {/* 4. Buttons Section */}
      <div className="pt-4 border-t">
        <ButtonEditor
          buttons={data.buttons || []}
          onButtonsChange={(buttons) => {
            onUpdateData(node.id, { buttons: buttons.length > 0 ? buttons : undefined })
          }}
        />

        {/* 5. Button Values Section - показывается только если есть кнопки */}
        {hasButtons && (
          <div className="mt-4">
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
                      onUpdateData(node.id, {
                        buttons_value_target: {
                          scope: value,
                          key: data.buttons_value_target?.key || "",
                        },
                      })
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
                      onUpdateData(node.id, {
                        buttons_value_target: {
                          scope: data.buttons_value_target?.scope || "lead",
                          key: e.target.value,
                        },
                      })
                    }}
                    className="w-full"
                    placeholder="Например: user_choice, selected_option"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Значения кнопок будут записаны в этот атрибут при нажатии
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. Links Section */}
      <div className="pt-4 border-t">
        <LinkSection links={data.links || []} onChange={handleLinksChange} parentStepCode={data.code} />
      </div>
    </div>
  )
}

export default SendTextEditor
