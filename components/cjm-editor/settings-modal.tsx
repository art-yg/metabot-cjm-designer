"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Save, Settings, Zap } from "lucide-react"
import { toast } from "react-hot-toast"
import type { MapSettings, ChannelSettings } from "@/lib/map-settings"
import { validateMapSettings } from "@/lib/map-settings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ChannelsSettingsTab from "./channels-settings-tab"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: MapSettings
  onSave: (settings: MapSettings) => void
}

function SettingsModal({ isOpen, onClose, settings, onSave }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<MapSettings>(settings)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (isOpen) {
      // Обеспечиваем наличие channels с значениями по умолчанию
      const settingsWithDefaults = {
        ...settings,
        channels: settings.channels || {
          telegram_bot_name: "",
          whatsapp_phone_number: "",
          vk_group_name: "",
          use_chat_widget: false,
        },
      }
      setLocalSettings(settingsWithDefaults)
      setErrors([])
    }
  }, [isOpen, settings])

  const handleSave = () => {
    const validation = validateMapSettings(localSettings)

    if (!validation.isValid) {
      setErrors(validation.errors)
      toast.error("Пожалуйста, исправьте ошибки в форме")
      return
    }

    setErrors([])
    onSave(localSettings)
    toast.success("Настройки карты сохранены!")
    onClose()
  }

  const handleFieldChange = (field: keyof MapSettings, value: string | number | ChannelSettings) => {
    setLocalSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([])
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Settings size={20} className="mr-2 text-gray-600" />
            Настройки карты
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general" className="flex items-center">
              <Settings size={16} className="mr-2" />
              Основные
            </TabsTrigger>
            <TabsTrigger value="channels" className="flex items-center">
              <Zap size={16} className="mr-2" />
              Каналы
            </TabsTrigger>
          </TabsList>

          <div className="py-4">
            {errors.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-6">
                <div className="flex items-start">
                  <AlertTriangle size={16} className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800 mb-1">Ошибки валидации:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {errors.map((error, idx) => (
                        <li key={idx} className="text-sm text-red-700">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <TabsContent value="general" className="space-y-6 mt-0">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bot_id" className="text-sm font-medium text-gray-700">
                    Bot ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="bot_id"
                    type="text"
                    value={localSettings.bot_id}
                    onChange={(e) => {
                      const value = e.target.value
                      const numValue = Number(value)
                      handleFieldChange("bot_id", isNaN(numValue) ? value : numValue)
                    }}
                    className="w-full"
                    placeholder="Например: 2370"
                  />
                  <p className="text-xs text-gray-500">
                    ID бота в системе MetaBot, в рамках которого будет создана карта
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code" className="text-sm font-medium text-gray-700">
                    Код карты <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    value={localSettings.code}
                    onChange={(e) => handleFieldChange("code", e.target.value)}
                    className="w-full"
                    placeholder="Например: welcome_flow"
                  />
                  <p className="text-xs text-gray-500">Уникальный код карты для идентификации в системе</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                    Название карты <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    value={localSettings.title}
                    onChange={(e) => handleFieldChange("title", e.target.value)}
                    className="w-full"
                    placeholder="Например: Приветственная воронка"
                  />
                  <p className="text-xs text-gray-500">Понятное название карты для отображения в интерфейсе</p>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">
                  <strong>Примечание:</strong> Эти настройки будут использованы при экспорте схемы в MetaBot. Убедитесь,
                  что все поля заполнены корректно.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="channels" className="mt-0">
              <ChannelsSettingsTab
                channels={localSettings.channels}
                onUpdate={(channels) => handleFieldChange("channels", channels)}
              />
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSave} className="flex items-center">
            <Save size={16} className="mr-2" />
            Сохранить настройки
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default SettingsModal
