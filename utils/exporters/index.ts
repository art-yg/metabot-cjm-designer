import type { Node } from "reactflow"
import type { CJMNodeData } from "@/app/cjm-editor/page"
import { exportSendText } from "./send-text"
import { exportValueInput } from "./value-input"
import { exportLogAction } from "./log-action"
import { exportEntryPoint } from "./entry-point"
import { exportRunScript } from "./run-script"
import { exportGoToMapEntry } from "./go-to-map-entry"
import { exportWait } from "./wait"
import { exportTags } from "./tags"
import { exportCustomField } from "./custom-field"
import { exportIfElse } from "./if-else"
import { exportSwitch } from "./switch"

type NodeExporter = (node: Node<any>) => any

export const exporters: Record<string, NodeExporter> = {
  send_text: exportSendText,
  value_input: exportValueInput,
  log_action: exportLogAction,
  entry_point: exportEntryPoint,
  run_custom_script: exportRunScript,
  go_to_map_entry: exportGoToMapEntry,
  wait: exportWait,
  add_tags: exportTags,
  remove_tags: exportTags,
  set_custom_field: exportCustomField,
  if_else: exportIfElse,
  switch: exportSwitch,
}

export function exportNode(node: Node<CJMNodeData>): any {
  const exporter = exporters[node.data.type]
  if (exporter) {
    return exporter(node)
  }

  // Fallback for unknown node types
  const { label, ...restData } = node.data
  return {
    ...restData,
    coordinates: { x: Math.round(node.position.x), y: Math.round(node.position.y) },
  }
}
