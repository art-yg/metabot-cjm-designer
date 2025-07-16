"use client"

import React from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Tags, Plus, Minus, BarChart3 } from "lucide-react"
import NodeBase from "./node-base"
import type { LogWayData } from "@/lib/analytics-types"

export interface TagsNodeData {
  code: string
  type: "add_tags" | "remove_tags"
  title: string // Client-side title
  tags: string[]
  next_step: string | null
  log_way_steps?: LogWayData // Встроенная аналитика
}

function TagsNode({ data, selected, id, isConnectable, xPos, yPos, zIndex, type }: NodeProps<TagsNodeData>) {
  const isAddTags = data.type === "add_tags"
  const iconColor = isAddTags ? "text-green-600" : "text-red-600"
  const Icon = isAddTags ? Plus : Minus
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
          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${isAddTags ? 'bg-green-500' : 'bg-red-500'} text-white mr-2`}>
            <Tags size={18} />
          </span>
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
        <div className="text-xs font-medium text-gray-700">{isAddTags ? "Добавить теги:" : "Удалить теги:"}</div>
        <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto custom-scrollbar">
          {data.tags.length > 0 ? (
            data.tags.map((tag, index) => (
              <span
                key={index}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  isAddTags
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                }`}
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-400 italic">Теги не указаны</span>
          )}
        </div>
      </div>
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
      <Handle
        type="source"
        position={Position.Bottom}
        id="next_step"
        className="!w-3 !h-3 !bg-blue-500"
        style={{ bottom: -6 }}
        isConnectable={isConnectable}
      />
    </NodeBase>
  )
}

export default React.memo(TagsNode)
