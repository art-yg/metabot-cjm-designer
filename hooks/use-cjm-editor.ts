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
import type { CJMNode, CJMNodeData, SendTextNodeData } from "@/app/cjm-editor/page"
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
  const { fitView, screenToFlowPosition, deleteElements } = useReactFlow()

  // Helper function to create all edges from node data
  const createEdgesFromNodes = useCallback((nodes: CJMNode[]): Edge[] => {
    const allEdges: Edge[] = []

    nodes.forEach((node) => {
      const nodeData = node.data

      // Handle basic next_step for all node types
      if (nodeData.next_step) {
        const targetExists = nodes.some((n) => n.id === nodeData.next_step)
        if (targetExists) {
          allEdges.push({
            id: `${node.id}-next_step`,
            source: node.id,
            target: nodeData.next_step,
            sourceHandle: "next_step",
            type: "smoothstep",
            animated: true,
          })
        }
      }

      // Handle else_step for if-else nodes
      if (nodeData.type === "if_else" && (nodeData as any).else_step) {
        const targetExists = nodes.some((n) => n.id === (nodeData as any).else_step)
        if (targetExists) {
          allEdges.push({
            id: `${node.id}-else_step`,
            source: node.id,
            target: (nodeData as any).else_step,
            sourceHandle: "else_step",
            type: "smoothstep",
            animated: true,
          })
        }
      }

      // Handle default_step for switch nodes
      if (nodeData.type === "switch" && (nodeData as any).default_step) {
        const targetExists = nodes.some((n) => n.id === (nodeData as any).default_step)
        if (targetExists) {
          allEdges.push({
            id: `${node.id}-default_step`,
            source: node.id,
            target: (nodeData as any).default_step,
            sourceHandle: "default_step",
            type: "smoothstep",
            animated: true,
          })
        }
      }

      // Handle exit_step for various nodes
      if ((nodeData as any).exit_step) {
        const targetExists = nodes.some((n) => n.id === (nodeData as any).exit_step)
        if (targetExists) {
          allEdges.push({
            id: `${node.id}-exit_step`,
            source: node.id,
            target: (nodeData as any).exit_step,
            sourceHandle: "exit_step",
            type: "smoothstep",
            animated: true,
          })
        }
      }

      // Handle error_step for call_llm nodes
      if ((nodeData as any).error_step) {
        const targetExists = nodes.some((n) => n.id === (nodeData as any).error_step)
        if (targetExists) {
          allEdges.push({
            id: `${node.id}-error_step`,
            source: node.id,
            target: (nodeData as any).error_step,
            sourceHandle: "error_step",
            type: "smoothstep",
            animated: true,
          })
        }
      }

      // Handle timeout exit_step for wait nodes
      if (nodeData.type === "wait" && (nodeData as any).timeout?.exit_step) {
        const targetExists = nodes.some((n) => n.id === (nodeData as any).timeout.exit_step)
        if (targetExists) {
          allEdges.push({
            id: `${node.id}-timeout_step`,
            source: node.id,
            target: (nodeData as any).timeout.exit_step,
            sourceHandle: "timeout_step",
            type: "smoothstep",
            animated: true,
          })
        }
      }

      // Handle buttons for send_text nodes
      if (nodeData.type === "send_text" && (nodeData as SendTextNodeData).buttons) {
        const sendTextData = nodeData as SendTextNodeData
        sendTextData.buttons?.forEach((button) => {
          if (button.next_step) {
            const targetExists = nodes.some((n) => n.id === button.next_step)
            if (targetExists) {
              allEdges.push({
                id: `${node.id}-button-${button.id}`,
                source: node.id,
                target: button.next_step,
                sourceHandle: `button_${button.id}`,
                type: "smoothstep",
                animated: true,
              })
            }
          }
        })
      }

      // Handle cases for switch nodes
      if (nodeData.type === "switch" && (nodeData as any).cases) {
        ;(nodeData as any).cases.forEach((switchCase: any) => {
          if (switchCase.next_step) {
            const targetExists = nodes.some((n) => n.id === switchCase.next_step)
            if (targetExists) {
              allEdges.push({
                id: `${node.id}-case-${switchCase.id}`,
                source: node.id,
                target: switchCase.next_step,
                sourceHandle: `case_${switchCase.id}`,
                type: "smoothstep",
                animated: true,
              })
            }
          }
        })
      }

      // Handle trigger edges for send_text nodes
      if (nodeData.type === "send_text" && (nodeData as SendTextNodeData).links) {
        const sendTextData = nodeData as SendTextNodeData
        sendTextData.links?.forEach((link) => {
          link.triggers?.forEach((trigger) => {
            if (trigger.active) {
              // Create edge for on_true next_step
              if (trigger.on_true?.next_step) {
                const targetExists = nodes.some((n) => n.id === trigger.on_true!.next_step)
                if (targetExists) {
                  allEdges.push({
                    id: `${node.id}-trigger-${trigger.id}-true`,
                    source: node.id,
                    target: trigger.on_true.next_step,
                    sourceHandle: `${trigger.id}_true`,
                    type: "smoothstep",
                    animated: true,
                  })
                }
              }

              // Create edge for on_false next_step
              if (trigger.on_false?.next_step) {
                const targetExists = nodes.some((n) => n.id === trigger.on_false!.next_step)
                if (targetExists) {
                  allEdges.push({
                    id: `${node.id}-trigger-${trigger.id}-false`,
                    source: node.id,
                    target: trigger.on_false.next_step,
                    sourceHandle: `${trigger.id}_false`,
                    type: "smoothstep",
                    animated: true,
                  })
                }
              }
            }
          })
        })
      }
    })

    return allEdges
  }, [])

  // Helper function to create trigger edges for send_text nodes (legacy compatibility)
  const createTriggerEdges = useCallback((nodes: CJMNode[]): Edge[] => {
    const triggerEdges: Edge[] = []

    nodes.forEach((node) => {
      if (node.data.type === "send_text" && (node.data as SendTextNodeData).links) {
        const sendTextData = node.data as SendTextNodeData
        sendTextData.links?.forEach((link) => {
          link.triggers?.forEach((trigger) => {
            if (trigger.active) {
              // Create edge for on_true next_step
              if (trigger.on_true?.next_step) {
                const targetExists = nodes.some((n) => n.id === trigger.on_true!.next_step)
                if (targetExists) {
                  triggerEdges.push({
                    id: `${node.id}-trigger-${trigger.id}-true-${trigger.on_true.next_step}`,
                    source: node.id,
                    target: trigger.on_true.next_step,
                    sourceHandle: `${trigger.id}_true`,
                    type: "smoothstep",
                    animated: true,
                  })
                }
              }

              // Create edge for on_false next_step
              if (trigger.on_false?.next_step) {
                const targetExists = nodes.some((n) => n.id === trigger.on_false!.next_step)
                if (targetExists) {
                  triggerEdges.push({
                    id: `${node.id}-trigger-${trigger.id}-false-${trigger.on_false.next_step}`,
                    source: node.id,
                    target: trigger.on_false.next_step,
                    sourceHandle: `${trigger.id}_false`,
                    type: "smoothstep",
                    animated: true,
                  })
                }
              }
            }
          })
        })
      }
    })

    return triggerEdges
  }, [])

  // Функция проверки уникальности кода
  const checkCodeUniqueness = useCallback(
    (code: string, currentNodeId: string) => {
      return !nodes.some((node) => node.data.code === code && node.id !== currentNodeId)
    },
    [nodes],
  )

  const updateNodeAndConnections = useCallback(
    (nodeId: string, updateFn: (nodeData: CJMNodeData) => CJMNodeData) => {
      let affectedNode: CJMNode | undefined
      setNodes((nds) => {
        const updatedNodes = nds.map((n) => {
          if (n.id === nodeId) {
            affectedNode = { ...n, data: updateFn(n.data) }
            return affectedNode
          }
          return n
        })

        // Update ALL edges when node data changes
        const newEdges = createEdgesFromNodes(updatedNodes)
        setEdges(newEdges)

        return updatedNodes
      })

      if (selectedNode && selectedNode.id === nodeId && affectedNode) {
        setSelectedNode(affectedNode)
      }
    },
    [setNodes, selectedNode, createEdgesFromNodes, setEdges],
  )

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
      onEdgesChangeGeneric(changes)

      changes.forEach((change) => {
        if (change.type === "remove") {
          const removedEdge = edges.find((edge) => edge.id === change.id)
          if (removedEdge && removedEdge.source && removedEdge.sourceHandle) {
            const { source, sourceHandle } = removedEdge
            updateNodeAndConnections(source, (data) => {
              const newData = { ...data }
              if (sourceHandle === "next_step" && "next_step" in newData) (newData as any).next_step = null
              else if (sourceHandle === "else_step" && "else_step" in newData) (newData as any).else_step = null
              else if (sourceHandle === "default_step" && "default_step" in newData)
                (newData as any).default_step = null
              else if (sourceHandle === "exit_step" && "exit_step" in newData) (newData as any).exit_step = null
              else if (sourceHandle === "error_step" && "error_step" in newData) (newData as any).error_step = null
              else if (sourceHandle === "timeout_step" && "timeout" in newData && (newData as any).timeout) {
                ;(newData as any).timeout.exit_step = null
              } else if (sourceHandle.startsWith("button_") && newData.type === "send_text") {
                const buttonId = sourceHandle.replace("button_", "")
                ;(newData as SendTextNodeData).buttons = ((newData as SendTextNodeData).buttons || []).map((btn) =>
                  btn.id === buttonId ? { ...btn, next_step: null } : btn,
                )
              } else if (sourceHandle.startsWith("case_") && newData.type === "switch") {
                const caseId = sourceHandle.replace("case_", "")
                ;(newData as any).cases = ((newData as any).cases || []).map((c: any) =>
                  c.id === caseId ? { ...c, next_step: null } : c,
                )
              } else if (
                (sourceHandle.endsWith("_true") || sourceHandle.endsWith("_false")) &&
                newData.type === "send_text" &&
                (newData as SendTextNodeData).links
              ) {
                const triggerId = sourceHandle.substring(0, sourceHandle.lastIndexOf("_"))
                const conditionType = sourceHandle.substring(sourceHandle.lastIndexOf("_") + 1) as "true" | "false"
                ;(newData as SendTextNodeData).links = ((newData as SendTextNodeData).links || []).map((link) => ({
                  ...link,
                  triggers: (link.triggers || []).map((trigger) => {
                    if (trigger.id === triggerId) {
                      const actionBlockKey = conditionType === "true" ? "on_true" : "on_false"
                      return {
                        ...trigger,
                        [actionBlockKey]: {
                          ...(trigger[actionBlockKey] || {}),
                          next_step: null,
                        },
                      }
                    }
                    return trigger
                  }),
                }))
              }
              return newData
            })
          }
        }
      })
    },
    [edges, updateNodeAndConnections, onEdgesChangeGeneric],
  )

  // Connection handler
  const onConnect: OnConnect = useCallback(
    (connection) => {
      if (!connection.source || !connection.target || !connection.sourceHandle) return
      const { source, target, sourceHandle } = connection

      const singleOutputHandles = new Set(["next_step", "else_step", "default_step", "exit_step", "timeout_step", "error_step"])
      const sourceNode = nodes.find((n) => n.id === source)

      if (singleOutputHandles.has(sourceHandle) && sourceNode) {
        const existingEdge = edges.find((edge) => edge.source === source && edge.sourceHandle === sourceHandle)
        if (existingEdge) {
          setEdges((eds) => eds.filter((edge) => edge.id !== existingEdge.id))
          toast("Previous connection replaced.")
        }
      }

      updateNodeAndConnections(source, (data) => {
        const newData = { ...data }
        if (sourceHandle === "next_step" && "next_step" in newData) (newData as any).next_step = target
        else if (sourceHandle === "else_step" && "else_step" in newData) (newData as any).else_step = target
        else if (sourceHandle === "default_step" && "default_step" in newData) (newData as any).default_step = target
        else if (sourceHandle === "exit_step" && "exit_step" in newData) (newData as any).exit_step = target
        else if (sourceHandle === "error_step" && "error_step" in newData) (newData as any).error_step = target
        else if (sourceHandle === "timeout_step" && "timeout" in newData) {
          ;(newData as any).timeout = { ...((newData as any).timeout || {}), exit_step: target }
        } else if (sourceHandle.startsWith("button_") && newData.type === "send_text") {
          const buttonId = sourceHandle.replace("button_", "")
          ;(newData as SendTextNodeData).buttons = ((newData as SendTextNodeData).buttons || []).map((btn) =>
            btn.id === buttonId ? { ...btn, next_step: target } : btn,
          )
        } else if (sourceHandle.startsWith("case_") && newData.type === "switch") {
          const caseId = sourceHandle.replace("case_", "")
          ;(newData as any).cases = ((newData as any).cases || []).map((c: any) =>
            c.id === caseId ? { ...c, next_step: target } : c,
          )
        } else if (
          (sourceHandle.endsWith("_true") || sourceHandle.endsWith("_false")) &&
          newData.type === "send_text" &&
          (newData as SendTextNodeData).links
        ) {
          const triggerId = sourceHandle.substring(0, sourceHandle.lastIndexOf("_"))
          const conditionType = sourceHandle.substring(sourceHandle.lastIndexOf("_") + 1) as "true" | "false"
          ;(newData as SendTextNodeData).links = ((newData as SendTextNodeData).links || []).map((link) => ({
            ...link,
            triggers: (link.triggers || []).map((trigger) => {
              if (trigger.id === triggerId) {
                const actionBlockKey = conditionType === "true" ? "on_true" : "on_false"
                return {
                  ...trigger,
                  [actionBlockKey]: {
                    ...(trigger[actionBlockKey] || {}),
                    next_step: target,
                  },
                }
              }
              return trigger
            }),
          }))
        }
        return newData
      })

      setEdges((eds) => addEdge({ ...connection, type: "smoothstep", animated: true }, eds))
      toast.success("Steps connected!")
    },
    [nodes, edges, setEdges, updateNodeAndConnections],
  )

  const isValidConnection: IsValidConnection = useCallback(() => true, [])

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

  const nodeCreators = {
    addSendTextNode: useCallback(() => addNodeAtCenter(nodeFactory.createSendTextNode()), [addNodeAtCenter]),
    addInputNode: useCallback(() => addNodeAtCenter(nodeFactory.createValueInputNode()), [addNodeAtCenter]),
    addRunScriptNode: useCallback(() => addNodeAtCenter(nodeFactory.createRunScriptNode()), [addNodeAtCenter]),
    addEntryPointNode: useCallback(() => addNodeAtCenter(nodeFactory.createEntryPointNode()), [addNodeAtCenter]),
    addGoToMapEntryNode: useCallback(() => addNodeAtCenter(nodeFactory.createGoToMapEntryNode()), [addNodeAtCenter]),
    addWaitNode: useCallback(() => addNodeAtCenter(nodeFactory.createWaitNode()), [addNodeAtCenter]),
    addTagsNode: useCallback(
      (type: "add_tags" | "remove_tags") => addNodeAtCenter(nodeFactory.createTagsNode(type)),
      [addNodeAtCenter],
    ),
    addCustomFieldNode: useCallback(() => addNodeAtCenter(nodeFactory.createCustomFieldNode()), [addNodeAtCenter]),
    addIfElseNode: useCallback(() => addNodeAtCenter(nodeFactory.createIfElseNode()), [addNodeAtCenter]),
    addSwitchNode: useCallback(() => addNodeAtCenter(nodeFactory.createSwitchNode()), [addNodeAtCenter]),
    addLogActionNode: useCallback(() => addNodeAtCenter(nodeFactory.createLogActionNode()), [addNodeAtCenter]),
    addCallLLMNode: useCallback(() => addNodeAtCenter(nodeFactory.createCallLLMNode()), [addNodeAtCenter]),
  }

  const onNodeClick = useCallback((event: React.MouseEvent, node: CJMNode) => {
    setSelectedNode(node)
  }, [])

  const onUpdateNodeData = useCallback(
    (nodeId: string, newData: Partial<CJMNodeData>) => {
      // Если изменяется код, нужно обновить ID узла и все связи
      if (newData.code && newData.code !== nodes.find((n) => n.id === nodeId)?.data.code) {
        const oldCode = nodes.find((n) => n.id === nodeId)?.data.code
        const newCode = newData.code

        // Проверить уникальность
        if (!checkCodeUniqueness(newCode, nodeId)) {
          toast.error("Код должен быть уникальным")
          return
        }

        // Обновить узел с новым кодом и ID
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === nodeId) {
              return {
                ...node,
                id: newCode,
                data: { ...node.data, ...newData },
              }
            }
            return node
          }),
        )

        // Обновить все ссылки на старый код в других узлах
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === newCode) return node // Пропускаем обновленный узел

            const updatedData = { ...node.data }

            // Обновить next_step
            if (updatedData.next_step === oldCode) {
              updatedData.next_step = newCode
            }

            // Обновить else_step для if-else узлов
            if ((updatedData as any).else_step === oldCode) {
              ;(updatedData as any).else_step = newCode
            }

            // Обновить default_step для switch узлов
            if ((updatedData as any).default_step === oldCode) {
              ;(updatedData as any).default_step = newCode
            }

            // Обновить exit_step
            if ((updatedData as any).exit_step === oldCode) {
              ;(updatedData as any).exit_step = newCode
            }

            // Обновить timeout.exit_step для wait узлов
            if ((updatedData as any).timeout?.exit_step === oldCode) {
              ;(updatedData as any).timeout.exit_step = newCode
            }

            // Обновить кнопки для send_text узлов
            if (updatedData.type === "send_text" && (updatedData as SendTextNodeData).buttons) {
              ;(updatedData as SendTextNodeData).buttons = ((updatedData as SendTextNodeData).buttons || []).map(
                (btn) => (btn.next_step === oldCode ? { ...btn, next_step: newCode } : btn),
              )
            }

            // Обновить cases для switch узлов
            if (updatedData.type === "switch" && (updatedData as any).cases) {
              ;(updatedData as any).cases = ((updatedData as any).cases || []).map((c: any) =>
                c.next_step === oldCode ? { ...c, next_step: newCode } : c,
              )
            }

            // Обновить triggers для send_text узлов
            if (updatedData.type === "send_text" && (updatedData as SendTextNodeData).links) {
              ;(updatedData as SendTextNodeData).links = ((updatedData as SendTextNodeData).links || []).map(
                (link) => ({
                  ...link,
                  triggers: (link.triggers || []).map((trigger) => ({
                    ...trigger,
                    on_true:
                      trigger.on_true?.next_step === oldCode
                        ? { ...trigger.on_true, next_step: newCode }
                        : trigger.on_true,
                    on_false:
                      trigger.on_false?.next_step === oldCode
                        ? { ...trigger.on_false, next_step: newCode }
                        : trigger.on_false,
                  })),
                }),
              )
            }

            return { ...node, data: updatedData }
          }),
        )

        // Обновить edges
        setEdges((eds) =>
          eds.map((edge) => ({
            ...edge,
            source: edge.source === oldCode ? newCode : edge.source,
            target: edge.target === oldCode ? newCode : edge.target,
          })),
        )

        // Обновить выбранный узел
        if (selectedNode?.id === nodeId) {
          setSelectedNode((prev) => (prev ? { ...prev, id: newCode, data: { ...prev.data, ...newData } } : null))
        }

        toast.success("Код команды обновлен")
      } else {
        // Обычное обновление данных
        updateNodeAndConnections(nodeId, (currentData) => ({ ...currentData, ...newData }))
      }
    },
    [updateNodeAndConnections, nodes, checkCodeUniqueness, setNodes, setEdges, selectedNode, setSelectedNode],
  )

  const operations = {
    exportToMetabot: useCallback(async () => {
      try {
        await cjmOperations.exportToMetabot({ nodes, edges, mapSettings })
      } catch (error) {
        if (error instanceof Error && error.message.includes("настройки карты")) {
          setIsSettingsModalOpen(true)
        } else {
          toast.error((error as Error).message || "Export failed")
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

          // Create all edges for imported nodes
          const allEdges = createEdgesFromNodes(importedNodes)

          setNodes(importedNodes)
          setEdges(allEdges)
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
          toast.error((error as Error).message || "Import failed")
        }
      },
      [setNodes, setEdges, fitView, setMapSettings, createEdgesFromNodes],
    ),

    saveDraft: useCallback(() => {
      cjmOperations.saveDraft({ nodes, edges, mapSettings })
    }, [nodes, edges, mapSettings]),

    loadDraft: useCallback(() => {
      const draft = cjmOperations.loadDraft()
      if (draft) {
        // Create all edges for loaded nodes
        const allEdges = createEdgesFromNodes(draft.nodes)

        setNodes(draft.nodes)
        setEdges(allEdges)
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
      } else {
        toast("No draft found to load.")
      }
    }, [setNodes, setEdges, fitView, setMapSettings, createEdgesFromNodes]),
  }

  useEffect(() => {
    operations.loadDraft()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    nodes,
    edges,
    selectedNode,
    mapSettings,
    isJsonModalOpen,
    isSettingsModalOpen,
    reactFlowWrapper,
    setSelectedNode,
    setMapSettings,
    setIsJsonModalOpen,
    setIsSettingsModalOpen,
    onNodesChange,
    onEdgesChange,
    onConnect,
    isValidConnection,
    onNodeClick,
    onUpdateNodeData,
    checkCodeUniqueness,
    ...nodeCreators,
    ...operations,
    getExportJson: () => cjmOperations.exportToJson({ nodes, edges, mapSettings }),
  }
}
