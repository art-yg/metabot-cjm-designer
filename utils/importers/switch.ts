import type { Node } from "reactflow"
import type { SwitchNodeData, SwitchCase } from "@/components/cjm-editor/nodes/switch-node"
import { v4 as uuidv4 } from "uuid"

export function importSwitch(step: any): Node<SwitchNodeData> {
  // Add client-side IDs to cases
  const importedCases = (step.cases || []).map(
    (caseItem: any): SwitchCase => ({
      ...caseItem,
      id: uuidv4(),
      step: caseItem.step || null,
    }),
  )

  const nodeData: SwitchNodeData = {
    code: step.code,
    type: "switch",
    label: "Switch",
    cases: importedCases,
    default_step: step.default_step || null,
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
