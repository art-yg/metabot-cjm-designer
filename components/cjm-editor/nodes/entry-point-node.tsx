"use client"

import React from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Flag } from "lucide-react"
import { cn } from "@/lib/utils"

export interface EntryPointNodeData {
  code: string
  type: "entry_point"
  name: string
  label: string // Client-side label
  next_step: string | null // Добавляем поле next_step
}

function EntryPointNode({
  data,
  selected,
  id,
  isConnectable,
  xPos,
  yPos,
  zIndex,
  type,
}: NodeProps<EntryPointNodeData>) {
  return (
    <div
      className={cn(
        "relative w-24 h-24 rounded-full bg-green-500 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center border-4",
        selected ? "border-green-700 ring-4 ring-green-300" : "border-green-600",
      )}
    >
      {/* Icon */}
      <Flag size={28} className="text-white" />

      {/* Name label */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 text-center whitespace-nowrap max-w-32 truncate">
        {data.name || data.code}
      </div>

      {/* Only output handle at bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="next_step"
        className="!w-4 !h-4 !bg-green-700 !border-2 !border-white"
        style={{ bottom: -8 }}
        isConnectable={isConnectable}
      />
    </div>
  )
}

export default React.memo(EntryPointNode)
