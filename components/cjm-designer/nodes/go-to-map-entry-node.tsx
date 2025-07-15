"use client"

import React from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { ArrowRightCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface GoToMapEntryNodeData {
  code: string
  type: "go_to_map_entry"
  target_map: string
  entry_point: string
  note?: string
  title: string // Client-side title
}

function GoToMapEntryNode({
  data,
  selected,
  id,
  isConnectable,
  xPos,
  yPos,
  zIndex,
  type,
}: NodeProps<GoToMapEntryNodeData>) {
  return (
    <div
      className={cn(
        "relative w-24 h-24 rounded-full bg-purple-500 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center border-4",
        selected ? "border-purple-700 ring-4 ring-purple-300" : "border-purple-600",
      )}
    >
      {/* Input handle at top */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-4 !h-4 !bg-purple-700 !border-2 !border-white"
        style={{ top: -8 }}
        isConnectable={isConnectable}
      />

      {/* Icon */}
      <ArrowRightCircle size={28} className="text-white" />

      {/* Target info label */}
      <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-xs text-center">
        <div className="font-medium text-gray-700 whitespace-nowrap max-w-32 truncate">
          → {data.target_map || "Воронка"}
        </div>
        {data.entry_point && (
          <div className="text-gray-500 whitespace-nowrap max-w-32 truncate">({data.entry_point})</div>
        )}
      </div>

      {/* Removed the output handle at bottom */}
    </div>
  )
}

export default React.memo(GoToMapEntryNode)
