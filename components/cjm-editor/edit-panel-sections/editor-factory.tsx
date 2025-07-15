"use client"
import type { CJMNode } from "@/app/cjm-editor/types"
import type { MapSettings } from "@/lib/map-settings"
import BaseEditor from "./base-editor"
import SendTextEditor from "./send-text-editor"
import ValueInputEditor from "./value-input-editor"
import RunScriptEditor from "./run-script-editor"
import EntryPointEditor from "./entry-point-editor"
import GoToMapEntryEditor from "./go-to-map-entry-editor"
import WaitEditor from "./wait-editor"
import TagsEditor from "./tags-editor"
import CustomFieldEditor from "./custom-field-editor"
import IfElseEditor from "./if-else-editor"
import SwitchEditor from "./switch-editor"
import LogActionEditor from "./log-action-editor"
import CallLLMLEditor from "./call-llm-editor"

interface EditorFactoryProps {
  node: CJMNode
  onClose: () => void
  onUpdateData: (nodeId: string, newData: any) => void
  mapSettings: MapSettings
  checkCodeUniqueness?: (code: string, currentNodeId: string) => boolean
}

// Типы команд с аналитикой (точки выполнения действий)
const ANALYTICS_ENABLED_TYPES = ["send_text", "value_input", "add_tags", "remove_tags", "set_custom_field"] as const

function EditorFactory({ node, onClose, onUpdateData, mapSettings, checkCodeUniqueness }: EditorFactoryProps) {
  const nodeType = node.data.type
  const withAnalytics = ANALYTICS_ENABLED_TYPES.includes(nodeType as any)

  console.log("EditorFactory mapSettings:", mapSettings)

  const renderEditor = () => {
    switch (nodeType) {
      case "send_text":
        return <SendTextEditor node={node} onUpdateData={onUpdateData} />
      case "value_input":
        return <ValueInputEditor node={node} onUpdateData={onUpdateData} />
      case "run_custom_script":
        return <RunScriptEditor node={node} onUpdateData={onUpdateData} />
      case "entry_point":
        return <EntryPointEditor node={node} onUpdateData={onUpdateData} mapSettings={mapSettings} />
      case "go_to_map_entry":
        return <GoToMapEntryEditor node={node} onUpdateData={onUpdateData} />
      case "wait":
        return <WaitEditor node={node} onUpdateData={onUpdateData} />
      case "add_tags":
      case "remove_tags":
        return <TagsEditor node={node} onUpdateData={onUpdateData} />
      case "set_custom_field":
        return <CustomFieldEditor node={node} onUpdateData={onUpdateData} />
      case "if_else":
        return <IfElseEditor node={node} onUpdateData={onUpdateData} />
      case "switch":
        return <SwitchEditor node={node} onUpdateData={onUpdateData} />
      case "log_action":
        return <LogActionEditor node={node} onUpdateData={onUpdateData} />
      case "call_llm":
        return <CallLLMLEditor node={node} onUpdateData={onUpdateData} />
      default:
        return <p className="text-sm text-gray-500">This node type has no editable properties or is unknown.</p>
    }
  }

  return (
    <BaseEditor
      node={node}
      onClose={onClose}
      onUpdateData={onUpdateData}
      withAnalytics={withAnalytics}
      checkCodeUniqueness={checkCodeUniqueness}
      labelOverride={node.data.type === "call_llm" ? node.data.title : undefined}
    >
      {renderEditor()}
    </BaseEditor>
  )
}

export default EditorFactory
