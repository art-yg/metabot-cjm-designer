import type { Node } from "reactflow"
import type { IfElseNodeData } from "@/components/cjm-editor/nodes/if-else-node"

export function exportIfElse(node: Node<IfElseNodeData>) {
  const { title, ...restData } = node.data

  // ❌ Убрали обработку log_way_steps - развилки не логируют аналитику

  return {
    ...restData,
    coordinates: { x: Math.round(node.position.x), y: Math.round(node.position.y) },
  }
}
