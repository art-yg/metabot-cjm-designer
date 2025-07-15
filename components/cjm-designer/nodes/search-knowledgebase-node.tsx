"use client"

import React from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Search, BookOpenCheck, BarChart3 } from "lucide-react"
import NodeBase from "./node-base"
import type { LogWayData } from "@/lib/analytics-types"

export interface SearchKnowledgebaseNodeData {
  code: string
  type: "search_knowledgebase"
  title: string
  knowbase_name: string
  query_attr: string
  domain: string
  save_results_to_attr: string
  trace_enabled: boolean
  next_step: string | null      // зеленый снизу - успешный поиск
  not_found_step: string | null // синий слева - результатов нет  
  error_step: string | null     // красный справа - ошибка
  log_way_steps?: LogWayData
}

function SearchKnowledgebaseNode({
  data,
  selected,
  id,
  isConnectable,
  xPos,
  yPos,
  zIndex,
  type,
  dragging,
}: NodeProps<SearchKnowledgebaseNodeData>) {
  const hasAnalytics = data.log_way_steps?.steps?.length > 0

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
      dragging={dragging}
      headerIcon={
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-purple-600 text-white mr-2">
          <Search size={18} />
        </span>
      }
    >
      <div className="text-xs text-gray-600 mt-1 space-y-1">
        <div>
          <b>База:</b> {data.knowbase_name || <span className="text-gray-400">не задана</span>}
        </div>
        <div>
          <b>Запрос:</b> {data.query_attr || <span className="text-gray-400">не задан</span>}
        </div>
        <div>
          <b>Результат:</b> {data.save_results_to_attr || <span className="text-gray-400">не задан</span>}
        </div>
        {data.domain && (
          <div>
            <b>Домен:</b> {data.domain}
          </div>
        )}
        {data.trace_enabled && (
          <div className="text-purple-600 text-xs">
            <b>Трассировка включена</b>
          </div>
        )}
      </div>

      {hasAnalytics && (
        <div className="border-t pt-2 mt-2">
          <div className="text-xs font-medium text-gray-700 mb-1 flex items-center">
            <BarChart3 size={12} className="mr-1 text-emerald-600" />
            Аналитика: {data.log_way_steps?.steps?.length || 0}
          </div>
          <div className="space-y-1">
            {data.log_way_steps?.steps?.map((step, index) => (
              <div
                key={step.id || index}
                className="text-xs border rounded px-2 py-1 bg-blue-50 border-blue-200 text-blue-800"
              >
                <div className="font-medium mb-1">
                  {index + 1}. {step.type?.toUpperCase()}
                </div>
                <div className="space-y-0.5">
                  {step.type === "step" && step.way && (
                    <div>
                      <span className="text-gray-600">Путь:</span> {step.way}
                    </div>
                  )}
                  {step.type === "step" && step.step && (
                    <div>
                      <span className="text-gray-600">Шаг:</span> {step.step}
                    </div>
                  )}
                  {step.type === "event" && step.event && (
                    <div>
                      <span className="text-gray-600">Событие:</span> {step.event}
                    </div>
                  )}
                  {step.type === "tag" && step.tag && (
                    <div>
                      <span className="text-gray-600">Тег:</span> {step.tag}
                    </div>
                  )}
                  {step.type === "tag" && step.tag_action && (
                    <div>
                      <span className="text-gray-600">Действие:</span> {step.tag_action}
                    </div>
                  )}
                  {step.type === "utter" && step.utter && (
                    <div>
                      <span className="text-gray-600">Текст:</span> {step.utter}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom success output - зеленый */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="next_step"
        className="!w-3 !h-3 !bg-green-500"
        style={{ bottom: -6, left: "50%", transform: "translateX(-50%)" }}
        isConnectable={isConnectable}
      />

      {/* Left not found output - синий сверху */}
      <Handle
        type="source"
        position={Position.Left}
        id="not_found_step"
        className="!w-3 !h-3 !bg-blue-500"
        style={{ left: -6, top: "40%", transform: "translateY(-50%)" }}
        isConnectable={isConnectable}
      />

      {/* Left error output - красный снизу */}
      <Handle
        type="source"
        position={Position.Left}
        id="error_step"
        className="!w-3 !h-3 !bg-red-500"
        style={{ left: -6, top: "60%", transform: "translateY(-50%)" }}
        isConnectable={isConnectable}
      />
    </NodeBase>
  )
}

export default React.memo(SearchKnowledgebaseNode) 