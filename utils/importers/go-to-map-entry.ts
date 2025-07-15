import type { Node } from "reactflow"
import type { GoToMapEntryNodeData } from "@/components/cjm-editor/nodes/go-to-map-entry-node"

export function importGoToMapEntry(step: any): Node<GoToMapEntryNodeData> {
  const nodeData: GoToMapEntryNodeData = {
    code: step.code,
    type: "go_to_map_entry",
    target_map: step.target_map || "",
    entry_point: step.entry_point || "",
    note: step.note || "",
    title: "Переход в воронку",
  }

  return {
    id: step.code,
    type: "goToMapEntry",
    position: step.coordinates
      ? { x: step.coordinates.x, y: step.coordinates.y }
      : { x: Math.random() * 400, y: Math.random() * 400 },
    data: nodeData,
  }
}
