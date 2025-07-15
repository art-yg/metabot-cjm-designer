"use client"
import ReactFlow, { Controls, Background } from "reactflow"
import { Toaster } from "react-hot-toast"
import { UploadCloud, Save, FileJson, RotateCcw, Settings } from "lucide-react"

import SendTextNodeFull from "@/components/cjm-editor/nodes/send-text-node"
import ValueInputNodeFull from "@/components/cjm-editor/nodes/value-input-node"
import RunScriptNodeFull from "@/components/cjm-editor/nodes/run-script-node"
import EntryPointNodeFull from "@/components/cjm-editor/nodes/entry-point-node"
import GoToMapEntryNodeFull from "@/components/cjm-editor/nodes/go-to-map-entry-node"
import WaitNodeFull from "@/components/cjm-editor/nodes/wait-node"
import TagsNodeFull from "@/components/cjm-editor/nodes/tags-node"
import CustomFieldNodeFull from "@/components/cjm-editor/nodes/custom-field-node"
import IfElseNodeFull from "@/components/cjm-editor/nodes/if-else-node"
import SwitchNodeFull from "@/components/cjm-editor/nodes/switch-node"
import LogActionNodeFull from "@/components/cjm-editor/nodes/log-action-node"
import CallLLMNodeFull from "@/components/cjm-editor/nodes/call-llm-node"

import EditPanel from "@/components/cjm-editor/edit-panel"
import Palette from "@/components/cjm-editor/palette"
import JsonModal from "@/components/cjm-editor/json-modal"
import SettingsModal from "@/components/cjm-editor/settings-modal"

import type { useCJMEditor } from "@/hooks/use-cjm-editor"

const nodeTypes = {
  sendText: SendTextNodeFull,
  valueInput: ValueInputNodeFull,
  runScript: RunScriptNodeFull,
  entryPoint: EntryPointNodeFull,
  goToMapEntry: GoToMapEntryNodeFull,
  wait: WaitNodeFull,
  tags: TagsNodeFull,
  customField: CustomFieldNodeFull,
  ifElse: IfElseNodeFull,
  switch: SwitchNodeFull,
  logAction: LogActionNodeFull,
  callLLM: CallLLMNodeFull,
}

interface CJMEditorProps {
  editorState: ReturnType<typeof useCJMEditor>
}

export function CJMEditor({ editorState }: CJMEditorProps) {
  const {
    // State
    nodes,
    edges,
    selectedNode,
    mapSettings,
    isJsonModalOpen,
    isSettingsModalOpen,
    reactFlowWrapper,

    // State setters
    setSelectedNode,
    setMapSettings,
    setIsJsonModalOpen,
    setIsSettingsModalOpen,

    // React Flow handlers
    onNodesChange,
    onEdgesChange,
    onConnect,
    isValidConnection,
    onNodeClick,
    onUpdateNodeData,

    // Node creators
    addSendTextNode,
    addInputNode,
    addRunScriptNode,
    addEntryPointNode,
    addGoToMapEntryNode,
    addWaitNode,
    addTagsNode,
    addCustomFieldNode,
    addIfElseNode,
    addSwitchNode,
    addLogActionNode,
    addCallLLMNode,

    // Operations
    exportToMetabot,
    exportJson,
    importJson,
    saveDraft,
    loadDraft,
    getExportJson,
  } = editorState

  // Отладка mapSettings
  console.log("CJMEditor mapSettings:", mapSettings)

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="p-3 bg-white border-b border-gray-200 flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-700">CJM Editor / {mapSettings.title}</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1 transition-colors"
            title="Настройки карты"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={loadDraft}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1 flex items-center"
            title="Reload last saved draft"
          >
            <RotateCcw size={14} className="mr-1.5" /> Load Draft
          </button>
          <button
            onClick={saveDraft}
            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 flex items-center"
          >
            <Save size={14} className="mr-1.5" /> Save Draft
          </button>
          <button
            onClick={exportJson}
            className="px-3 py-1.5 text-xs font-medium text-white bg-purple-500 rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 flex items-center"
          >
            <FileJson size={14} className="mr-1.5" /> JSON I/O
          </button>
          <button
            onClick={exportToMetabot}
            className="px-3 py-1.5 text-xs font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 flex items-center"
          >
            <UploadCloud size={14} className="mr-1.5" /> To Metabot
          </button>
        </div>
      </header>

      <div className="flex flex-grow overflow-hidden">
        <Palette
          onAddSendTextNode={addSendTextNode}
          onAddInputNode={addInputNode}
          onAddRunScriptNode={addRunScriptNode}
          onAddEntryPointNode={addEntryPointNode}
          onAddGoToMapEntryNode={addGoToMapEntryNode}
          onAddWaitNode={addWaitNode}
          onAddTagsNode={addTagsNode}
          onAddCustomFieldNode={addCustomFieldNode}
          onAddIfElseNode={addIfElseNode}
          onAddSwitchNode={addSwitchNode}
          onAddLogActionNode={addLogActionNode}
          onAddCallLLMNode={addCallLLMNode}
        />

        <div className="flex-grow h-full" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            isValidConnection={isValidConnection}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            onPaneClick={() => setSelectedNode(null)}
            className="bg-gradient-to-br from-slate-50 to-gray-100"
            fitView
            fitViewOptions={{ padding: 0.2 }}
            deleteKeyCode={["Backspace", "Delete"]}
          >
            <Controls />
            <Background gap={16} color="#e0e0e0" />
          </ReactFlow>
        </div>

        {selectedNode && (
          <EditPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onUpdateData={onUpdateNodeData}
            mapSettings={mapSettings}
          />
        )}
      </div>

      <JsonModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        initialJson={getExportJson()}
        onImport={importJson}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={mapSettings}
        onSave={setMapSettings}
      />

      <Toaster position="bottom-right" containerStyle={{ zIndex: 9999 }} />
    </div>
  )
}
