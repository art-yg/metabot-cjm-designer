import type { FormatType, Channel } from "./format-presets"

// Универсальный тип для контента канала
export interface ChannelContent {
  format: FormatType
  content: string
}

// Универсальный тип для переопределений по каналам
export type ChannelOverrides = Partial<Record<Channel, ChannelContent>>
