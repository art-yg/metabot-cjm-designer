import type { Node } from "reactflow"
import type { SwitchNodeData, SwitchCase } from "@/components/cjm-editor/nodes/switch-node"
import { v4 as uuidv4 } from "uuid"
import type { LogWayStep } from "@/lib/analytics-types"

export function importSwitch(step: any): Node<SwitchNodeData> {
  // Add client-side IDs to cases
  const importedCases = (step.cases || []).map(
    (caseItem: any): SwitchCase => ({
      ...caseItem,
      id: uuidv4(),
      step: caseItem.step || null,
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

  const nodeData: SwitchNodeData = {
    code: step.code,
    type: "switch",
    label: "Switch",
    cases: importedCases,
    default_step: step.default_step || null,
    log_way_steps: importedLogWaySteps, // Import log_way_steps
  }

  return {
    id: step.code,
    type: "switch",
    position: step.coordinates
      ? { x: step.coordinates.x, y: step.coordinates.y }
      : { x: Math.random() * 400, y: Math.random() * 400 },
    data: nodeData,
  }
}
