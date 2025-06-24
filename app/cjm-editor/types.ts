// Re-export all types from their original locations for centralized access
export type { SendTextNodeData } from "@/components/cjm-editor/nodes/send-text-node"
export type { ValueInputNodeData, ReminderItem } from "@/components/cjm-editor/nodes/value-input-node"
export type { RunScriptNodeData } from "@/components/cjm-editor/nodes/run-script-node"
export type { EntryPointNodeData } from "@/components/cjm-editor/nodes/entry-point-node"
export type { GoToMapEntryNodeData } from "@/components/cjm-editor/nodes/go-to-map-entry-node"
export type { WaitNodeData, DelayConfig } from "@/components/cjm-editor/nodes/wait-node"
export type { TagsNodeData } from "@/components/cjm-editor/nodes/tags-node"
export type {
  CustomFieldNodeData,
  CustomFieldValueType,
  CustomFieldScope,
} from "@/components/cjm-editor/nodes/custom-field-node"
export type { IfElseNodeData } from "@/components/cjm-editor/nodes/if-else-node"
export type { SwitchNodeData, SwitchCase } from "@/components/cjm-editor/nodes/switch-node"
export type { LogActionNodeData, LogActionType, TagAction } from "@/components/cjm-editor/nodes/log-action-node"

import type { Node } from "reactflow"
import type {
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
  LogActionNodeData,
} from "@/app/cjm-editor/types"

// Union type for all node data
export type CJMNodeData =
  | SendTextNodeData
  | ValueInputNodeData
  | RunScriptNodeData
  | EntryPointNodeData
  | GoToMapEntryNodeData
  | WaitNodeData
  | TagsNodeData
  | CustomFieldNodeData
  | IfElseNodeData
  | SwitchNodeData
  | LogActionNodeData

// CJM Node type
export type CJMNode = Node<CJMNodeData>
