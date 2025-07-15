// Re-export all types from their original locations for centralized access
export type { SendTextNodeData } from "@/components/cjm-designer/nodes/send-text-node"
export type { ValueInputNodeData, ReminderItem } from "@/components/cjm-designer/nodes/value-input-node"
export type { RunScriptNodeData } from "@/components/cjm-designer/nodes/run-script-node"
export type { EntryPointNodeData } from "@/components/cjm-designer/nodes/entry-point-node"
export type { GoToMapEntryNodeData } from "@/components/cjm-designer/nodes/go-to-map-entry-node"
export type { WaitNodeData, DelayConfig } from "@/components/cjm-designer/nodes/wait-node"
export type { TagsNodeData } from "@/components/cjm-designer/nodes/tags-node"
export type {
  CustomFieldNodeData,
  CustomFieldValueType,
  CustomFieldScope,
} from "@/components/cjm-designer/nodes/custom-field-node"
export type { IfElseNodeData } from "@/components/cjm-designer/nodes/if-else-node"
export type { SwitchNodeData, SwitchCase } from "@/components/cjm-designer/nodes/switch-node"
export type { LogActionNodeData, LogActionType, TagAction } from "@/components/cjm-designer/nodes/log-action-node"
export type { CallLLMNodeData } from "@/components/cjm-designer/nodes/call-llm-node"
export type { SearchKnowledgebaseNodeData } from "@/components/cjm-designer/nodes/search-knowledgebase-node"

// New types for Links and Triggers
export type { Link } from "@/lib/link-types"
export type { Trigger, TriggerActionBlock, TriggerEventType } from "@/lib/trigger-types"

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
  CallLLMNodeData,
  SearchKnowledgebaseNodeData,
} from "@/app/cjm-designer/types" // Self-reference is fine here

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
  | CallLLMNodeData
  | SearchKnowledgebaseNodeData

// CJM Node type
export type CJMNode = Node<CJMNodeData>
