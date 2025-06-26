"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { MessageCircle, Phone, Users, WorkflowIcon as Widget } from "lucide-react"
import type { ChannelSettings } from "@/lib/map-settings"

interface ChannelsSettingsTabProps {
  channels: ChannelSettings
  onUpdate: (channels: ChannelSettings) => void
}

function ChannelsSettingsTab({ channels, onUpdate }: ChannelsSettingsTabProps) {
  // Обеспечиваем наличие channels с значениями по умолчанию
  const safeChannels = channels || {
    telegram_bot_name: "",
    whatsapp_phone_number: "",
    vk_group_name: "",
    use_chat_widget: false,
  }

  const handleFieldChange = (field: keyof ChannelSettings, value: string | boolean) => {
    onUpdate({
      ...safeChannels,
      [field]: value,
    })
  }

  return (
    <div className="space-y-6">
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-700">
          <strong>Настройки каналов</strong> используются для генерации Deep Links. Заполните параметры для тех каналов,
          которые планируете использовать.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Telegram */}
        <div className="space-y-3 p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <MessageCircle size={20} className="mr-2 text-blue-500" />
            <h3 className="font-medium text-gray-900">Telegram</h3>
          </div>
          <div className="space-y-2">
            <Label htmlFor="telegram_bot_name" className="text-sm font-medium text-gray-700">
              Bot Username
            </Label>
            <Input
              id="telegram_bot_name"
              type="text"
              value={safeChannels.telegram_bot_name || ""}
              onChange={(e) => handleFieldChange("telegram_bot_name", e.target.value)}
              className="w-full"
              placeholder="metabot_test_bot (без @)"
            />
            <p className="text-xs text-gray-500">Имя бота без символа @</p>
          </div>
        </div>

        {/* WhatsApp */}
        <div className="space-y-3 p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <Phone size={20} className="mr-2 text-green-500" />
            <h3 className="font-medium text-gray-900">WhatsApp</h3>
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp_phone_number" className="text-sm font-medium text-gray-700">
              Номер телефона
            </Label>
            <Input
              id="whatsapp_phone_number"
              type="text"
              value={safeChannels.whatsapp_phone_number || ""}
              onChange={(e) => handleFieldChange("whatsapp_phone_number", e.target.value)}
              className="w-full"
              placeholder="79991234567"
            />
            <p className="text-xs text-gray-500">Номер в формате 79xxxxxxxxx</p>
          </div>
        </div>

        {/* VK */}
        <div className="space-y-3 p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <Users size={20} className="mr-2 text-blue-600" />
            <h3 className="font-medium text-gray-900">VKontakte</h3>
          </div>
          <div className="space-y-2">
            <Label htmlFor="vk_group_name" className="text-sm font-medium text-gray-700">
              Имя группы/страницы
            </Label>
            <Input
              id="vk_group_name"
              type="text"
              value={safeChannels.vk_group_name || ""}
              onChange={(e) => handleFieldChange("vk_group_name", e.target.value)}
              className="w-full"
              placeholder="metabot_group"
            />
            <p className="text-xs text-gray-500">Имя публичной страницы или группы</p>
          </div>
        </div>

        {/* Chat Widget */}
        <div className="space-y-3 p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <Widget size={20} className="mr-2 text-purple-500" />
            <h3 className="font-medium text-gray-900">Chat Widget</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="use_chat_widget"
              checked={safeChannels.use_chat_widget}
              onCheckedChange={(checked) => handleFieldChange("use_chat_widget", !!checked)}
            />
            <Label htmlFor="use_chat_widget" className="text-sm font-medium text-gray-700">
              Использовать Chat Widget
            </Label>
          </div>
          <p className="text-xs text-gray-500">Включить поддержку виджета чата на сайте</p>
        </div>
      </div>
    </div>
  )
}

export default ChannelsSettingsTab
