import type { Node } from "reactflow"
import type { CJMNodeData } from "@/app/cjm-editor/page"
import { importSendText } from "./send-text"
import { importValueInput } from "./value-input"
import { importLogAction } from "./log-action"
import { importEntryPoint } from "./entry-point"
import { importRunScript } from "./run-script"
import { importGoToMapEntry } from "./go-to-map-entry"
import { importWait } from "./wait"
import { importTags } from "./tags"
import { importCustomField } from "./custom-field"
import { importIfElse } from "./if-else"
import { importSwitch } from "./switch"
import { importCallLLM } from "./call-llm"

type NodeImporter = (step: any) => Node<CJMNodeData>

export const importers: Record<string, NodeImporter> = {
  send_text: importSendText,
  value_input: importValueInput,
  log_action: importLogAction,
  entry_point: importEntryPoint,
  run_custom_script: importRunScript,
  go_to_map_entry: importGoToMapEntry,
  wait: importWait,
  add_tags: importTags,
  remove_tags: importTags,
  set_custom_field: importCustomField,
  if_else: importIfElse,
  switch: importSwitch,
  call_llm: importCallLLM,
}

export function importNode(step: any): Node<CJMNodeData> | null {
  const importer = importers[step.type]
  if (importer) {
    return importer(step)
  }

  console.warn(`Unsupported step type during import: ${step.type}. Skipping step ${step.code}.`)
  return null
}
