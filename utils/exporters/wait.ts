import type { Node } from "reactflow"
import type { WaitNodeData } from "@/components/cjm-editor/nodes/wait-node"

export function exportWait(node: Node<WaitNodeData>) {
  const { label, ...restData } = node.data

  return {
    ...restData,
    coordinates: { x: Math.round(node.position.x), y: Math.round(node.position.y) },
  }
}
