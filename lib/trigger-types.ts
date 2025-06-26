export type TriggerEventType =
  | "link_clicked"
  | "link_ignored"
  | "custom_timer" // Example for future use
  | string // Allow other custom event types

export interface TriggerActionBlock {
  id?: string // Client-side ID for re-ordering, etc.
  add_tags?: string[]
  remove_tags?: string[]
  next_step?: string | null
  run_after_minutes?: number | null
  run_at_datetime?: string | null // ISO string
}

export interface Trigger {
  id: string // Client-side unique ID (e.g., uuidv4())
  code: string // User-defined or auto-generated, unique within its context (e.g., link or step)
  title?: string
  active: boolean
  event_type: TriggerEventType
  event_value?: string | null // e.g., link code for link_clicked/ignored, or other relevant value
  js_condition?: string
  is_js_condition_custom?: boolean // Flag to track if js_condition was manually edited
  run_after_minutes?: number | null
  run_at_datetime?: string | null // ISO string
  on_true?: TriggerActionBlock
  on_false?: TriggerActionBlock
}
