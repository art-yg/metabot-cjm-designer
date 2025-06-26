import type { Node } from "reactflow"
import type { EntryPointNodeData } from "@/components/cjm-editor/nodes/entry-point-node"

export function importEntryPoint(step: any): Node<EntryPointNodeData> {
  const nodeData: EntryPointNodeData = {
    code: step.code,
    type: "entry_point",
    name: step.name || "Точка входа",
    label: "Точка входа",
    next_step: step.next_step || null,
    deep_links: step.deep_links || [], // Добавляем поддержку deep_links
  }

  return {
    id: step.code,
    type: "entryPoint",
    position: step.coordinates
      ? { x: step.coordinates.x, y: step.coordinates.y }
      : { x: Math.random() * 400, y: Math.random() * 400 },
    data: nodeData,
  }
}
