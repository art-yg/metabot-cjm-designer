export interface MapSettings {
  bot_id: string | number
  code: string
  title: string
}

export const DEFAULT_MAP_SETTINGS: MapSettings = {
  bot_id: 2370, // Default bot ID
  code: "cjm_001", // Default map code
  title: "Новая CJM-карта", // Default title
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
