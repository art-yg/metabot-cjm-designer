import type { Node } from "reactflow"
import type { WaitNodeData } from "@/components/cjm-editor/nodes/wait-node"

export function importWait(step: any): Node<WaitNodeData> {
  const nodeData: WaitNodeData = {
    code: step.code,
    type: "wait",
    label: "Ожидание",
    delay: step.delay || {
      days: 0,
      hours: 0,
      minutes: 5,
      seconds: 0,
    },
    next_step: step.next_step || null,
  }

  return {
    id: step.code,
    type: "wait",
    position: step.coordinates
      ? { x: step.coordinates.x, y: step.coordinates.y }
      : { x: Math.random() * 400, y: Math.random() * 400 },
    data: nodeData,
  }
}
