"use client"

import React from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { GitBranch } from "lucide-react"
import { cn } from "@/lib/utils"

export interface IfElseNodeData {
  code: string
  type: "if_else"
  title: string // Client-side title
  condition: string
  next_step: string | null // Then branch (true)
  else_step: string | null // Else branch (false)
  // ❌ Убрали log_way_steps - развилки не логируют аналитику
}

function IfElseNode({ data, selected, id, isConnectable, xPos, yPos, zIndex, type }: NodeProps<IfElseNodeData>) {
  return (
    <div
      className={cn(
        "relative w-40 h-40 rotate-45 bg-yellow-400 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center border-4",
        selected ? "border-yellow-600 ring-4 ring-yellow-300" : "border-yellow-500",
      )}
    >
      {/* Input handle at top (rotated) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-4 !h-4 !bg-yellow-600 !border-2 !border-white -rotate-45"
        style={{ top: -8, left: "50%" }}
        isConnectable={isConnectable}
      />

      {/* Content - rotated back to be readable */}
      <div className="absolute inset-0 -rotate-45 flex flex-col items-center justify-center p-3">
        <div className="flex items-center justify-center mb-2">
          <GitBranch size={20} className="text-yellow-800 mr-2" />
          <span className="font-semibold text-sm text-yellow-900">{data.title || "Условие"}</span>
        </div>
        <div className="text-xs text-yellow-800 text-center max-w-full overflow-hidden">
          {data.condition ? (
            <div className="bg-yellow-100 p-1.5 rounded-md border border-yellow-300 max-w-[120px] truncate">
              {data.condition}
            </div>
          ) : (
            <span className="italic text-yellow-700">Условие не задано</span>
          )}
        </div>
      </div>

      {/* Then output handle (right when rotated) */}
      <Handle
        type="source"
        position={Position.Right}
        id="next_step"
        className="!w-4 !h-4 !bg-green-600 !border-2 !border-white -rotate-45"
        style={{ right: -8, top: "50%" }}
        isConnectable={isConnectable}
      />

      {/* Else output handle (bottom when rotated) */}
      <Handle
        type="source"
        position={Position.Left}
        id="else_step"
        className="!w-4 !h-4 !bg-red-600 !border-2 !border-white -rotate-45"
        style={{ left: -8, top: "50%" }}
        isConnectable={isConnectable}
      />

      {/* Labels for the handles */}
      <div className="absolute -right-16 top-1/2 -translate-y-1/2 -rotate-45 text-xs font-medium text-green-700">
        THEN
      </div>
      <div className="absolute -left-14 top-1/2 -translate-y-1/2 -rotate-45 text-xs font-medium text-red-700">ELSE</div>
    </div>
  )
}

export default React.memo(IfElseNode)
