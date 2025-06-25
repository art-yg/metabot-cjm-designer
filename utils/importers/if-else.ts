import type { Node } from "reactflow"
import type { IfElseNodeData } from "@/components/cjm-editor/nodes/if-else-node"

export function importIfElse(step: any): Node<IfElseNodeData> {
  // ❌ Убрали обработку log_way_steps - развилки не логируют аналитику

  const nodeData: IfElseNodeData = {
    code: step.code,
    type: "if_else",
    label: "Условие",
    condition: step.condition || "",
    next_step: step.next_step || null,
    else_step: step.else_step || null,
    // ❌ Убрали log_way_steps
  }

  return {
    id: step.code,
    type: "ifElse",
    position: step.coordinates
      ? { x: step.coordinates.x, y: step.coordinates.y }
      : { x: Math.random() * 400, y: Math.random() * 400 },
    data: nodeData,
  }
}
