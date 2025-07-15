"use client"

import React from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { MessageSquare, Layers, MousePointer, BarChart3, LinkIcon, Tags } from "lucide-react"
import NodeBase from "./node-base"
import type { ChannelOverrides } from "@/lib/channel-types"
import type { SendTextButton, ButtonsValueTarget } from "@/lib/button-types"
import type { LogWayData } from "@/lib/analytics-types"
import type { Link } from "@/lib/link-types"

export interface SendTextNodeData {
  code: string
  title: string
  content: string
  type: "send_text"
  next_step: string | null
  content_per_channel?: ChannelOverrides
  buttons?: SendTextButton[]
  buttons_value_target?: ButtonsValueTarget
  log_way_steps?: LogWayData
  links?: Link[]
}

function SendTextNode({ data, selected, id, isConnectable, xPos, yPos, zIndex, type, dragging }: NodeProps<SendTextNodeData>) {
  const hasChannelOverrides = data.content_per_channel && Object.keys(data.content_per_channel).length > 0
  const hasButtons = data.buttons && data.buttons.length > 0
  const hasValueTarget = data.buttons_value_target && data.buttons_value_target.key
  const hasAnalytics = data.log_way_steps && data.log_way_steps.steps.length > 0
  const hasLinksWithTriggers =
    data.links &&
    data.links.some(
      (link) => link.triggers && link.triggers.some((t) => t.active && (t.on_true?.next_step || t.on_false?.next_step)),
    )

  const hasButtonTags =
    hasButtons &&
    data.buttons!.some(
      (btn) => (btn.add_tags && btn.add_tags.length > 0) || (btn.remove_tags && btn.remove_tags.length > 0),
    )

  const validButtons = hasButtons ? data.buttons!.filter((btn) => btn.title.trim() && btn.next_step?.trim()) : []

  // НОВАЯ ЛОГИКА: основной выход показываем ВСЕГДА (независимо от кнопок)
  const showMainOutput = true

  const getButtonHandlePositions = () => {
    if (validButtons.length === 0) return []
    const positions: { id: string; position: Position; offset: number; label: string }[] = []
    validButtons.forEach((button, index) => {
      const isLeft = index % 2 === 0
      const positionInSide = Math.floor(index / 2)
      const sideCount = isLeft ? Math.ceil(validButtons.length / 2) : Math.floor(validButtons.length / 2)
      const step = sideCount > 0 ? 1 / (sideCount + 1) : 0.5
      const offset = sideCount > 0 ? (positionInSide + 1) * step * 100 : 50
      positions.push({
        id: `button_${button.id}`,
        position: isLeft ? Position.Left : Position.Right,
        offset,
        label: button.title,
      })
    })
    return positions
  }
  const buttonHandlePositions = getButtonHandlePositions()

  const triggerHandlePositions = React.useMemo(() => {
    const positions: { id: string; position: Position; offset: number; label: string; color: string }[] = []
    if (!data.links) return positions

    let currentOffset = 25
    const offsetIncrement = 15

    data.links.forEach((link) => {
      if (link.triggers) {
        link.triggers.forEach((trigger) => {
          if (trigger.active) {
            if (trigger.on_true?.next_step) {
              positions.push({
                id: `${trigger.id}_true`,
                position: Position.Right,
                offset: currentOffset,
                label: `${link.code} → ${trigger.title || trigger.code} (True)`,
                color: "bg-green-500",
              })
              currentOffset += offsetIncrement
            }
            if (trigger.on_false?.next_step) {
              positions.push({
                id: `${trigger.id}_false`,
                position: Position.Right,
                offset: currentOffset,
                label: `${link.code} → ${trigger.title || trigger.code} (False)`,
                color: "bg-slate-500",
              })
              currentOffset += offsetIncrement
            }
          }
        })
      }
    })
    return positions
  }, [data.links])

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
        dragging={dragging}
        headerIcon={
          <div className="flex items-center">
            <MessageSquare size={18} className="mr-2 text-blue-600" />
            {hasChannelOverrides && (
              <div title="Has channel-specific content">
                <Layers size={14} className="text-indigo-500 ml-1" />
              </div>
            )}
            {hasButtons && (
              <div title="Has buttons">
                <MousePointer size={14} className="text-green-500 ml-1" />
              </div>
            )}
            {hasValueTarget && (
              <div className="w-2 h-2 bg-purple-500 rounded-full ml-1" title="Records button values to attribute" />
            )}
            {hasButtonTags && (
              <div title="Has button tag operations">
                <Tags size={14} className="text-orange-500 ml-1" />
              </div>
            )}
            {hasAnalytics && (
              <div title={`Has ${data.log_way_steps!.steps.length} analytics entries`}>
                <BarChart3 size={14} className="text-emerald-500 ml-1" />
              </div>
            )}
            {hasLinksWithTriggers && (
              <div title="Has trackable links with active trigger outputs">
                <LinkIcon size={14} className="text-sky-500 ml-1" />
              </div>
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
                {data.buttons!.map((button, index) => (
                  <div key={button.id} className="text-xs bg-green-50 border border-green-200 rounded px-2 py-1">
                    <span className="font-medium text-green-800">
                      {index + 1}. {button.title || "Без названия"}
                    </span>
                    {((button.add_tags && button.add_tags.length > 0) ||
                      (button.remove_tags && button.remove_tags.length > 0)) && (
                      <div className="text-xs text-orange-600 mt-1 flex items-center">
                        <Tags size={10} className="mr-1" />
                        {button.add_tags && button.add_tags.length > 0 && (
                          <span className="mr-2">+{button.add_tags.length}</span>
                        )}
                        {button.remove_tags && button.remove_tags.length > 0 && (
                          <span>-{button.remove_tags.length}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {hasValueTarget && (
                <div className="text-xs text-purple-600 italic mt-1 flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-1" />→ {data.buttons_value_target!.scope}.
                  {data.buttons_value_target!.key}
                </div>
              )}
            </div>
          )}
          {hasAnalytics && (
            <div className="border-t pt-2">
              <div className="text-xs font-medium text-gray-700 mb-1 flex items-center">
                <BarChart3 size={12} className="mr-1 text-emerald-600" />
                Аналитика ({data.log_way_steps!.steps.length}):
              </div>
              <div className="space-y-1">
                {data.log_way_steps!.steps.map((step, index) => {
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
          {data.links && data.links.length > 0 && (
            <div className="border-t pt-2">
              <div className="text-xs font-medium text-gray-700 mb-1 flex items-center">
                <LinkIcon size={12} className="mr-1 text-blue-600" />
                Ссылки ({data.links.length}):
              </div>
              <div className="space-y-1">
                {data.links.map((link, index) => (
                  <div key={link.id} className="text-xs bg-blue-50 border border-blue-200 rounded px-2 py-1">
                    <div className="font-medium text-blue-800">
                      {index + 1}. {link.title || link.code}
                    </div>
                    <div className="text-blue-600 truncate text-xs mt-0.5" title={link.url}>
                      {link.url}
                    </div>
                    {link.triggers && link.triggers.filter((t) => t.active).length > 0 && (
                      <span className="text-xs text-sky-600">
                        ({link.triggers.filter((t) => t.active).length} active triggers)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </NodeBase>

      {/* Основной выход - показываем ВСЕГДА */}
      {showMainOutput && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="next_step"
          className="!w-3 !h-3 !bg-orange-500"
          style={{ bottom: -6, left: "50%", transform: "translateX(-50%)" }}
          isConnectable={isConnectable}
        />
      )}

      {/* Выходы для кнопок */}
      {buttonHandlePositions.map((handle) => (
        <React.Fragment key={handle.id}>
          <Handle
            type="source"
            position={handle.position}
            id={handle.id}
            className="!w-3 !h-3 !bg-green-600 !border-2 !border-white"
            style={{
              [handle.position === Position.Left ? "left" : "right"]: -6,
              top: `${handle.offset}%`,
              transform: "translateY(-50%)",
            }}
            isConnectable={isConnectable}
          />
          <div
            className="absolute text-xs font-medium text-green-700 pointer-events-none"
            style={{
              [handle.position === Position.Left ? "left" : "right"]: -120,
              top: `${handle.offset}%`,
              transform: "translateY(-50%)",
              width: "110px",
              textAlign: handle.position === Position.Left ? "right" : "left",
              whiteSpace: "normal",
              lineHeight: "1.2",
            }}
          >
            {handle.label}
          </div>
        </React.Fragment>
      ))}

      {/* Выходы для триггеров ссылок */}
      {triggerHandlePositions.map((handle) => (
        <React.Fragment key={handle.id}>
          <Handle
            type="source"
            position={handle.position}
            id={handle.id}
            className={`!w-3 !h-3 ${handle.color} !border-2 !border-white`}
            style={{ right: -6, top: `${handle.offset}%`, transform: "translateY(-50%)" }}
            isConnectable={isConnectable}
          />
          <div
            className={`absolute text-xs font-medium ${handle.color === "bg-green-500" ? "text-green-700" : "text-slate-700"} pointer-events-none`}
            style={{
              right: -150,
              top: `${handle.offset}%`,
              transform: "translateY(-50%)",
              width: "140px",
              textAlign: "left",
              whiteSpace: "normal",
              lineHeight: "1.2",
            }}
          >
            {handle.label}
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}

export default React.memo(SendTextNode)
export type { ChannelContent } from "@/lib/channel-types"
export type { SendTextButton, ButtonsValueTarget } from "@/lib/button-types"
