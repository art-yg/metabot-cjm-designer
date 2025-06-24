"use client"

import React from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Clock } from "lucide-react"
import NodeBase from "./node-base"

export interface DelayConfig {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export interface WaitNodeData {
  code: string
  type: "wait"
  label: string // Client-side label
  delay: DelayConfig
  next_step: string | null
}

function formatDelayTime(delay: DelayConfig): string {
  const parts: string[] = []

  if (delay.days > 0) parts.push(`${delay.days}д`)
  if (delay.hours > 0) parts.push(`${delay.hours}ч`)
  if (delay.minutes > 0) parts.push(`${delay.minutes}м`)
  if (delay.seconds > 0) parts.push(`${delay.seconds}с`)

  return parts.length > 0 ? parts.join(" ") : "0с"
}

function WaitNode({ data, selected, id, isConnectable, xPos, yPos, zIndex, type }: NodeProps<WaitNodeData>) {
  const delayText = formatDelayTime(data.delay)

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
      headerIcon={<Clock size={18} className="mr-2 text-orange-600" />}
      className="border-orange-300 hover:border-orange-400"
      shape="hexagon" // Add hexagon shape
    >
      <div className="space-y-1">
        <div className="text-center">
          <span className="font-semibold text-orange-700">⏳ {delayText}</span>
        </div>
        <div className="text-xs text-gray-500 text-center">Пауза в выполнении</div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="next_step"
        className="!w-3 !h-3 !bg-orange-500"
        style={{ bottom: -6 }}
        isConnectable={isConnectable}
      />
    </NodeBase>
  )
}

export default React.memo(WaitNode)
