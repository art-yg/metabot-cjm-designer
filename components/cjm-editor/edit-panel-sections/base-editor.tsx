"use client"

import type React from "react"
import { X, Save } from "lucide-react"
import { toast } from "react-hot-toast"
import type { CJMNode, CJMNodeData } from "@/app/cjm-editor/types"
import AnalyticsSection from "./analytics-section"
import type { LogWayData } from "@/lib/analytics-types"
import { useState, useEffect } from "react"

interface BaseEditorProps {
  node: CJMNode
  onClose: () => void
  onUpdateData: (nodeId: string, newData: Partial<CJMNodeData>) => void
  withAnalytics?: boolean
  children: React.ReactNode
  checkCodeUniqueness?: (code: string, currentNodeId: string) => boolean
  labelOverride?: string // new prop
}

function BaseEditor({
  node,
  onClose,
  onUpdateData,
  withAnalytics = false,
  children,
  checkCodeUniqueness,
  labelOverride,
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
  }

  const handleCodeBlur = () => {
    if (tempCode.trim() && tempCode !== node.data.code && !codeError) {
      onUpdateData(node.id, { code: tempCode.trim() })
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
    <div className="w-96 bg-white p-4 border-l border-gray-200 shadow-lg flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Edit Step: {labelOverride ?? node.data.title ?? node.data.code}</h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          aria-label="Close edit panel"
        >
          <X size={20} />
        </button>
      </div>

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

      <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2 pb-4">
        {children}

        {withAnalytics && (
          <AnalyticsSection logWayData={(node.data as any).log_way_steps} onLogWayChange={handleAnalyticsChange} />
        )}
      </div>

      <button
        onClick={handleSave}
        className="w-full mt-auto px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center transition-colors"
      >
        <Save size={16} className="mr-2" />
        Save Content
      </button>
    </div>
  )
}

export default BaseEditor
