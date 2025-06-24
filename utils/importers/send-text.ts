import type { Node } from "reactflow"
import type { SendTextNodeData } from "@/components/cjm-editor/nodes/send-text-node"
import type { SendTextButton } from "@/lib/button-types"
import { v4 as uuidv4 } from "uuid"
import type { LogWayStep } from "@/lib/analytics-types"

export function importSendText(step: any): Node<SendTextNodeData> {
  // Process buttons - add client-side IDs and import ALL buttons from JSON
  const importedButtons: SendTextButton[] = (step.buttons || []).map((btn: any) => ({
    id: uuidv4(), // Add client-side ID
    title: btn.title || "", // Import even if empty
    target_code: btn.target_code || null, // Import even if null
    row: btn.row || 1,
    input_code: btn.input_code || "",
    js_condition: btn.js_condition || "",
    value: btn.value || "", // Import value field
  }))

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

  const nodeData: SendTextNodeData = {
    code: step.code,
    type: "send_text",
    content: step.content || "",
    next_step: step.next_step || null,
    label: "Send Text Message",
    content_per_channel: step.content_per_channel || undefined,
    buttons: importedButtons.length > 0 ? importedButtons : undefined,
    buttons_value_target: step.buttons_value_target || undefined, // Import buttons_value_target
    log_way_steps: importedLogWaySteps, // Import log_way_steps
  }

  return {
    id: step.code,
    type: "sendText",
    position: step.coordinates
      ? { x: step.coordinates.x, y: step.coordinates.y }
      : { x: Math.random() * 400, y: Math.random() * 400 },
    data: nodeData,
  }
}
