import type { Node } from "reactflow"
import type { RunScriptNodeData } from "@/components/cjm-editor/nodes/run-script-node"

export function importRunScript(step: any): Node<RunScriptNodeData> {
  const nodeData: RunScriptNodeData = {
    code: step.code,
    type: "run_custom_script",
    label: "Запустить скрипт",
    script_code: step.script_code || "",
    note: step.note || "",
  }

  return {
    id: step.code,
    type: "runScript",
    position: step.coordinates
      ? { x: step.coordinates.x, y: step.coordinates.y }
      : { x: Math.random() * 400, y: Math.random() * 400 },
    data: nodeData,
  }
}
