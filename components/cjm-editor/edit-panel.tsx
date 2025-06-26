"use client"
import type { CJMNode, CJMNodeData } from "@/app/cjm-editor/types"
import type { MapSettings } from "@/lib/map-settings"
import EditorFactory from "./edit-panel-sections/editor-factory"

interface EditPanelProps {
  node: CJMNode
  onClose: () => void
  onUpdateData: (nodeId: string, newData: Partial<CJMNodeData>) => void
  mapSettings: MapSettings
}

function EditPanel({ node, onClose, onUpdateData, mapSettings }: EditPanelProps) {
  console.log("EditPanel mapSettings:", mapSettings)

  return <EditorFactory node={node} onClose={onClose} onUpdateData={onUpdateData} mapSettings={mapSettings} />
}

export default EditPanel
