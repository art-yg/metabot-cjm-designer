import type { Node } from "reactflow"
import type { LogActionNodeData } from "@/components/cjm-editor/nodes/log-action-node"

export function exportLogAction(node: Node<LogActionNodeData>) {
  const { title, note, ...restData } = node.data

  // Remove empty note field if it's empty
  if (!note || !note.trim()) {
    return {
      ...restData,
      coordinates: { x: Math.round(node.position.x), y: Math.round(node.position.y) },
    }
  }

  return {
    ...restData,
    note,
    coordinates: { x: Math.round(node.position.x), y: Math.round(node.position.y) },
  }
}
