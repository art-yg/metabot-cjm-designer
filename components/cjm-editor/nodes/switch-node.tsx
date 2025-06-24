"use client"

import React from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { SwitchCamera, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LogWayData } from "@/lib/analytics-types"

export interface SwitchCase {
  id: string // Client-side ID for React keys
  condition: string
  step: string | null
}

export interface SwitchNodeData {
  code: string
  type: "switch"
  label: string // Client-side label
  cases: SwitchCase[]
  default_step: string | null
  log_way_steps?: LogWayData // Встроенная аналитика
}

function SwitchNode({ data, selected, id, isConnectable, xPos, yPos, zIndex, type }: NodeProps<SwitchNodeData>) {
  // Calculate handle positions based on number of cases
  const totalCases = data.cases.length
  const hasDefaultStep = data.default_step !== null && data.default_step !== undefined
  const totalOutputs = hasDefaultStep ? totalCases + 1 : totalCases

  // Function to calculate handle positions
  const getHandlePositions = () => {
    const positions: { id: string; x: number; y: number; label: string; isDefault?: boolean }[] = []

    // If we have 5 or fewer outputs, distribute them evenly across the bottom sides
    if (totalOutputs <= 5) {
      const step = 1 / (totalOutputs + 1)

      // Add case handles
      data.cases.forEach((caseItem, index) => {
        const position = (index + 1) * step
        positions.push({
          id: `case_${caseItem.id}`,
          x: position * 100,
          y: 100,
          label: caseItem.condition || `Case ${index + 1}`,
        })
      })

      // Add default handle if needed
      if (hasDefaultStep) {
        positions.push({
          id: "default_step",
          x: totalOutputs * step * 100,
          y: 100,
          label: "Default",
          isDefault: true,
        })
      }
    } else {
      // For more than 5 outputs, we need to distribute them differently
      // Calculate how many handles per side (minimum 1)
      const sidesAvailable = 5 // Bottom sides of hexagon
      const handlesPerSide = Math.max(1, Math.ceil(totalOutputs / sidesAvailable))

      // Distribute handles
      let currentIndex = 0

      // Add case handles
      data.cases.forEach((caseItem, index) => {
        const sideIndex = Math.floor(index / handlesPerSide)
        const positionInSide = index % handlesPerSide

        // Calculate position based on side and position within side
        const sideStart = sideIndex / sidesAvailable
        const sideEnd = (sideIndex + 1) / sidesAvailable
        const position = sideStart + ((positionInSide + 1) * (sideEnd - sideStart)) / (handlesPerSide + 1)

        positions.push({
          id: `case_${caseItem.id}`,
          x: position * 100,
          y: 100,
          label: caseItem.condition || `Case ${index + 1}`,
        })

        currentIndex++
      })

      // Add default handle if needed
      if (hasDefaultStep) {
        const sideIndex = Math.floor(currentIndex / handlesPerSide)
        const positionInSide = currentIndex % handlesPerSide

        const sideStart = sideIndex / sidesAvailable
        const sideEnd = (sideIndex + 1) / sidesAvailable
        const position = sideStart + ((positionInSide + 1) * (sideEnd - sideStart)) / (handlesPerSide + 1)

        positions.push({
          id: "default_step",
          x: position * 100,
          y: 100,
          label: "Default",
          isDefault: true,
        })
      }
    }

    return positions
  }

  const handlePositions = getHandlePositions()
  const hasAnalytics = data.log_way_steps && data.log_way_steps.steps.length > 0

  return (
    <div
      className={cn(
        "relative w-48 h-48 bg-blue-300 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center border-4 clip-path-hexagon",
        selected ? "border-blue-500 ring-4 ring-blue-200" : "border-blue-400",
      )}
    >
      {/* Input handle at top */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-4 !h-4 !bg-blue-600 !border-2 !border-white"
        style={{ top: -8 }}
        isConnectable={isConnectable}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        <div className="flex items-center justify-center mb-2">
          <SwitchCamera size={20} className="text-blue-800 mr-2" />
          <span className="font-semibold text-sm text-blue-900">{data.label || "Switch"}</span>
          {hasAnalytics && (
            <BarChart3
              size={14}
              className="text-emerald-600 ml-2"
              title={`Has ${data.log_way_steps.steps.length} analytics entries`}
            />
          )}
        </div>

        <div className="text-xs text-blue-800 text-center max-h-[80px] overflow-y-auto custom-scrollbar">
          {data.cases.length > 0 ? (
            <div className="space-y-1">
              {data.cases.slice(0, 3).map((caseItem, index) => (
                <div
                  key={caseItem.id}
                  className="bg-blue-100 p-1 rounded-md border border-blue-300 truncate max-w-[180px]"
                >
                  {caseItem.condition || `Case ${index + 1}`}
                </div>
              ))}
              {data.cases.length > 3 && <div className="text-blue-700 italic">+{data.cases.length - 3} more cases</div>}
            </div>
          ) : (
            <span className="italic text-blue-700">Нет условий</span>
          )}
        </div>
      </div>

      {/* Output handles - dynamically positioned */}
      {handlePositions.map((handle) => (
        <React.Fragment key={handle.id}>
          <Handle
            type="source"
            position={Position.Bottom}
            id={handle.id}
            className={cn("!w-3 !h-3 !border-2 !border-white", handle.isDefault ? "!bg-gray-600" : "!bg-blue-600")}
            style={{
              left: `${handle.x}%`,
              bottom: -6,
              transform: "translateX(-50%)",
            }}
            isConnectable={isConnectable}
          />
          <div
            className={cn(
              "absolute text-xs font-medium truncate max-w-[60px] text-center",
              handle.isDefault ? "text-gray-700" : "text-blue-700",
            )}
            style={{
              left: `${handle.x}%`,
              bottom: -24,
              transform: "translateX(-50%)",
            }}
          >
            {handle.label}
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}

export default React.memo(SwitchNode)
