import type { Node } from "reactflow"
import type { SwitchNodeData } from "@/components/cjm-editor/nodes/switch-node"

export function exportSwitch(node: Node<SwitchNodeData>) {
  const { label, ...restData } = node.data
  const processedData = { ...restData }

  // Remove client-side IDs from cases
  const exportedCases = processedData.cases.map(({ id, ...caseData }) => caseData)
  processedData.cases = exportedCases

  // Process log_way_steps - remove client-side IDs and export as log_way_steps
  if (processedData.log_way_steps && processedData.log_way_steps.steps.length > 0) {
    const exportedSteps = processedData.log_way_steps.steps.map(({ id, ...stepData }) => {
      // Clean up empty fields
      const cleanStep: any = { ...stepData }
      if (!cleanStep.way?.trim()) delete cleanStep.way
      if (!cleanStep.step?.trim()) delete cleanStep.step
      if (!cleanStep.event?.trim()) delete cleanStep.event
      if (!cleanStep.tag?.trim()) delete cleanStep.tag
      if (!cleanStep.utter?.trim()) delete cleanStep.utter
      return cleanStep
    })
    processedData.log_way_steps = exportedSteps
  } else {
    delete processedData.log_way_steps
  }

  return {
    ...processedData,
    coordinates: { x: Math.round(node.position.x), y: Math.round(node.position.y) },
  }
}
