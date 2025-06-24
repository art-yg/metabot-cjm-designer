import type { Node } from "reactflow"
import type { LogActionNodeData } from "@/components/cjm-editor/nodes/log-action-node"

export function importLogAction(step: any): Node<LogActionNodeData> {
  const nodeData: LogActionNodeData = {
    code: step.code,
    type: "log_action",
    label: "Записать в аналитику",
    log_type: step.log_type || "step",
    way: step.way || "",
    step: step.step || "",
    event: step.event || "",
    tag: step.tag || "",
    tag_action: step.tag_action || "add",
    utter: step.utter || "",
    note: step.note || "",
    next_step: step.next_step || null,
  }

  return {
    id: step.code,
    type: "logAction",
    position: step.coordinates
      ? { x: step.coordinates.x, y: step.coordinates.y }
      : { x: Math.random() * 400, y: Math.random() * 400 },
    data: nodeData,
  }
}
