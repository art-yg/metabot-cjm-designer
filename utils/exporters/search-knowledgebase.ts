import type { Node } from "reactflow"
import type { SearchKnowledgebaseNodeData } from "@/components/cjm-editor/nodes/search-knowledgebase-node"

export function exportSearchKnowledgebase(node: Node<SearchKnowledgebaseNodeData>) {
  const { title, ...restData } = node.data
  const processedData: any = { ...restData }

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

  // Clean up empty domain field
  if (!processedData.domain?.trim()) {
    processedData.domain = undefined
  }

  // Clean up empty step references
  if (!processedData.next_step?.trim()) {
    processedData.next_step = undefined
  }
  if (!processedData.not_found_step?.trim()) {
    processedData.not_found_step = undefined
  }
  if (!processedData.error_step?.trim()) {
    processedData.error_step = undefined
  }

  return {
    ...processedData,
    coordinates: { x: Math.round(node.position.x), y: Math.round(node.position.y) },
  }
} 