"use client"

import type React from "react"
import { X, Save, MessageSquare, Clock, Code, KeyboardIcon, User, Split, Shuffle, Brain, BookOpen, BarChart, Tags, Play, Target } from "lucide-react"
import { toast } from "react-hot-toast"
import type { CJMNode, CJMNodeData } from "@/app/cjm-designer/types"
import AnalyticsSection from "./analytics-section"
import type { LogWayData } from "@/lib/analytics-types"
import { useState, useEffect } from "react"

// Функция для получения иконки и цвета по типу узла
function getNodeIconAndColor(nodeType: string) {
  switch (nodeType) {
    case "send_text":
      return { icon: MessageSquare, color: "bg-blue-500" }
    case "wait":
      return { icon: Clock, color: "bg-orange-500" }
    case "run_custom_script":
      return { icon: Code, color: "bg-amber-600" }
    case "value_input":
      return { icon: KeyboardIcon, color: "bg-purple-500" }
    case "set_custom_field":
      return { icon: User, color: "bg-indigo-500" }
    case "if_else":
      return { icon: Split, color: "bg-yellow-500" }
    case "switch":
      return { icon: Shuffle, color: "bg-blue-400" }
    case "call_llm":
      return { icon: Brain, color: "bg-amber-700" }
    case "search_knowledgebase":
      return { icon: BookOpen, color: "bg-purple-600" }
    case "log_action":
      return { icon: BarChart, color: "bg-emerald-500" }
    case "add_tags":
      return { icon: Tags, color: "bg-green-500" }
    case "remove_tags":
      return { icon: Tags, color: "bg-red-500" }
    case "entry_point":
      return { icon: Play, color: "bg-green-500" }
    case "go_to_map_entry":
      return { icon: Target, color: "bg-purple-500" }
    default:
      return { icon: MessageSquare, color: "bg-gray-500" }
  }
}

interface BaseEditorProps {
  node: CJMNode
  onClose: () => void
  onUpdateData: (nodeId: string, newData: Partial<CJMNodeData>) => void
  withAnalytics?: boolean
  children: React.ReactNode
  checkCodeUniqueness?: (code: string, currentNodeId: string) => boolean
  labelOverride?: string // new prop
  isModal?: boolean
}

function BaseEditor({
  node,
  onClose,
  onUpdateData,
  withAnalytics = false,
  children,
  checkCodeUniqueness,
  labelOverride,
  isModal = false,
}: BaseEditorProps) {
  const [codeError, setCodeError] = useState<string>("")
  const [tempCode, setTempCode] = useState(node.data.code)

  const validateCode = (code: string) => {
    if (!code.trim()) {
      setCodeError("Код не может быть пустым")
      return false
    }
    if (code.trim() !== node.data.code && checkCodeUniqueness && !checkCodeUniqueness(code.trim(), node.id)) {
      setCodeError("Код должен быть уникальным")
      return false
    }
    setCodeError("")
    return true
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCode = e.target.value
    setTempCode(newCode)
    validateCode(newCode)
    
    // В модальном режиме обновляем локальное состояние при изменении
    // Это нужно для индикатора "Есть изменения"
    if (isModal && newCode !== node.data.code) {
      // Обновляем локальное состояние с новым кодом (даже если невалидный)
      // Валидация произойдет при сохранении
      onUpdateData(node.id, { code: newCode })
    }
  }

  const handleCodeBlur = () => {
    if (tempCode.trim() && tempCode !== node.data.code && !codeError) {
      if (isModal) {
        // В модальном режиме обновляем локальное состояние
        onUpdateData(node.id, { code: tempCode.trim() })
      } else {
        // В обычном режиме обновляем сразу
        onUpdateData(node.id, { code: tempCode.trim() })
      }
    }
  }

  const handleCodeKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCodeBlur()
    }
  }

  useEffect(() => {
    setTempCode(node.data.code)
    setCodeError("")
  }, [node.data.code])

  const handleSave = () => {
    onUpdateData(node.id, node.data)
    toast.success("Step content saved!")
  }

  const handleAnalyticsChange = (logWayData: LogWayData | undefined) => {
    const updatedData = {
      ...node.data,
      log_way_steps: logWayData,
    }
    onUpdateData(node.id, updatedData)
  }

  return (
    <div className={isModal ? "w-full" : "w-96 bg-white p-4 border-l border-gray-200 shadow-lg flex flex-col h-full"}>
      {!isModal && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            {(() => {
              const { icon: IconComponent, color } = getNodeIconAndColor(node.data.type)
              return (
                <span className={`inline-flex items-center justify-center w-7 h-7 ${color} rounded-lg`}>
                  <IconComponent size={16} className="text-white" />
                </span>
              )
            })()}
            <h3 className="text-lg font-semibold text-gray-700">Edit Step: {labelOverride ?? node.data.title ?? node.data.code}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            aria-label="Close edit panel"
          >
            <X size={20} />
          </button>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-1">Node Code (ID):</label>
        <input
          type="text"
          value={tempCode}
          onChange={handleCodeChange}
          onBlur={handleCodeBlur}
          onKeyPress={handleCodeKeyPress}
          className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 transition-colors ${
            codeError
              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          }`}
          placeholder="Введите уникальный код"
        />
        {codeError && (
          <p className="text-red-500 text-xs mt-1 flex items-center">
            <span className="mr-1">⚠️</span>
            {codeError}
          </p>
        )}
        <p className="text-gray-500 text-xs mt-1">Код используется как уникальный идентификатор команды</p>
      </div>

      <div className={isModal ? "space-y-6" : "flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2 pb-4"}>
        {children}

        {withAnalytics && (
          <AnalyticsSection logWayData={(node.data as any).log_way_steps} onLogWayChange={handleAnalyticsChange} />
        )}
      </div>

      {!isModal && (
        <button
          onClick={handleSave}
          className="w-full mt-auto px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center transition-colors"
        >
          <Save size={16} className="mr-2" />
          Save Content
        </button>
      )}
    </div>
  )
}

export default BaseEditor
