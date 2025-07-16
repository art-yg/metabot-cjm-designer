"use client"

import React from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Play, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DeepLink } from "@/lib/deep-link-types"

export interface EntryPointNodeData {
  code: string
  type: "entry_point"
  name: string
  title: string // Client-side title
  next_step: string | null
  deep_links: DeepLink[] // НОВОЕ поле
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
  const deepLinks = data.deep_links || []
  const activeDeepLinks = deepLinks.filter((dl) => dl.active)

  return (
    <div className="relative">
      {/* Deep Links List - positioned above the node */}
      {activeDeepLinks.length > 0 && (
        <div
          className="absolute left-1/2 transform -translate-x-1/2 mb-2"
          style={{
            bottom: "100%", // Позиционируем над узлом
            minWidth: "128px",
            maxWidth: "192px",
          }}
        >
          <div className="bg-blue-50 border border-blue-200 rounded-md p-2 shadow-sm">
            <div className="flex items-center gap-1 mb-1 justify-center">
              <ExternalLink size={12} className="text-blue-600" />
              <span className="text-xs font-medium text-blue-800">Deep Links</span>
            </div>
            <div className="space-y-1">
              {activeDeepLinks.map((deepLink, index) => (
                <div key={index} className="text-xs text-blue-700 truncate text-center">
                  {index + 1}. {deepLink.code}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Node */}
      <div
        className={cn(
          "relative w-24 h-24 rounded-full bg-green-500 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center border-4",
          selected ? "border-green-700 ring-4 ring-green-300" : "border-green-600",
        )}
      >
        {/* Icon */}
                    <Play size={28} className="text-white" />

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

      {/* Name label - positioned below the node */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-xs font-medium text-gray-700 text-center whitespace-nowrap max-w-32 truncate">
        {data.name || data.code}
      </div>
    </div>
  )
}

export default React.memo(EntryPointNode)
