"use client"

import { ReactFlowProvider } from "reactflow"
import { CJMDesigner } from "@/components/cjm-designer"
import { useCJMDesigner } from "@/hooks/use-cjm-designer"

// Re-export types for backward compatibility
export type {
  SendTextNodeData,
  ValueInputNodeData,
  RunScriptNodeData,
  EntryPointNodeData,
  GoToMapEntryNodeData,
  WaitNodeData,
  TagsNodeData,
  CustomFieldNodeData,
  IfElseNodeData,
  SwitchNodeData,
  SwitchCase,
  LogActionNodeData,
  CJMNodeData,
  CJMNode,
} from "@/app/cjm-designer/types"

import "reactflow/dist/style.css"

function CJMFlowDesigner() {
  const editorState = useCJMDesigner()
  return <CJMDesigner editorState={editorState} />
}

export default function CJMDesignerPage() {
  return (
    <ReactFlowProvider>
              <CJMFlowDesigner />
    </ReactFlowProvider>
  )
}
