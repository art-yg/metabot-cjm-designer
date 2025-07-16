"use client"

import React from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { BarChart3 } from "lucide-react"
import NodeBase from "./node-base"

export type LogActionType = "step" | "event" | "tag" | "utter"
export type TagAction = "add" | "remove"

export interface LogActionNodeData {
  code: string
  type: "log_action"
  title: string // Client-side title
  log_type: LogActionType
  way?: string
  step?: string
  event?: string
  tag?: string
  tag_action?: TagAction
  utter?: string
  note?: string
  next_step: string | null
}

function LogActionNode({ data, selected, id, isConnectable, xPos, yPos, zIndex, type }: NodeProps<LogActionNodeData>) {
  const getDisplayText = () => {
    switch (data.log_type) {
      case "step":
        return `Step: ${data.step || "не указан"}`
      case "event":
        return `Event: ${data.event || "не указан"}`
      case "tag":
        return `Tag: ${data.tag || "не указан"} (${data.tag_action || "add"})`
      case "utter":
        return `Utter: ${data.utter || "не указан"}`
      default:
        return "Не настроено"
    }
  }

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
      headerIcon={
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white mr-2">
          <BarChart3 size={18} />
        </span>
      }
      className="border-emerald-300 hover:border-emerald-400"
    >
      <div className="space-y-1">
        <div className="text-xs font-medium text-emerald-700">Тип: {data.log_type || "не выбран"}</div>
        <div className="text-xs text-gray-600 break-words">{getDisplayText()}</div>
        {data.way && <div className="text-xs text-gray-500">Way: {data.way}</div>}
        {data.note && <div className="text-xs text-gray-400 italic break-words">{data.note}</div>}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="next_step"
        className="!w-3 !h-3 !bg-emerald-500"
        style={{ bottom: -6 }}
        isConnectable={isConnectable}
      />
    </NodeBase>
  )
}

export default React.memo(LogActionNode)
