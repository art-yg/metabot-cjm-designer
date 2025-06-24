// Типы для встроенной аналитики
export type LogWayStepType = "step" | "event" | "tag" | "utter"
export type TagAction = "add" | "remove"

export interface LogWayStep {
  id: string // Client-side ID для React keys
  type: LogWayStepType
  way?: string // Обязателен для type === "step", опционален для остальных
  step?: string // Обязателен для type === "step"
  event?: string // Обязателен для type === "event"
  tag?: string // Обязателен для type === "tag"
  tag_action?: TagAction // Обязателен для type === "tag"
  utter?: string // Обязателен для type === "utter", опционален для остальных
}

export interface LogWayData {
  steps: LogWayStep[]
}

// Валидация полей в зависимости от типа
export function validateLogWayStep(step: LogWayStep): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  switch (step.type) {
    case "step":
      if (!step.step?.trim()) errors.push("Поле 'Шаг' обязательно для типа 'step'")
      if (!step.way?.trim()) errors.push("Поле 'Way' обязательно для типа 'step'")
      break
    case "event":
      if (!step.event?.trim()) errors.push("Поле 'Событие' обязательно для типа 'event'")
      break
    case "tag":
      if (!step.tag?.trim()) errors.push("Поле 'Тег' обязательно для типа 'tag'")
      if (!step.tag_action) errors.push("Поле 'Действие с тегом' обязательно для типа 'tag'")
      break
    case "utter":
      if (!step.utter?.trim()) errors.push("Поле 'Высказывание' обязательно для типа 'utter'")
      break
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Получить отображаемое название типа
export function getLogWayStepTypeLabel(type: LogWayStepType): string {
  const labels = {
    step: "Шаг",
    event: "Событие",
    tag: "Тег",
    utter: "Высказывание",
  }
  return labels[type]
}

// Получить краткое описание записи для отображения
export function getLogWayStepSummary(step: LogWayStep): string {
  switch (step.type) {
    case "step":
      return `${step.step || "не указан"} (${step.way || "без way"})`
    case "event":
      return `${step.event || "не указано"}`
    case "tag":
      return `${step.tag || "не указан"} (${step.tag_action || "add"})`
    case "utter":
      return `${step.utter || "не указано"}`
    default:
      return "Неизвестный тип"
  }
}
