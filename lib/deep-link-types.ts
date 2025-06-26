export interface DeepLinkParameter {
  key: string
  value: string
}

export interface DeepLink {
  code: string
  title: string // Оставляем для совместимости, но не используем в UI
  text?: string // Для WhatsApp
  active: boolean
  parameters: DeepLinkParameter[]
}

export interface ChannelSettings {
  telegram_bot_name?: string
  whatsapp_phone_number?: string
  vk_group_name?: string
  use_chat_widget: boolean
}

export const DEFAULT_CHANNEL_SETTINGS: ChannelSettings = {
  telegram_bot_name: "",
  whatsapp_phone_number: "",
  vk_group_name: "",
  use_chat_widget: false,
}
