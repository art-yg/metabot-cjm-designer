import type { Node } from "reactflow"
import type { RunScriptNodeData } from "@/components/cjm-editor/nodes/run-script-node"

export function exportRunScript(node: Node<RunScriptNodeData>) {
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
