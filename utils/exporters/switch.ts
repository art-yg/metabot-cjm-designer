import type { Node } from "reactflow"
import type { SwitchNodeData } from "@/components/cjm-editor/nodes/switch-node"

export function exportSwitch(node: Node<SwitchNodeData>) {
  const { title, ...restData } = node.data

  // Remove client-side IDs from cases
  const exportedCases = restData.cases.map(({ id, ...caseData }) => caseData)
  const processedData = { ...restData, cases: exportedCases }

  // ❌ Убрали обработку log_way_steps - развилки не логируют аналитику

  return {
    ...processedData,
    coordinates: { x: Math.round(node.position.x), y: Math.round(node.position.y) },
  }
}
