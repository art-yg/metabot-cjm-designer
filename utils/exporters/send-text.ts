import type { Node } from "reactflow"
import type { SendTextNodeData } from "@/components/cjm-editor/nodes/send-text-node"
import type { Link } from "@/lib/link-types"
import type { Trigger, TriggerActionBlock } from "@/lib/trigger-types"
import type { CJMNode } from "@/app/cjm-editor/types"

// Helper to convert camelCase to snake_case
const toSnakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

// Helper to convert object keys to snake_case
const convertKeysToSnakeCase = (obj: any): any => {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) return obj.map(convertKeysToSnakeCase)
  if (typeof obj !== "object") return obj

  const converted: any = {}
  for (const key in obj) {
    const snakeKey = toSnakeCase(key)
    converted[snakeKey] = convertKeysToSnakeCase(obj[key])
  }
  return converted
}

// Helper to clean action block for export
const exportActionBlock = (block?: TriggerActionBlock): any | undefined => {
  if (!block) return undefined
  const { id, ...rest } = block // Remove client-side ID
  let exportedBlock: any = { ...rest }

  // Remove empty arrays and null/empty values
  if (exportedBlock.add_tags && exportedBlock.add_tags.length === 0) {
    const { add_tags, ...restBlock } = exportedBlock
    exportedBlock = restBlock
  }
  if (exportedBlock.remove_tags && exportedBlock.remove_tags.length === 0) {
    const { remove_tags, ...restBlock } = exportedBlock
    exportedBlock = restBlock
  }
  if (exportedBlock.next_step === null || exportedBlock.next_step === "") {
    const { next_step, ...restBlock } = exportedBlock
    exportedBlock = restBlock
  }
  if (exportedBlock.run_after_minutes === null || exportedBlock.run_after_minutes === undefined) {
    const { run_after_minutes, ...restBlock } = exportedBlock
    exportedBlock = restBlock
  }
  if (exportedBlock.run_at_datetime === null || exportedBlock.run_at_datetime === "") {
    const { run_at_datetime, ...restBlock } = exportedBlock
    exportedBlock = restBlock
  }

  // Convert to snake_case
  const snakeCaseBlock = convertKeysToSnakeCase(exportedBlock)
  return Object.keys(snakeCaseBlock).length > 0 ? snakeCaseBlock : undefined
}

// Helper to clean trigger for export
const exportTrigger = (trigger: Trigger): any => {
  const { id, is_js_condition_custom, ...rest } = trigger // Remove client-side ID and custom flag
  const exportedTrigger: any = { ...rest }

  exportedTrigger.on_true = exportActionBlock(trigger.on_true)
  exportedTrigger.on_false = exportActionBlock(trigger.on_false)

  // Remove default/empty values
  if (exportedTrigger.js_condition === "return true;") {
    const { js_condition, ...restTrigger } = exportedTrigger
    Object.assign(exportedTrigger, restTrigger)
  }
  if (exportedTrigger.run_after_minutes === null || exportedTrigger.run_after_minutes === undefined) {
    const { run_after_minutes, ...restTrigger } = exportedTrigger
    Object.assign(exportedTrigger, restTrigger)
  }
  if (exportedTrigger.run_at_datetime === null || exportedTrigger.run_at_datetime === "") {
    const { run_at_datetime, ...restTrigger } = exportedTrigger
    Object.assign(exportedTrigger, restTrigger)
  }
  if (exportedTrigger.event_value === null || exportedTrigger.event_value === "") {
    const { event_value, ...restTrigger } = exportedTrigger
    Object.assign(exportedTrigger, restTrigger)
  }

  // Convert to snake_case
  return convertKeysToSnakeCase(exportedTrigger)
}

// Helper to clean link for export
const exportLink = (link: Link): any => {
  const { id, ...rest } = link // Remove client-side ID
  const exportedLink: any = { ...rest }
  if (link.triggers && link.triggers.length > 0) {
    exportedLink.triggers = link.triggers.map(exportTrigger)
  } else {
    const { triggers, ...restLink } = exportedLink
    Object.assign(exportedLink, restLink)
  }
  return exportedLink
}

export function exportSendText(node: Node<SendTextNodeData>) {
  const { label, ...restData } = node.data
  const processedData: any = { ...restData } // Start with a mutable copy

  // Remove empty content_per_channel if it exists
  if (processedData.content_per_channel && Object.keys(processedData.content_per_channel).length === 0) {
    processedData.content_per_channel = undefined
  }

  // Process buttons - remove client-side IDs and clean up empty arrays
  if (processedData.buttons && processedData.buttons.length > 0) {
    processedData.buttons = processedData.buttons.map(({ id, ...buttonData }: any) => {
      const btn: any = { ...buttonData }
      // Убираем пустые значения
      if (btn.value === "") {
        const { value, ...restBtn } = btn
        Object.assign(btn, restBtn)
      }
      // Убираем пустые next_step
      if (!btn.next_step) {
        const { next_step, ...restBtn } = btn
        Object.assign(btn, restBtn)
      }
      // Убираем пустые массивы тегов
      if (btn.add_tags && btn.add_tags.length === 0) {
        const { add_tags, ...restBtn } = btn
        Object.assign(btn, restBtn)
      }
      if (btn.remove_tags && btn.remove_tags.length === 0) {
        const { remove_tags, ...restBtn } = btn
        Object.assign(btn, restBtn)
      }
      return btn
    })
  } else {
    processedData.buttons = undefined
  }

  // Clean up buttons_value_target if key is empty
  if (processedData.buttons_value_target && !processedData.buttons_value_target.key?.trim()) {
    processedData.buttons_value_target = undefined
  }

  // Process log_way_steps - remove client-side IDs
  if (processedData.log_way_steps && processedData.log_way_steps.steps.length > 0) {
    processedData.log_way_steps = processedData.log_way_steps.steps.map(({ id, ...stepData }: any) => {
      const cleanStep: any = { ...stepData }
      // Clean up empty fields from log_way_steps
      if (!cleanStep.way?.trim()) {
        const { way, ...rest } = cleanStep
        Object.assign(cleanStep, rest)
      }
      if (!cleanStep.step?.trim()) {
        const { step, ...rest } = cleanStep
        Object.assign(cleanStep, rest)
      }
      if (!cleanStep.event?.trim()) {
        const { event, ...rest } = cleanStep
        Object.assign(cleanStep, rest)
      }
      if (!cleanStep.tag?.trim()) {
        const { tag, ...rest } = cleanStep
        Object.assign(cleanStep, rest)
      }
      if (!cleanStep.utter?.trim()) {
        const { utter, ...rest } = cleanStep
        Object.assign(cleanStep, rest)
      }
      return cleanStep
    })
    if (processedData.log_way_steps.length === 0) processedData.log_way_steps = undefined
  } else {
    processedData.log_way_steps = undefined
  }

  // Process links
  if (processedData.links && processedData.links.length > 0) {
    processedData.links = processedData.links.map(exportLink)
  } else {
    processedData.links = undefined
  }

  // Remove label before final export
  const { label: removedLabel, ...finalData } = processedData

  return {
    ...finalData, // Contains all other fields like code, type, content, next_step etc.
    coordinates: { x: Math.round(node.position.x), y: Math.round(node.position.y) },
  }
}

export function exportSendTextNode(node: CJMNode): any {
  const data = node.data as SendTextNodeData

  const processedData: any = {
    code: data.code,
    label: data.label,
    content: data.content,
    type: "send_text",
    next_step: data.next_step,
  }

  // Add optional fields only if they exist and have content
  if (data.content_per_channel && Object.keys(data.content_per_channel).length > 0) {
    processedData.content_per_channel = data.content_per_channel
  }

  if (data.buttons && data.buttons.length > 0) {
    // Process buttons and ensure next_step is properly exported
    processedData.buttons = data.buttons.map((button: any) => {
      const btn: any = {
        id: button.id,
        title: button.title,
        next_step: button.next_step, // Используем правильное поле
      }

      // Add value only if it's not empty
      if (button.value && button.value.trim() !== "") {
        btn.value = button.value
      }

      // Add tags only if they're not empty
      if (button.add_tags && button.add_tags.length > 0) {
        btn.add_tags = button.add_tags
      }
      if (button.remove_tags && button.remove_tags.length > 0) {
        btn.remove_tags = button.remove_tags
      }

      return btn
    })
  }

  if (data.buttons_value_target && data.buttons_value_target.key) {
    processedData.buttons_value_target = data.buttons_value_target
  }

  if (data.log_way_steps && data.log_way_steps.steps.length > 0) {
    processedData.log_way_steps = data.log_way_steps
  }

  if (data.links && data.links.length > 0) {
    processedData.links = data.links
  }

  return processedData
}
