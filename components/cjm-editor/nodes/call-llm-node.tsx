import React from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Bot } from "lucide-react"
import NodeBase from "./node-base"
import { cn } from "@/lib/utils"
import type { LogWayData } from "@/lib/analytics-types"

export interface CallLLMNodeData {
  code: string
  type: "call_llm"
  title: string
  agent_name: string
  provider: string
  model: string
  prompt_table: string
  system_prompts: {
    start: string[]
    final: string[]
  }
  history: {
    enabled: boolean
    save_to_attr: string
    max_length: number
    add_to_prompts: boolean
  }
  user_query: {
    enabled: boolean
    attr: string
    add_to_prompts: boolean
  }
  response: {
    enabled: boolean
    save_to_attr: string
    display_to_user: boolean
    format: "none" | "html" | "markdown" | "markdownv2"
  }
  trace_enabled: boolean
  next_step: string | null
  error_step: string | null
  log_way_steps?: LogWayData
}

function CallLLMNode(props: NodeProps<CallLLMNodeData>) {
  const { data, selected, id, isConnectable, xPos, yPos, zIndex, type, dragging } = props
  const hasAnalytics = data.log_way_steps?.steps?.length > 0
  const promptCount = (data.system_prompts?.start?.length || 0) + (data.system_prompts?.final?.length || 0)
  return (
    <NodeBase
      data={data}
      selected={selected}
      id={id}
      isConnectable={isConnectable}
      xPos={xPos}
      yPos={yPos}
      zIndex={zIndex}
      type={type}
      dragging={dragging}
      headerIcon={
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700 text-white mr-2">
          <Bot size={18} />
        </span>
      }
    >
      <div className="text-xs text-gray-600 mt-1 space-y-1">
        <div><b>Агент:</b> {data.agent_name || <span className="text-gray-400">not set</span>}</div>
        <div><b>Провайдер:</b> {data.provider || <span className="text-gray-400">not set</span>}</div>
        <div><b>Модель:</b> {data.model || <span className="text-gray-400">not set</span>}</div>
        <div><b>Таблица промптов:</b> {data.prompt_table || <span className="text-gray-400">not set</span>}</div>
        <div><b>Промпты:</b> {promptCount}</div>
      </div>
      {hasAnalytics && data.log_way_steps?.steps?.length > 0 && (
        <div className="border-t pt-2 mt-2">
          <div className="text-xs font-medium text-gray-700 mb-1 flex items-center">
            <span className="mr-1">Analytics:</span> {data.log_way_steps.steps.length}
          </div>
          <div className="space-y-1">
            {data.log_way_steps.steps.map((step, index) => (
              <div key={step.id || index} className="text-xs border rounded px-2 py-1 bg-blue-50 border-blue-200 text-blue-800">
                <div className="font-medium mb-1">{index + 1}. {step.type?.toUpperCase()}</div>
                <div className="space-y-0.5">
                  {step.type === "step" && step.way && <div><span className="text-gray-600">Way:</span> {step.way}</div>}
                  {step.type === "step" && step.step && <div><span className="text-gray-600">Step:</span> {step.step}</div>}
                  {step.type === "event" && step.event && <div><span className="text-gray-600">Event:</span> {step.event}</div>}
                  {step.type === "tag" && step.tag && <div><span className="text-gray-600">Tag:</span> {step.tag}</div>}
                  {step.type === "tag" && step.tag_action && <div><span className="text-gray-600">Action:</span> {step.tag_action}</div>}
                  {step.type === "utter" && step.utter && <div><span className="text-gray-600">Utter:</span> {step.utter}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Top input: rely on NodeBase only, do not add custom handle here */}
      {/* Bottom success output */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="next_step"
        className="!w-3 !h-3 !bg-green-500"
        style={{ bottom: -6, left: "50%", transform: "translateX(-50%)" }}
        isConnectable={isConnectable}
      />
      {/* Right error output */}
      <Handle
        type="source"
        position={Position.Right}
        id="error_step"
        className="!w-3 !h-3 !bg-red-500"
        style={{ right: -6, top: "50%", transform: "translateY(-50%)" }}
        isConnectable={isConnectable}
      />
    </NodeBase>
  )
}

export default CallLLMNode 