import type { ChannelSettings } from "./deep-link-types"

export interface MapSettings {
  bot_id: string | number
  code: string
  title: string
  channels: ChannelSettings
}

export const DEFAULT_MAP_SETTINGS: MapSettings = {
  bot_id: 2370,
  code: "cjm_001",
  title: "Новая CJM-карта",
  channels: {
    telegram_bot_name: "",
    whatsapp_phone_number: "",
    vk_group_name: "",
    use_chat_widget: false,
  },
}

export function validateMapSettings(settings: MapSettings): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!settings.bot_id || settings.bot_id.toString().trim() === "") {
    errors.push("Bot ID обязателен для заполнения")
  }

  if (!settings.code || settings.code.toString().trim() === "") {
    errors.push("Код карты обязателен для заполнения")
  }

  if (!settings.title || settings.title.toString().trim() === "") {
    errors.push("Название карты обязательно для заполнения")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
