"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import {
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  type Edge,
  type OnConnect,
  type IsValidConnection,
  type NodeChange,
  type EdgeChange,
} from "reactflow"
import { toast } from "react-hot-toast"
import type { CJMNode, CJMNodeData } from "@/app/cjm-editor/page"
import type { MapSettings } from "@/lib/map-settings"
import { DEFAULT_MAP_SETTINGS } from "@/lib/map-settings"
import { nodeFactory } from "@/lib/node-factory"
import { cjmOperations } from "@/lib/cjm-operations"

const initialNodes: CJMNode[] = []
const initialEdges: Edge[] = []

export function useCJMEditor() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChangeGeneric] = useNodesState<CJMNode>(initialNodes)
  const [edges, setEdges, onEdgesChangeGeneric] = useEdgesState<Edge>(initialEdges)
  const [selectedNode, setSelectedNode] = useState<CJMNode | null>(null)
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false)
  const [mapSettings, setMapSettings] = useState<MapSettings>(DEFAULT_MAP_SETTINGS)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const { fitView, screenToFlowPosition } = useReactFlow()

  // Node changes handler
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChangeGeneric(changes)
      changes.forEach((change) => {
        if (change.type === "remove" && selectedNode?.id === change.id) {
          setSelectedNode(null)
        }
        if (change.type === "select" && change.selected) {
          const newSelected = nodes.find((n) => n.id === change.id)
          if (newSelected) setSelectedNode(newSelected)
        } else if (change.type === "select" && !change.selected && selectedNode?.id === change.id) {
          setSelectedNode(null)
        }
      })
    },
    [onNodesChangeGeneric, selectedNode, nodes],
  )

  // Edge changes handler
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      changes.forEach((change) => {
        if (change.type === "remove") {
          const removedEdge = edges.find((edge) => edge.id === change.id)
          if (removedEdge && removedEdge.sourceHandle) {
            const { source, sourceHandle } = removedEdge
            setNodes((nds) =>
              nds.map((node) => {
                if (node.id === source) {
                  const newData = { ...node.data }
                  if (sourceHandle === "timeout_step") {
                    if ((newData as any).timeout) {
                      ;(newData as any).timeout.exit_step = null
                    }
                  } else {
                    ;(newData as any)[sourceHandle] = null
                  }
                  return { ...node, data: newData }
                }
                return node
              }),
            )
          }
        }
      })
      onEdgesChangeGeneric(changes)
    },
    [edges, setNodes, onEdgesChangeGeneric],
  )

  // Connection handler with auto-replacement for single-output nodes
  const onConnect: OnConnect = useCallback(
    (connection) => {
      if (!connection.source || !connection.target || !connection.sourceHandle) return

      const { source, target, sourceHandle } = connection

      // Определяем узлы, которые должны иметь только одно исходящее соединение
      const singleOutputHandles = new Set(["next_step"])
      const sourceNode = nodes.find((n) => n.id === source)

      // Если это handle с единственным выходом, удаляем существующее соединение
      if (singleOutputHandles.has(sourceHandle) && sourceNode) {
        const existingEdge = edges.find((edge) => edge.source === source && edge.sourceHandle === sourceHandle)

        if (existingEdge) {
          // Удаляем старое соединение
          setEdges((eds) => eds.filter((edge) => edge.id !== existingEdge.id))

          // Очищаем данные в старом узле
          setNodes((nds) =>
            nds.map((node) => {
              if (node.id === source) {
                const newData = { ...node.data }
                if (sourceHandle === "timeout_step") {
                  if ((newData as any).timeout) {
                    ;(newData as any).timeout.exit_step = null
                  }
                } else {
                  ;(newData as any)[sourceHandle] = null
                }
                return { ...node, data: newData }
              }
              return node
            }),
          )

          toast.info("Previous connection replaced with new one")
        }
      }

      // Создаем новое соединение
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === source) {
            const newData = { ...node.data }

            // Handle button connections for send_text nodes
            if (sourceHandle.startsWith("button_") && newData.type === "send_text") {
              const buttonId = sourceHandle.replace("button_", "")
              const buttons = (newData as any).buttons || []
              const updatedButtons = buttons.map((btn: any) =>
                btn.id === buttonId ? { ...btn, target_code: target } : btn,
              )
              ;(newData as any).buttons = updatedButtons
            } else if (sourceHandle === "timeout_step") {
              ;(newData as any).timeout = {
                ...(newData as any).timeout,
                exit_step: target,
              }
            } else {
              ;(newData as any)[sourceHandle] = target
            }
            return { ...node, data: newData }
          }
          return node
        }),
      )
      setEdges((eds) => addEdge({ ...connection, type: "smoothstep", animated: true }, eds))
      toast.success("Steps connected!")
    },
    [setNodes, setEdges, nodes, edges],
  )

  // Connection validation with auto-replacement for single-output handles
  const isValidConnection: IsValidConnection = useCallback((connection) => {
    // Всегда разрешаем соединение - логика замены будет в onConnect
    return true
  }, [])

  // Helper function to add node at center
  const addNodeAtCenter = useCallback(
    (newNode: CJMNode) => {
      let position = { x: 100, y: 100 }
      if (reactFlowWrapper.current) {
        const flowPosition = screenToFlowPosition({
          x: reactFlowWrapper.current.clientWidth / 2,
          y: reactFlowWrapper.current.clientHeight / 2,
        })
        position = { x: flowPosition.x - 112, y: flowPosition.y - 50 }
      }
      const nodeWithPosition = { ...newNode, position }
      setNodes((nds) => nds.concat(nodeWithPosition))
    },
    [setNodes, screenToFlowPosition],
  )

  // Node creation handlers
  const nodeCreators = {
    addSendTextNode: useCallback(() => {
      const newNode = nodeFactory.createSendTextNode()
      addNodeAtCenter(newNode)
      toast.success("New Send Text step added!")
    }, [addNodeAtCenter]),

    addInputNode: useCallback(() => {
      const newNode = nodeFactory.createValueInputNode()
      addNodeAtCenter(newNode)
      toast.success("New User Input step added!")
    }, [addNodeAtCenter]),

    addRunScriptNode: useCallback(() => {
      const newNode = nodeFactory.createRunScriptNode()
      addNodeAtCenter(newNode)
      toast.success("New Run Script step added!")
    }, [addNodeAtCenter]),

    addEntryPointNode: useCallback(() => {
      const newNode = nodeFactory.createEntryPointNode()
      addNodeAtCenter(newNode)
      toast.success("New Entry Point added!")
    }, [addNodeAtCenter]),

    addGoToMapEntryNode: useCallback(() => {
      const newNode = nodeFactory.createGoToMapEntryNode()
      addNodeAtCenter(newNode)
      toast.success("New Go to Map Entry added!")
    }, [addNodeAtCenter]),

    addWaitNode: useCallback(() => {
      const newNode = nodeFactory.createWaitNode()
      addNodeAtCenter(newNode)
      toast.success("New Wait step added!")
    }, [addNodeAtCenter]),

    addTagsNode: useCallback(
      (tagType: "add_tags" | "remove_tags") => {
        const newNode = nodeFactory.createTagsNode(tagType)
        addNodeAtCenter(newNode)
        toast.success(`New ${tagType === "add_tags" ? "Add Tags" : "Remove Tags"} step added!`)
      },
      [addNodeAtCenter],
    ),

    addCustomFieldNode: useCallback(() => {
      const newNode = nodeFactory.createCustomFieldNode()
      addNodeAtCenter(newNode)
      toast.success("New Custom Field step added!")
    }, [addNodeAtCenter]),

    addIfElseNode: useCallback(() => {
      const newNode = nodeFactory.createIfElseNode()
      addNodeAtCenter(newNode)
      toast.success("New IF/ELSE condition added!")
    }, [addNodeAtCenter]),

    addSwitchNode: useCallback(() => {
      const newNode = nodeFactory.createSwitchNode()
      addNodeAtCenter(newNode)
      toast.success("New SWITCH condition added!")
    }, [addNodeAtCenter]),

    addLogActionNode: useCallback(() => {
      const newNode = nodeFactory.createLogActionNode()
      addNodeAtCenter(newNode)
      toast.success("New Log to Analytics step added!")
    }, [addNodeAtCenter]),
  }

  // Event handlers
  const onNodeClick = useCallback((event: React.MouseEvent, node: CJMNode) => {
    setSelectedNode(node)
  }, [])

  const onUpdateNodeData = useCallback(
    (nodeId: string, newData: Partial<CJMNodeData>) => {
      setNodes((nds) => nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n)))
      if (selectedNode && selectedNode.id === nodeId) {
        setSelectedNode((prev) => (prev ? { ...prev, data: { ...prev.data, ...newData } as CJMNodeData } : null))
      }
    },
    [setNodes, selectedNode],
  )

  // Operations handlers
  const operations = {
    exportToMetabot: useCallback(async () => {
      try {
        await cjmOperations.exportToMetabot({ nodes, edges, mapSettings })
      } catch (error) {
        if (error instanceof Error && error.message.includes("настройки карты")) {
          setIsSettingsModalOpen(true)
        }
      }
    }, [nodes, edges, mapSettings]),

    exportJson: useCallback(() => {
      setIsJsonModalOpen(true)
    }, []),

    importJson: useCallback(
      (jsonString: string) => {
        try {
          const {
            nodes: importedNodes,
            edges: importedEdges,
            mapSettings: importedSettings,
          } = cjmOperations.importFromJson(jsonString)
          setNodes(importedNodes)
          setEdges(importedEdges)
          if (importedSettings) {
            setMapSettings(importedSettings)
          }
          setSelectedNode(null)
          toast.success("JSON schema imported successfully!")
          setTimeout(() => {
            if (importedNodes.length > 0) {
              fitView({ padding: 0.2, duration: 800 })
            }
          }, 100)
        } catch (error) {
          throw error
        }
      },
      [setNodes, setEdges, fitView],
    ),

    saveDraft: useCallback(() => {
      cjmOperations.saveDraft({ nodes, edges, mapSettings })
    }, [nodes, edges, mapSettings]),

    loadDraft: useCallback(() => {
      const draft = cjmOperations.loadDraft()
      if (draft) {
        setNodes(draft.nodes)
        setEdges(draft.edges)
        if (draft.mapSettings) {
          setMapSettings(draft.mapSettings)
        }
        setSelectedNode(null)
        toast.success("Draft loaded successfully!")
        setTimeout(() => {
          if (draft.nodes.length > 0) {
            fitView({ padding: 0.2, duration: 800 })
          }
        }, 100)
      }
    }, [setNodes, setEdges, fitView]),
  }

  // Load draft on mount
  useEffect(() => {
    operations.loadDraft()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
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
    ...nodeCreators,

    // Operations
    ...operations,

    // Utilities
    getExportJson: () => cjmOperations.exportToJson({ nodes, edges, mapSettings }),
  }
}
