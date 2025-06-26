// Общие макропеременные для текстовых полей
// Используются в send_text, custom_field, и других местах где нужен текст с подстановками

export interface MacroVariable {
  code: string
  description: string
  example: string
  category: "lead" | "bot" | "system" | "custom"
}

export const LEAD_MACROS: MacroVariable[] = [
  {
    code: "lead.name",
    description: "Имя пользователя",
    example: "{{ lead.name }}",
    category: "lead",
  },
  {
    code: "lead.phone",
    description: "Телефон пользователя",
    example: "{{ lead.phone }}",
    category: "lead",
  },
  {
    code: "lead.email",
    description: "Email пользователя",
    example: "{{ lead.email }}",
    category: "lead",
  },
  {
    code: "lead.first_name",
    description: "Имя",
    example: "{{ lead.first_name }}",
    category: "lead",
  },
  {
    code: "lead.last_name",
    description: "Фамилия",
    example: "{{ lead.last_name }}",
    category: "lead",
  },
]

export const BOT_MACROS: MacroVariable[] = [
  {
    code: "bot.name",
    description: "Название бота",
    example: "{{ bot.name }}",
    category: "bot",
  },
  {
    code: "bot.variable",
    description: "Переменная бота",
    example: "{{ bot.variable }}",
    category: "bot",
  },
]

export const SYSTEM_MACROS: MacroVariable[] = [
  {
    code: "system.date",
    description: "Текущая дата",
    example: "{{ system.date }}",
    category: "system",
  },
  {
    code: "system.time",
    description: "Текущее время",
    example: "{{ system.time }}",
    category: "system",
  },
]

export const ALL_TEXT_MACROS = [...LEAD_MACROS, ...BOT_MACROS, ...SYSTEM_MACROS]

// Функция для получения макросов по категории
export function getMacrosByCategory(category: MacroVariable["category"]): MacroVariable[] {
  return ALL_TEXT_MACROS.filter((macro) => macro.category === category)
}

// Функция для поиска макроса по коду
export function findMacroByCode(code: string): MacroVariable | undefined {
  return ALL_TEXT_MACROS.find((macro) => macro.code === code)
}

// Функция для валидации макроса в тексте
export function validateMacrosInText(text: string): { valid: boolean; invalidMacros: string[] } {
  const macroRegex = /\{\{\s*([^}]+)\s*\}\}/g
  const matches = text.match(macroRegex) || []
  const invalidMacros: string[] = []

  matches.forEach((match) => {
    const code = match.replace(/[{}]/g, "").trim()
    // Пропускаем ссылки (начинаются с ^)
    if (code.startsWith("^")) return

    if (!findMacroByCode(code)) {
      invalidMacros.push(match)
    }
  })

  return {
    valid: invalidMacros.length === 0,
    invalidMacros,
  }
}
