"use client"

import type React from "react"
import { X, Save } from "lucide-react"
import { toast } from "react-hot-toast"
import type { CJMNode, CJMNodeData } from "@/app/cjm-editor/types"
import AnalyticsSection from "./analytics-section"
import type { LogWayData } from "@/lib/analytics-types"

interface BaseEditorProps {
  node: CJMNode
  onClose: () => void
  onUpdateData: (nodeId: string, newData: Partial<CJMNodeData>) => void
  withAnalytics?: boolean
  children: React.ReactNode
}

function BaseEditor({ node, onClose, onUpdateData, withAnalytics = false, children }: BaseEditorProps) {
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
        <h3 className="text-lg font-semibold text-gray-700">Edit Step: {node.data.label || node.data.code}</h3>
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
          value={node.data.code}
          readOnly
          className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed"
        />
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2 pb-4">
        {children}

        {withAnalytics && (
          <AnalyticsSection logWayData={(node.data as any).log_way_steps} onLogWayChange={handleAnalyticsChange} />
        )}
      </div>

      <button
        onClick={handleSave}
        className="w-full mt-auto px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center"
      >
        <Save size={16} className="mr-2" />
        Save Content
      </button>
    </div>
  )
}

export default BaseEditor
