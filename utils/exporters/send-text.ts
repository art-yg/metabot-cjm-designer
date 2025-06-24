import type { Node } from "reactflow"
import type { SendTextNodeData } from "@/components/cjm-editor/nodes/send-text-node"

export function exportSendText(node: Node<SendTextNodeData>) {
  const { label, ...restData } = node.data

  // Remove empty content_per_channel if it exists
  if (restData.content_per_channel && Object.keys(restData.content_per_channel).length === 0) {
    const { content_per_channel, ...sendTextRest } = restData
    return {
      ...sendTextRest,
      coordinates: { x: Math.round(node.position.x), y: Math.round(node.position.y) },
    }
  }

  // Process buttons - remove client-side IDs but export ALL buttons
  const processedData = { ...restData }
  if (processedData.buttons && processedData.buttons.length > 0) {
    // Export ALL buttons, even if they have empty fields
    const allButtons = processedData.buttons.map(({ id, ...buttonData }) => {
      // Clean up empty value field if it's empty string
      if (buttonData.value === "") {
        const { value, ...cleanButtonData } = buttonData
        return cleanButtonData
      }
      return buttonData
    })

    processedData.buttons = allButtons
  } else {
    delete processedData.buttons // Remove if empty array
  }

  // Clean up buttons_value_target if key is empty
  if (processedData.buttons_value_target && !processedData.buttons_value_target.key.trim()) {
    delete processedData.buttons_value_target
  }

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
