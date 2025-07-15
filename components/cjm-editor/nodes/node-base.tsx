"use client"

import React from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { cn } from "@/lib/utils"

// A generic data type for the base node, ensuring title or code is present.
interface BaseNodeData {
  title?: string
  code: string
}

// The props for NodeBase include the standard NodeProps and children.
interface NodeBaseProps extends NodeProps<BaseNodeData> {
  children: React.ReactNode
  headerIcon?: React.ReactNode
  className?: string
  shape?: "rectangle" | "hexagon" | "circle" // Add shape prop
}

function NodeBase({ data, selected, children, headerIcon, className, shape = "rectangle" }: NodeBaseProps) {
  // Define shape-specific classes
  const shapeClasses = {
    rectangle: "",
    hexagon: "clip-path-hexagon",
    circle: "rounded-full aspect-square flex flex-col justify-center",
  }

  return (
    <div
      className={cn(
        "p-3 border rounded-lg bg-white shadow-md w-56 hover:shadow-lg transition-shadow",
        selected ? "border-blue-500 ring-2 ring-blue-500" : "border-gray-300",
        shapeClasses[shape],
        className,
      )}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-teal-500" />
      <div className="flex items-center mb-2 border-b pb-2">
        {headerIcon}
        <div className="font-semibold text-sm text-gray-700 truncate">{data.title || data.code}</div>
      </div>
      <div className="text-xs text-gray-600">{children}</div>
    </div>
  )
}

export default React.memo(NodeBase)
