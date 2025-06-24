"use client"

import { ReactFlowProvider } from "reactflow"
import { CJMEditor } from "@/components/cjm-editor"
import { useCJMEditor } from "@/hooks/use-cjm-editor"

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
} from "@/app/cjm-editor/types"

import "reactflow/dist/style.css"

function CJMFlowEditor() {
  const editorState = useCJMEditor()
  return <CJMEditor editorState={editorState} />
}

export default function CJMEditorPage() {
  return (
    <ReactFlowProvider>
      <CJMFlowEditor />
    </ReactFlowProvider>
  )
}
