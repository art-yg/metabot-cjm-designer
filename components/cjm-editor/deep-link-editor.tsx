"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  Copy,
  Trash2,
  ExternalLink,
  Send,
  MessageSquare,
  Users,
  WorkflowIcon as Widget,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { toast } from "react-hot-toast"
import type { DeepLink, ChannelSettings } from "@/lib/deep-link-types"
import { deepLinkGenerator } from "@/lib/deep-link-generator"
import DeepLinkParametersEditor from "./deep-link-parameters-editor"

interface DeepLinkEditorProps {
  deepLink: DeepLink
  channels: ChannelSettings
  onUpdate: (deepLink: DeepLink) => void
  onDelete: () => void
}

function DeepLinkEditor({ deepLink, channels, onUpdate, onDelete }: DeepLinkEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFieldChange = (field: keyof DeepLink, value: any) => {
    onUpdate({ ...deepLink, [field]: value })
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} скопирована!`)
    } catch (err) {
      toast.error("Ошибка копирования")
    }
  }

  const hash = deepLinkGenerator.generateHash(deepLink.code)
  const urls = deepLinkGenerator.generateUrls(deepLink, channels)
  const chatWidgetJson = channels.use_chat_widget ? deepLinkGenerator.generateChatWidgetStructure(deepLink, hash) : null

  const hasAnyLinks = Object.keys(urls).length > 0 || chatWidgetJson

  return (
    <div className="border border-gray-200 rounded-md bg-white">
      {/* Header - точно как в ButtonEditor */}
      <div
        className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <ExternalLink size={16} className="text-blue-600" />
          <span className="font-medium text-sm">{deepLink.code || "Новая ссылка"}</span>
          {!deepLink.active && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Неактивна</span>}
          {deepLink.parameters.length > 0 && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              {deepLink.parameters.length} параметр(ов)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
          >
            <Trash2 size={14} />
          </Button>
          {isExpanded ? (
            <ChevronDown size={16} className="text-gray-400" />
          ) : (
            <ChevronRight size={16} className="text-gray-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <>
          <Separator />
          <div className="p-3 space-y-4">
            {/* Код Deep Link */}
            <div>
              <Label htmlFor="code" className="text-sm font-medium text-gray-700">
                Код Deep Link <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                value={deepLink.code}
                onChange={(e) => handleFieldChange("code", e.target.value)}
                placeholder="lead_magnet_deeplink"
                className="mt-1"
              />
            </div>

            {/* Текст для WhatsApp */}
            <div>
              <Label htmlFor="text" className="text-sm font-medium text-gray-700">
                Текст для WhatsApp (опционально)
              </Label>
              <Textarea
                id="text"
                value={deepLink.text || ""}
                onChange={(e) => handleFieldChange("text", e.target.value)}
                placeholder="Спасибо, что перешли по ссылке!"
                className="mt-1"
                rows={2}
              />
              <p className="text-xs text-gray-500 mt-1">
                Этот текст будет отправлен только в WhatsApp при переходе по ссылке
              </p>
            </div>

            {/* Hash Display */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Hash (генерируется автоматически)</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input value={hash} readOnly className="bg-gray-50 font-mono text-sm" />
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(hash, "Hash")} className="h-10 px-3">
                  <Copy size={14} />
                </Button>
              </div>
            </div>

            {/* Active Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="active"
                checked={deepLink.active}
                onCheckedChange={(checked) => handleFieldChange("active", checked)}
              />
              <Label htmlFor="active" className="text-sm font-medium text-gray-700">
                Активная ссылка
              </Label>
            </div>

            {/* Parameters */}
            <DeepLinkParametersEditor
              parameters={deepLink.parameters}
              onChange={(parameters) => handleFieldChange("parameters", parameters)}
            />

            {/* Generated URLs */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Сгенерированные ссылки</h4>

              {!hasAnyLinks ? (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">Настройте каналы в настройках карты для генерации ссылок</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {urls.telegram && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Send size={16} className="text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Telegram</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(urls.telegram, "Telegram ссылка")}
                          className="h-6 w-6 p-0 ml-auto"
                        >
                          <Copy size={12} />
                        </Button>
                      </div>
                      <Input
                        value={urls.telegram}
                        readOnly
                        className="bg-gray-50 font-mono text-xs"
                        onClick={(e) => e.target.select()}
                      />
                    </div>
                  )}

                  {urls.whatsapp && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MessageSquare size={16} className="text-green-600" />
                        <span className="text-sm font-medium text-green-800">WhatsApp</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(urls.whatsapp, "WhatsApp ссылка")}
                          className="h-6 w-6 p-0 ml-auto"
                        >
                          <Copy size={12} />
                        </Button>
                      </div>
                      <Input
                        value={urls.whatsapp}
                        readOnly
                        className="bg-gray-50 font-mono text-xs"
                        onClick={(e) => e.target.select()}
                      />
                    </div>
                  )}

                  {urls.vk && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">VK</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(urls.vk, "VK ссылка")}
                          className="h-6 w-6 p-0 ml-auto"
                        >
                          <Copy size={12} />
                        </Button>
                      </div>
                      <Input
                        value={urls.vk}
                        readOnly
                        className="bg-gray-50 font-mono text-xs"
                        onClick={(e) => e.target.select()}
                      />
                    </div>
                  )}

                  {chatWidgetJson && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Widget size={16} className="text-gray-600" />
                        <span className="text-sm font-medium text-gray-800">ChatWidget JSON</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(JSON.stringify(chatWidgetJson, null, 2), "ChatWidget JSON")}
                          className="h-6 w-6 p-0 ml-auto"
                        >
                          <Copy size={12} />
                        </Button>
                      </div>
                      <Textarea
                        value={JSON.stringify(chatWidgetJson, null, 2)}
                        readOnly
                        className="bg-gray-50 font-mono text-xs resize-none"
                        rows={8}
                        onClick={(e) => e.target.select()}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default DeepLinkEditor
