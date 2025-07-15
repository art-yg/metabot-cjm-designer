"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RotateCcw, Eye, EyeOff } from "lucide-react"
import type { ApiSettings } from "@/lib/api-settings"
import { DEFAULT_API_SETTINGS, validateApiSettings } from "@/lib/api-settings"

interface ApiSettingsTabProps {
  settings: ApiSettings
  onUpdate: (settings: ApiSettings) => void
}

function ApiSettingsTab({ settings, onUpdate }: ApiSettingsTabProps) {
  const [showToken, setShowToken] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const handleFieldChange = (field: keyof ApiSettings, value: string) => {
    const newSettings = {
      ...settings,
      [field]: value,
    }
    onUpdate(newSettings)

    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([])
    }
  }

  const handleResetToDefault = () => {
    onUpdate(DEFAULT_API_SETTINGS)
    setErrors([])
  }

  const handleValidate = () => {
    const validation = validateApiSettings(settings)
    setErrors(validation.errors)
  }

  return (
    <div className="space-y-6">
      {errors.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
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

      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="format" className="text-sm font-medium text-gray-700">
              Формат <span className="text-red-500">*</span>
            </Label>
            <Input
              id="format"
              type="text"
              value={settings.format}
              onChange={(e) => handleFieldChange("format", e.target.value)}
              className="w-full"
              placeholder="CJM"
            />
            <p className="text-xs text-gray-500">Формат схемы (Customer Journey Map)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="version" className="text-sm font-medium text-gray-700">
              Версия <span className="text-red-500">*</span>
            </Label>
            <Input
              id="version"
              type="text"
              value={settings.version}
              onChange={(e) => handleFieldChange("version", e.target.value)}
              className="w-full"
              placeholder="1.0"
            />
            <p className="text-xs text-gray-500">Версия формата схемы</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="endpoint" className="text-sm font-medium text-gray-700">
            Endpoint URL <span className="text-red-500">*</span>
          </Label>
          <Input
            id="endpoint"
            type="url"
            value={settings.endpoint}
            onChange={(e) => handleFieldChange("endpoint", e.target.value)}
            className="w-full font-mono text-sm"
            placeholder="https://stage.metabot.dev/api/v1/bots/{bot_id}/call/cjm/import"
          />
          <p className="text-xs text-gray-500">
            URL для отправки CJM схемы в Metabot. Используйте {"{bot_id}"} для подстановки ID бота.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bearerToken" className="text-sm font-medium text-gray-700">
            Bearer Token <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="bearerToken"
              type={showToken ? "text" : "password"}
              value={settings.bearerToken}
              onChange={(e) => handleFieldChange("bearerToken", e.target.value)}
              className="w-full font-mono text-sm pr-10"
              placeholder="eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9..."
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => setShowToken(!showToken)}
            >
              {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Bearer токен для авторизации в API Metabot. Токен сохраняется локально в браузере.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={handleResetToDefault} className="flex items-center">
          <RotateCcw size={16} className="mr-2" />
          Сбросить к умолчанию
        </Button>
        <Button type="button" variant="outline" onClick={handleValidate}>
          Проверить настройки
        </Button>
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-700">
          <strong>Примечание:</strong> Настройки API сохраняются локально в браузере и не включаются в экспорт схемы.
          Формат и версия добавляются в экспортируемый JSON для идентификации типа схемы.
        </p>
      </div>
    </div>
  )
}

export default ApiSettingsTab
