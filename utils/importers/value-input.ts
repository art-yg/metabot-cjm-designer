import type { Node } from "reactflow"
import type { ValueInputNodeData, ReminderItem } from "@/components/cjm-editor/nodes/value-input-node"
import { v4 as uuidv4 } from "uuid"
import type { LogWayStep } from "@/lib/analytics-types"

export function importValueInput(step: any): Node<ValueInputNodeData> {
  const importedReminders = (step.reminders || []).map(
    (rem: Omit<ReminderItem, "id">): ReminderItem => ({
      ...rem,
      id: uuidv4(),
      content_per_channel: rem.content_per_channel || undefined,
    }),
  )

  // Process log_way_steps - add client-side IDs
  const importedLogWaySteps = step.log_way_steps
    ? {
        steps: (step.log_way_steps || []).map(
          (logStep: any): LogWayStep => ({
            id: uuidv4(), // Add client-side ID
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

  const nodeData: ValueInputNodeData = {
    code: step.code,
    type: "value_input",
    title: "User Input",
    variable: step.variable || "user_variable",
    prompt: step.prompt || "",
    validation_template: step.validation_template,
    regexp: step.regexp,
    errmsg: step.errmsg,
    exit_condition: step.exit_condition,
    exit_step: step.exit_step || null,
    next_step: step.next_step || null,
    reminders: importedReminders,
    timeout: step.timeout
      ? {
          timeout_seconds: step.timeout.timeout_seconds || 120,
          exit_step: step.timeout.exit_step || null,
        }
      : undefined,
    log_way_steps: importedLogWaySteps, // Import log_way_steps
  }

  return {
    id: step.code,
    type: "valueInput",
    position: step.coordinates
      ? { x: step.coordinates.x, y: step.coordinates.y }
      : { x: Math.random() * 400, y: Math.random() * 400 },
    data: nodeData,
  }
}
