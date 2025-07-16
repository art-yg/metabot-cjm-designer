"use client"
import { useState } from "react"
import ReactFlow, { Background } from "reactflow"
import { Toaster } from "react-hot-toast"

import SendTextNodeFull from "@/components/cjm-designer/nodes/send-text-node"
import ValueInputNodeFull from "@/components/cjm-designer/nodes/value-input-node"
import RunScriptNodeFull from "@/components/cjm-designer/nodes/run-script-node"
import EntryPointNodeFull from "@/components/cjm-designer/nodes/entry-point-node"
import GoToMapEntryNodeFull from "@/components/cjm-designer/nodes/go-to-map-entry-node"
import WaitNodeFull from "@/components/cjm-designer/nodes/wait-node"
import TagsNodeFull from "@/components/cjm-designer/nodes/tags-node"
import CustomFieldNodeFull from "@/components/cjm-designer/nodes/custom-field-node"
import IfElseNodeFull from "@/components/cjm-designer/nodes/if-else-node"
import SwitchNodeFull from "@/components/cjm-designer/nodes/switch-node"
import LogActionNodeFull from "@/components/cjm-designer/nodes/log-action-node"
import CallLLMNodeFull from "@/components/cjm-designer/nodes/call-llm-node"
import SearchKnowledgebaseNodeFull from "@/components/cjm-designer/nodes/search-knowledgebase-node"

import JsonModal from "@/components/cjm-designer/json-modal"
import SettingsModal from "@/components/cjm-designer/settings-modal"
import { HeaderLeft } from "@/components/cjm-designer/header-left"
import { HeaderRight } from "@/components/cjm-designer/header-right"
import { CompactToolbar } from "@/components/cjm-designer/compact-toolbar"
import { ZoomControls } from "@/components/cjm-designer/zoom-controls"
import { AddNodePopover } from "@/components/cjm-designer/add-node-popover"
import { NodeEditModal } from "@/components/cjm-designer/node-edit-modal"
import { KnowledgeBaseModal } from "@/components/cjm-designer/knowledge-base-modal"
import { PromptsModal } from "@/components/cjm-designer/prompts-modal"

import type { useCJMDesigner } from "@/hooks/use-cjm-designer"
import type { CJMNode } from "@/app/cjm-designer/types"

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
  searchKnowledgebase: SearchKnowledgebaseNodeFull,
}

interface CJMDesignerProps {
  editorState: ReturnType<typeof useCJMDesigner>
}

export function CJMDesigner({ editorState }: CJMDesignerProps) {
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
    checkCodeUniqueness,

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
    addSearchKnowledgebaseNode,

    // Operations
    exportToMetabot,
    exportJson,
    importJson,
    saveDraft,
    loadDraft,
    getExportJson,
  } = editorState

  // Новое состояние для интерфейса
  const [selectedTool, setSelectedTool] = useState<'pointer' | 'add'>('pointer')
  const [isAddNodePopoverOpen, setIsAddNodePopoverOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null)
  
  // Состояния для модальных окон MetaTables
  const [isKnowledgeBaseModalOpen, setIsKnowledgeBaseModalOpen] = useState(false)
  const [isPromptsModalOpen, setIsPromptsModalOpen] = useState(false)

  // Отладка mapSettings
  // console.log("CJMEditor mapSettings:", mapSettings)

  const nodeCreators = {
    onAddSendTextNode: addSendTextNode,
    onAddInputNode: addInputNode,
    onAddRunScriptNode: addRunScriptNode,
    onAddEntryPointNode: addEntryPointNode,
    onAddGoToMapEntryNode: addGoToMapEntryNode,
    onAddWaitNode: addWaitNode,
    onAddTagsNode: addTagsNode,
    onAddCustomFieldNode: addCustomFieldNode,
    onAddIfElseNode: addIfElseNode,
    onAddSwitchNode: addSwitchNode,
    onAddLogActionNode: addLogActionNode,
    onAddCallLLMNode: addCallLLMNode,
    onAddSearchKnowledgebaseNode: addSearchKnowledgebaseNode,
  }

  // Получаем актуальный узел для редактирования из массива nodes
  const foundNode = editingNodeId ? nodes.find(node => node.id === editingNodeId) : null
  const nodeToEdit = foundNode ? foundNode as any : null

  // Обработчики для модального редактирования
  const handleNodeDoubleClick = (event: React.MouseEvent, node: CJMNode) => {
    event.stopPropagation()
    setEditingNodeId(node.id)
    setIsEditModalOpen(true)
  }

  const handleEditModalClose = () => {
    setIsEditModalOpen(false)
    setEditingNodeId(null)
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-gray-100 overflow-hidden">
      {/* Левая плашка с логотипом */}
      <HeaderLeft 
        projectTitle={mapSettings.title}
        onSettingsClick={() => setIsSettingsModalOpen(true)}
      />

      {/* Правая плашка с кнопками */}
      <HeaderRight
        onLoadDraft={loadDraft}
        onSaveDraft={saveDraft}
        onExportJson={exportJson}
        onExportToMetabot={exportToMetabot}
      />

      {/* Компактный левый toolbar */}
      <CompactToolbar
        selectedTool={selectedTool}
        onToolSelect={setSelectedTool}
        onAddNode={() => setIsAddNodePopoverOpen(true)}
        onKnowledgeBaseOpen={() => setIsKnowledgeBaseModalOpen(true)}
        onPromptsOpen={() => setIsPromptsModalOpen(true)}
      />

      {/* Zoom controls в правом нижнем углу */}
      <ZoomControls />

      {/* Основная область с ReactFlow */}
      <div className="h-full w-full" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          isValidConnection={isValidConnection}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={handleNodeDoubleClick}
          onPaneClick={() => setSelectedNode(null)}
          className="bg-transparent"
          fitView
          fitViewOptions={{ padding: 0.2 }}
          deleteKeyCode={["Backspace", "Delete"]}
        >
          <Background gap={16} color="#e0e0e0" />
        </ReactFlow>
      </div>

      {/* Модальное окно редактирования узла */}
      <NodeEditModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        node={nodeToEdit}
        onUpdateData={onUpdateNodeData}
        mapSettings={mapSettings}
        checkCodeUniqueness={checkCodeUniqueness}
      />

      {/* Всплывающее окно добавления компонентов */}
      <AddNodePopover
        isOpen={isAddNodePopoverOpen}
        onClose={() => setIsAddNodePopoverOpen(false)}
        nodeCreators={nodeCreators}
      />

      {/* Модальные окна */}
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

      {/* Модальные окна MetaTables */}
      <KnowledgeBaseModal
        isOpen={isKnowledgeBaseModalOpen}
        onClose={() => setIsKnowledgeBaseModalOpen(false)}
        mapSettings={mapSettings}
      />

      <PromptsModal
        isOpen={isPromptsModalOpen}
        onClose={() => setIsPromptsModalOpen(false)}
        mapSettings={mapSettings}
      />

      <Toaster position="bottom-right" containerStyle={{ zIndex: 9999 }} />
    </div>
  )
}
