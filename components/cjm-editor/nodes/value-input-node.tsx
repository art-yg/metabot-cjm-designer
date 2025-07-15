"use client"

import React from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { TextCursorInput, Clock, BarChart3 } from "lucide-react"
import NodeBase from "./node-base"
import type { ChannelOverrides } from "@/lib/channel-types"
import type { LogWayData } from "@/lib/analytics-types"

// Structure for a single reminder item
export interface ReminderItem {
  id: string // Unique ID for React key and managing edits
  delay_sec: number
  content: string // Universal content for the reminder
  content_per_channel?: ChannelOverrides // Используем универсальный тип
}

export interface TimeoutConfig {
  timeout_seconds: number
  exit_step: string | null
}

export interface ValueInputNodeData {
  code: string
  type: "value_input"
  title: string
  variable: string
  prompt: string
  validation_template?: string
  regexp?: string
  errmsg?: string
  exit_condition?: string
  exit_step: string | null
  next_step: string | null
  reminders?: ReminderItem[]
  timeout?: TimeoutConfig // New timeout configuration
  log_way_steps?: LogWayData // Встроенная аналитика
}

function ValueInputNode({
  data,
  selected,
  id,
  isConnectable,
  xPos,
  yPos,
  zIndex,
  type,
}: NodeProps<ValueInputNodeData>) {
  const hasReminders = data.reminders && data.reminders.length > 0
  const hasTimeout = data.timeout && data.timeout.timeout_seconds > 0
  const hasAnalytics = data.log_way_steps && data.log_way_steps.steps.length > 0

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
      headerIcon={
        <div className="flex items-center">
          <TextCursorInput size={18} className="mr-2 text-purple-600" />
          {hasReminders && (
            <Clock size={14} className="text-orange-500" title={`Has ${data.reminders?.length} reminder(s)`} />
          )}
          {hasTimeout && (
            <div
              className="ml-1 w-3 h-3 bg-blue-500 rounded-full"
              title={`Timeout: ${data.timeout?.timeout_seconds}s`}
            />
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
      <div className="space-y-1">
        <div className="truncate">
          <span className="font-semibold">Var:</span>{" "}
          {data.variable || <span className="italic text-gray-400">not set</span>}
        </div>
        <div className="break-words">
          <span className="font-semibold">Prompt:</span>{" "}
          {data.prompt || <span className="italic text-gray-400">not set</span>}
        </div>
        {hasReminders && (
          <div className="text-xs text-orange-600 italic mt-1 flex items-center">
            <Clock size={12} className="mr-1" /> {data.reminders?.length} reminder(s)
          </div>
        )}
        {hasTimeout && (
          <div className="text-xs text-blue-600 italic mt-1 flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-1" /> Timeout: {data.timeout?.timeout_seconds}s
          </div>
        )}
        {hasAnalytics && (
          <div className="border-t pt-2 mt-2">
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
      <Handle
        type="source"
        position={Position.Bottom}
        id="next_step"
        className="!w-3 !h-3 !bg-green-500"
        style={{ bottom: -6 }}
        isConnectable={isConnectable}
      />

      <Handle
        type="source"
        position={Position.Right}
        id="exit_step"
        className="!w-3 !h-3 !bg-red-500"
        style={{ right: -6 }}
        isConnectable={isConnectable}
      />

      {hasTimeout && (
        <Handle
          type="source"
          position={Position.Left}
          id="timeout_step"
          className="!w-3 !h-3 !bg-blue-500"
          style={{ left: -6 }}
          isConnectable={isConnectable}
        />
      )}
    </NodeBase>
  )
}

export default React.memo(ValueInputNode)
