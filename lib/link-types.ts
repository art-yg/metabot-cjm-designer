import type { Trigger } from "./trigger-types"

export interface Link {
  id: string // Client-side unique ID (e.g., uuidv4())
  code: string // User-defined, unique within the send_text step's links
  title?: string
  url: string
  triggers?: Trigger[]
}
