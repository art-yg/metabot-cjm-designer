import type { Node } from "reactflow"
import type { ValueInputNodeData } from "@/components/cjm-editor/nodes/value-input-node"

export function exportValueInput(node: Node<ValueInputNodeData>) {
  const { title, ...restData } = node.data
  const processedData = { ...restData }

  // Process reminders
  if (processedData.reminders && processedData.reminders.length > 0) {
    processedData.reminders = processedData.reminders.map((reminder) => {
      const { id, ...exportedReminder } = reminder
      const finalReminder: any = { ...exportedReminder }

      if (finalReminder.content_per_channel && Object.keys(finalReminder.content_per_channel).length === 0) {
        delete finalReminder.content_per_channel
      }
      return finalReminder
    })
  } else {
    if (processedData.reminders && processedData.reminders.length === 0) {
      delete processedData.reminders
    }
  }

  // Handle timeout configuration
  if (processedData.timeout && processedData.timeout.timeout_seconds > 0) {
    processedData.timeout = {
      timeout_seconds: processedData.timeout.timeout_seconds,
      exit_step: processedData.timeout.exit_step,
    }
  } else {
    delete processedData.timeout
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
