"use client"

import React from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { ArrowRightCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface RunScriptNodeData {
  code: string
  type: "run_custom_script"
  label: string // Client-side label
  script_code: string
  note?: string
}

function RunScriptNode({ data, selected, id, isConnectable, xPos, yPos, zIndex, type }: NodeProps<RunScriptNodeData>) {
  return (
    <div
      className={cn(
        "relative w-24 h-24 rounded-full bg-amber-600 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center border-4",
        selected ? "border-amber-800 ring-4 ring-amber-300" : "border-amber-700",
      )}
    >
      {/* Input handle at top */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-4 !h-4 !bg-amber-800 !border-2 !border-white"
        style={{ top: -8 }}
        isConnectable={isConnectable}
      />

      {/* Icon - changed to ArrowRightCircle like GoToMapEntry */}
      <ArrowRightCircle size={28} className="text-white" />

      {/* Script info label - adjusted spacing and text wrapping */}
      <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-xs text-center">
        <div className="font-medium text-gray-700 max-w-40 break-words">🔧 {data.script_code || "Скрипт"}</div>
        {data.note && <div className="text-gray-500 max-w-40 break-words mt-1 whitespace-normal">({data.note})</div>}
      </div>

      {/* No output handle - this is a terminal command */}
    </div>
  )
}

export default React.memo(RunScriptNode)
