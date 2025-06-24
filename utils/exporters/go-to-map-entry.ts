import type { Node } from "reactflow"
import type { GoToMapEntryNodeData } from "@/components/cjm-editor/nodes/go-to-map-entry-node"

export function exportGoToMapEntry(node: Node<GoToMapEntryNodeData>) {
  const { label, note, ...restData } = node.data

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
