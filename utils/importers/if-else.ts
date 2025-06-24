import type { Node } from "reactflow"
import type { IfElseNodeData } from "@/components/cjm-editor/nodes/if-else-node"
import type { LogWayStep } from "@/lib/analytics-types"
import { v4 as uuidv4 } from "uuid"

export function importIfElse(step: any): Node<IfElseNodeData> {
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

  const nodeData: IfElseNodeData = {
    code: step.code,
    type: "if_else",
    label: "Условие",
    condition: step.condition || "",
    next_step: step.next_step || null,
    else_step: step.else_step || null,
    log_way_steps: importedLogWaySteps, // Import log_way_steps
  }

  return {
    id: step.code,
    type: "ifElse",
    position: step.coordinates
      ? { x: step.coordinates.x, y: step.coordinates.y }
      : { x: Math.random() * 400, y: Math.random() * 400 },
    data: nodeData,
  }
}
