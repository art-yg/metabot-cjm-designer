import type { Node } from "reactflow"
import type { EntryPointNodeData } from "@/components/cjm-editor/nodes/entry-point-node"

export function exportEntryPoint(node: Node<EntryPointNodeData>) {
  const { title, ...restData } = node.data

  return {
    ...restData,
    coordinates: { x: Math.round(node.position.x), y: Math.round(node.position.y) },
    // deep_links уже включены в restData, так как они часть EntryPointNodeData
  }
}
