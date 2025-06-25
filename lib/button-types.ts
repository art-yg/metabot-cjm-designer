export interface SendTextButton {
  id: string // Client-side ID для React keys
  title: string
  next_step: string | null // было: target_code
  row: number
  input_code: string
  js_condition: string
  value?: string // Новое опциональное поле - значение для записи в атрибут
}

// Новый тип для настройки записи значений
export interface ButtonsValueTarget {
  scope: "lead" | "bot" // Область атрибута
  key: string // Название атрибута
}
