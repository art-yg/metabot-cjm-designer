"use client"
import type { CJMNode, CJMNodeData } from "@/app/cjm-editor/types"
import EditorFactory from "./edit-panel-sections/editor-factory"

interface EditPanelProps {
  node: CJMNode
  onClose: () => void
  onUpdateData: (nodeId: string, newData: Partial<CJMNodeData>) => void
}

function EditPanel({ node, onClose, onUpdateData }: EditPanelProps) {
  return <EditorFactory node={node} onClose={onClose} onUpdateData={onUpdateData} />
}

export default EditPanel
