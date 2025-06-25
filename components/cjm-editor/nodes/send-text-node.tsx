"use client"

import React from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { MessageSquare, Layers, MousePointer, BarChart3 } from "lucide-react"
import NodeBase from "./node-base"
import type { ChannelOverrides } from "@/lib/channel-types"
import type { SendTextButton, ButtonsValueTarget } from "@/lib/button-types"
import type { LogWayData } from "@/lib/analytics-types"

export interface SendTextNodeData {
  code: string
  label: string // Client-side label
  content: string // Universal content
  type: "send_text"
  next_step: string | null
  content_per_channel?: ChannelOverrides
  buttons?: SendTextButton[] // Кнопки
  buttons_value_target?: ButtonsValueTarget // Новое поле - куда записывать значения кнопок
  log_way_steps?: LogWayData // Встроенная аналитика
}

function SendTextNode({ data, selected, id, isConnectable, xPos, yPos, zIndex, type }: NodeProps<SendTextNodeData>) {
  const hasChannelOverrides = data.content_per_channel && Object.keys(data.content_per_channel).length > 0
  const hasButtons = data.buttons && data.buttons.length > 0
  const hasValueTarget = data.buttons_value_target && data.buttons_value_target.key
  const hasAnalytics = data.log_way_steps && data.log_way_steps.steps.length > 0

  // Get unique buttons with valid target_code and title for handles
  const validButtons = hasButtons ? data.buttons.filter((btn) => btn.title.trim() && btn.next_step?.trim()) : []

  // Calculate handle positions for buttons distributed across left and right sides
  // Bottom is reserved for the standard next_step handle
  const getButtonHandlePositions = () => {
    if (validButtons.length === 0) return []

    const positions: { id: string; position: Position; offset: number; label: string }[] = []

    // Distribute buttons across left and right sides only
    validButtons.forEach((button, index) => {
      const isLeft = index % 2 === 0 // Alternate between left and right
      const positionInSide = Math.floor(index / 2) // Which position on that side

      let position: Position
      let offset: number

      if (isLeft) {
        position = Position.Left
        // Distribute evenly across left side
        const leftCount = Math.ceil(validButtons.length / 2)
        const leftStep = leftCount > 0 ? 1 / (leftCount + 1) : 0.5
        offset = leftCount > 0 ? (positionInSide + 1) * leftStep * 100 : 50
      } else {
        position = Position.Right
        // Distribute evenly across right side
        const rightCount = Math.floor(validButtons.length / 2)
        const rightStep = rightCount > 0 ? 1 / (rightCount + 1) : 0.5
        offset = rightCount > 0 ? (positionInSide + 1) * rightStep * 100 : 50
      }

      positions.push({
        id: `button_${button.id}`,
        position,
        offset,
        label: button.title,
      })
    })

    return positions
  }

  const buttonHandlePositions = getButtonHandlePositions()

  return (
    <div className="relative">
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
          <div className="flex items-center">
            <MessageSquare size={18} className="mr-2 text-blue-600" />
            {hasChannelOverrides && (
              <Layers size={14} className="text-indigo-500" title="Has channel-specific content" />
            )}
            {hasButtons && <MousePointer size={14} className="text-green-500 ml-1" title="Has buttons" />}
            {hasValueTarget && (
              <div className="w-2 h-2 bg-purple-500 rounded-full ml-1" title="Records button values to attribute" />
            )}
            {hasAnalytics && (
              <BarChart3
                size={14}
                className="text-emerald-500 ml-1"
                title={`Has ${data.log_way_steps.steps.length} analytics entries`}
              />
            )}
          </div>
        }
      >
        <div className="space-y-2">
          <p className="text-xs text-gray-600 break-words whitespace-pre-wrap">
            {data.content || "No universal content."}
            {hasChannelOverrides && (
              <span className="block text-indigo-600 text-xs italic mt-1">(+ channel overrides)</span>
            )}
          </p>

          {hasButtons && (
            <div className="border-t pt-2">
              <div className="text-xs font-medium text-gray-700 mb-1 flex items-center">
                <MousePointer size={12} className="mr-1 text-green-600" />
                Кнопки:
              </div>
              <div className="space-y-1">
                {data.buttons.map((button, index) => (
                  <div key={button.id} className="text-xs bg-green-50 border border-green-200 rounded px-2 py-1">
                    <span className="font-medium text-green-800">
                      {index + 1}. {button.title || "Без названия"}
                    </span>
                  </div>
                ))}
              </div>
              {hasValueTarget && (
                <div className="text-xs text-purple-600 italic mt-1 flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-1" />→ {data.buttons_value_target.scope}.
                  {data.buttons_value_target.key}
                </div>
              )}
            </div>
          )}
          {hasAnalytics && (
            <div className="border-t pt-2">
              <div className="text-xs font-medium text-gray-700 mb-1 flex items-center">
                <BarChart3 size={12} className="mr-1 text-emerald-600" />
                Аналитика ({data.log_way_steps.steps.length}):
              </div>
              <div className="space-y-1">
                {data.log_way_steps.steps.map((step, index) => {
                  const getTypeColor = () => {
                    switch (step.type) {
                      case "step":
                        return "bg-blue-50 border-blue-200 text-blue-800"
                      case "event":
                        return "bg-green-50 border-green-200 text-green-800"
                      case "tag":
                        return "bg-purple-50 border-purple-200 text-purple-800"
                      case "utter":
                        return "bg-orange-50 border-orange-200 text-orange-800"
                      default:
                        return "bg-gray-50 border-gray-200 text-gray-800"
                    }
                  }

                  return (
                    <div key={step.id || index} className={`text-xs border rounded px-2 py-1 ${getTypeColor()}`}>
                      <div className="font-medium mb-1">
                        {index + 1}. {step.type.toUpperCase()}
                      </div>
                      <div className="space-y-0.5">
                        {step.type === "step" && (
                          <>
                            {step.way && (
                              <div className="truncate">
                                <span className="text-gray-600">Путь:</span> {step.way}
                              </div>
                            )}
                            {step.step && (
                              <div className="truncate">
                                <span className="text-gray-600">Шаг:</span> {step.step}
                              </div>
                            )}
                          </>
                        )}
                        {step.type === "event" && step.event && (
                          <div className="truncate">
                            <span className="text-gray-600">Событие:</span> {step.event}
                          </div>
                        )}
                        {step.type === "tag" && (
                          <>
                            {step.tag && (
                              <div className="truncate">
                                <span className="text-gray-600">Тег:</span> {step.tag}
                              </div>
                            )}
                            {step.tag_action && (
                              <div className="truncate">
                                <span className="text-gray-600">Действие:</span> {step.tag_action}
                              </div>
                            )}
                          </>
                        )}
                        {step.type === "utter" && step.utter && (
                          <div className="truncate">
                            <span className="text-gray-600">Текст:</span> {step.utter}
                          </div>
                        )}
                        {step.way && step.type !== "step" && (
                          <div className="truncate">
                            <span className="text-gray-600">Путь:</span> {step.way}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </NodeBase>

      {/* Standard next_step handle - ALWAYS show at bottom center */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="next_step"
        className="!w-3 !h-3 !bg-orange-500"
        style={{ bottom: -6, left: "50%", transform: "translateX(-50%)" }}
        isConnectable={isConnectable}
      />

      {/* Button handles distributed across left and right sides */}
      {buttonHandlePositions.map((handle) => {
        const getHandleStyle = () => {
          switch (handle.position) {
            case Position.Left:
              return {
                left: -6,
                top: `${handle.offset}%`,
                transform: "translateY(-50%)",
              }
            case Position.Right:
              return {
                right: -6,
                top: `${handle.offset}%`,
                transform: "translateY(-50%)",
              }
            default:
              return {
                left: -6,
                top: `${handle.offset}%`,
                transform: "translateY(-50%)",
              }
          }
        }

        const getLabelStyle = () => {
          switch (handle.position) {
            case Position.Left:
              return {
                left: -120, // Increased space for full text
                top: `${handle.offset}%`,
                transform: "translateY(-50%)",
                width: "110px", // Increased width
                textAlign: "right" as const,
                whiteSpace: "normal" as const, // Allow text wrapping
                lineHeight: "1.2",
              }
            case Position.Right:
              return {
                right: -120, // Increased space for full text
                top: `${handle.offset}%`,
                transform: "translateY(-50%)",
                width: "110px", // Increased width
                textAlign: "left" as const,
                whiteSpace: "normal" as const, // Allow text wrapping
                lineHeight: "1.2",
              }
            default:
              return {
                left: -120,
                top: `${handle.offset}%`,
                transform: "translateY(-50%)",
                width: "110px",
                textAlign: "right" as const,
                whiteSpace: "normal" as const,
                lineHeight: "1.2",
              }
          }
        }

        return (
          <React.Fragment key={handle.id}>
            <Handle
              type="source"
              position={handle.position}
              id={handle.id}
              className="!w-3 !h-3 !bg-green-600 !border-2 !border-white"
              style={getHandleStyle()}
              isConnectable={isConnectable}
            />
            <div className="absolute text-xs font-medium text-green-700" style={getLabelStyle()}>
              {handle.label}
            </div>
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default React.memo(SendTextNode)

// Re-export for backward compatibility
export type { ChannelContent } from "@/lib/channel-types"
export type { SendTextButton, ButtonsValueTarget } from "@/lib/button-types"
