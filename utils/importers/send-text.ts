import type { Node } from "reactflow"
import type { SendTextNodeData } from "@/components/cjm-editor/nodes/send-text-node"
import type { SendTextButton } from "@/lib/button-types"
import { v4 as uuidv4 } from "uuid"
import type { LogWayStep } from "@/lib/analytics-types"
import type { Link } from "@/lib/link-types"
import type { Trigger, TriggerActionBlock } from "@/lib/trigger-types"

// Helper to convert snake_case to camelCase
const toCamelCase = (str: string): string => {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
}

// Helper to convert object keys from snake_case to camelCase
const convertKeysToCamelCase = (obj: any): any => {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) return obj.map(convertKeysToCamelCase)
  if (typeof obj !== "object") return obj

  const converted: any = {}
  for (const key in obj) {
    const camelKey = toCamelCase(key)
    converted[camelKey] = convertKeysToCamelCase(obj[key])
  }
  return converted
}

// Helper to import action block
const importActionBlock = (block: any): TriggerActionBlock | undefined => {
  if (!block) return undefined
  const camelBlock = convertKeysToCamelCase(block)
  return {
    id: uuidv4(), // Add client-side ID
    add_tags: camelBlock.addTags || [],
    remove_tags: camelBlock.removeTags || [],
    next_step: camelBlock.nextStep || null,
    run_after_minutes: camelBlock.runAfterMinutes || null,
    run_at_datetime: camelBlock.runAtDatetime || null,
  }
}

// Helper to import trigger
const importTrigger = (triggerData: any): Trigger => {
  const camelTriggerData = convertKeysToCamelCase(triggerData)
  return {
    id: uuidv4(), // Add client-side ID
    code: camelTriggerData.code || "",
    title: camelTriggerData.title || "",
    active: camelTriggerData.active === undefined ? true : camelTriggerData.active, // Default active to true
    event_type: camelTriggerData.eventType || "custom_timer",
    event_value: camelTriggerData.eventValue || undefined,
    js_condition: camelTriggerData.jsCondition || "return true;", // Default if not present
    is_js_condition_custom: !!camelTriggerData.jsCondition && camelTriggerData.jsCondition !== "return true;",
    run_after_minutes: camelTriggerData.runAfterMinutes || null,
    run_at_datetime: camelTriggerData.runAtDatetime || null,
    on_true: importActionBlock(camelTriggerData.onTrue),
    on_false: importActionBlock(camelTriggerData.onFalse),
  }
}

// Helper to import link
const importLink = (linkData: any): Link => {
  const camelLinkData = convertKeysToCamelCase(linkData)
  return {
    id: uuidv4(), // Add client-side ID
    code: camelLinkData.code || "",
    title: camelLinkData.title || "",
    url: camelLinkData.url || "",
    triggers: (camelLinkData.triggers || []).map(importTrigger),
  }
}

export function importSendText(step: any): Node<SendTextNodeData> {
  const importedButtons: SendTextButton[] = (step.buttons || []).map((btn: any) => ({
    id: uuidv4(),
    title: btn.title || "",
    next_step: btn.next_step || btn.target_code || null,
    row: btn.row || undefined,
    input_code: btn.input_code || "",
    js_condition: btn.js_condition || "",
    value: btn.value || "",
    add_tags: btn.add_tags || [],
    remove_tags: btn.remove_tags || [],
  }))

  let importedLogWaySteps = step.log_way_steps
    ? {
        steps: (Array.isArray(step.log_way_steps) ? step.log_way_steps : step.log_way_steps.steps || []).map(
          // Handle both array and object structures
          (logStep: any): LogWayStep => ({
            id: uuidv4(),
            type: logStep.type || "step",
            way: logStep.way || "",
            step: logStep.step || "",
            event: logStep.event || "",
            tag: logStep.tag || "",
            tag_action: logStep.tag_action || "add",
            utter: logStep.utter || "",
          }),
        ),
      }
    : undefined

  if (importedLogWaySteps && importedLogWaySteps.steps.length === 0) {
    importedLogWaySteps = undefined
  }

  const importedLinks: Link[] = (step.links || []).map(importLink)

  const nodeData: SendTextNodeData = {
    code: step.code,
    type: "send_text", // This is the internal type for the step data
    content: step.content || "",
    next_step: step.next_step || null,
    label: "Send Text", // Client-side label for React Flow node
    content_per_channel: step.content_per_channel || undefined,
    buttons: importedButtons.length > 0 ? importedButtons : undefined,
    buttons_value_target: step.buttons_value_target || undefined,
    log_way_steps: importedLogWaySteps,
    links: importedLinks.length > 0 ? importedLinks : undefined,
  }

  return {
    id: step.code, // React Flow node ID is the step code
    type: "sendText", // React Flow node type
    position: step.coordinates
      ? { x: step.coordinates.x, y: step.coordinates.y }
      : { x: Math.random() * 400, y: Math.random() * 400 },
    data: nodeData,
  }
}
