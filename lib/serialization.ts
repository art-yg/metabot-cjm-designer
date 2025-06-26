import type { Node, Edge } from "reactflow"
import type { CJMNodeData } from "@/app/cjm-editor/page"
import type { MapSettings } from "./map-settings"
import { exportNode } from "@/utils/exporters"
import { importNode } from "@/utils/importers"

export function exportToJson(nodes: Node<CJMNodeData>[], edges: Edge[], mapSettings: MapSettings): string {
  const payload = {
    script_request_params: {
      bot_id: mapSettings.bot_id,
      code: mapSettings.code,
      title: mapSettings.title,
      channels: mapSettings.channels, // Добавляем экспорт каналов
      steps: nodes.map((node) => exportNode(node)),
    },
  }

  return JSON.stringify(payload, null, 2)
}

export function importFromJson(jsonString: string): {
  nodes: Node<CJMNodeData>[]
  edges: Edge[]
  mapSettings?: MapSettings
} {
  try {
    const parsed = JSON.parse(jsonString)

    if (!parsed.script_request_params || !Array.isArray(parsed.script_request_params.steps)) {
      throw new Error("Invalid JSON structure: missing script_request_params.steps")
    }

    const scriptParams = parsed.script_request_params
    const steps = scriptParams.steps

    // Extract map settings from JSON с поддержкой каналов
    const mapSettings: MapSettings | undefined = {
      bot_id: scriptParams.bot_id || 2370,
      code: scriptParams.code || "cjm_001",
      title: scriptParams.title || "Импортированная карта",
      channels: scriptParams.channels || {
        telegram_bot_name: "",
        whatsapp_phone_number: "",
        vk_group_name: "",
        use_chat_widget: false,
      },
    }

    const nodes: Node<CJMNodeData>[] = []
    const edges: Edge[] = []

    steps.forEach((step: any) => {
      if (!step.code || !step.type) {
        throw new Error(`Invalid step: missing code or type for step ${JSON.stringify(step)}`)
      }

      const node = importNode(step)
      if (node) {
        nodes.push(node)
      }
    })

    // Create edges based on step connections
    nodes.forEach((node) => {
      const step = steps.find((s: any) => s.code === node.id)
      if (!step) return

      // Skip creating outgoing edges for go_to_map_entry nodes
      if (step.type === "go_to_map_entry") return

      // Handle next_step for all node types (only if no buttons for send_text)
      if (step.next_step) {
        if (nodes.find((n) => n.id === step.next_step)) {
          const edge: Edge = {
            id: `${step.code}-next-${step.next_step}`,
            source: step.code,
            target: step.next_step,
            sourceHandle: "next_step",
            type: "smoothstep",
            animated: true,
          }
          edges.push(edge)
        } else {
          console.warn(
            `Edge target node ${step.next_step} for source ${step.code} (next_step) not found. Skipping edge.`,
          )
        }
      }

      // Handle button connections for send_text nodes
      if (step.type === "send_text" && step.buttons && Array.isArray(step.buttons)) {
        const nodeData = node.data as any

        // Поддержка старого формата target_code
        step.buttons.forEach((button: any, index: number) => {
          const targetStep = button.next_step || button.target_code
          if (targetStep && button.title?.trim()) {
            if (nodes.find((n) => n.id === targetStep)) {
              const edge: Edge = {
                id: `${step.code}-button${index}-${targetStep}`,
                source: step.code,
                target: targetStep,
                sourceHandle: `button_${nodeData.buttons[index].id}`,
                type: "smoothstep",
                animated: true,
              }
              edges.push(edge)
            } else {
              console.warn(
                `Edge target node ${targetStep} for source ${step.code} (button ${index}) not found. Skipping edge.`,
              )
            }
          }
        })
      }

      // Handle value_input specific connections
      if (step.type === "value_input") {
        if (step.exit_step) {
          if (nodes.find((n) => n.id === step.exit_step)) {
            const edge: Edge = {
              id: `${step.code}-exit-${step.exit_step}`,
              source: step.code,
              target: step.exit_step,
              sourceHandle: "exit_step",
              type: "smoothstep",
              animated: true,
            }
            edges.push(edge)
          } else {
            console.warn(
              `Edge target node ${step.exit_step} for source ${step.code} (exit_step) not found. Skipping edge.`,
            )
          }
        }

        // Handle timeout connections
        if (step.timeout && step.timeout.exit_step) {
          if (nodes.find((n) => n.id === step.timeout.exit_step)) {
            const edge: Edge = {
              id: `${step.code}-timeout-${step.timeout.exit_step}`,
              source: step.code,
              target: step.timeout.exit_step,
              sourceHandle: "timeout_step",
              type: "smoothstep",
              animated: true,
            }
            edges.push(edge)
          } else {
            console.warn(
              `Edge target node ${step.timeout.exit_step} for source ${step.code} (timeout_step) not found. Skipping edge.`,
            )
          }
        }
      }

      // Handle if_else connections
      if (step.type === "if_else") {
        if (step.else_step) {
          if (nodes.find((n) => n.id === step.else_step)) {
            const edge: Edge = {
              id: `${step.code}-else-${step.else_step}`,
              source: step.code,
              target: step.else_step,
              sourceHandle: "else_step",
              type: "smoothstep",
              animated: true,
            }
            edges.push(edge)
          } else {
            console.warn(
              `Edge target node ${step.else_step} for source ${step.code} (else_step) not found. Skipping edge.`,
            )
          }
        }
      }

      // Handle switch connections
      if (step.type === "switch") {
        // Connect each case
        if (step.cases && Array.isArray(step.cases)) {
          step.cases.forEach((caseItem: any, index: number) => {
            if (caseItem.step) {
              if (nodes.find((n) => n.id === caseItem.step)) {
                const edge: Edge = {
                  id: `${step.code}-case${index}-${caseItem.step}`,
                  source: step.code,
                  target: caseItem.step,
                  sourceHandle: `case_${node.data.cases[index].id}`,
                  type: "smoothstep",
                  animated: true,
                }
                edges.push(edge)
              } else {
                console.warn(
                  `Edge target node ${caseItem.step} for source ${step.code} (case ${index}) not found. Skipping edge.`,
                )
              }
            }
          })
        }

        // Connect default step
        if (step.default_step) {
          if (nodes.find((n) => n.id === step.default_step)) {
            const edge: Edge = {
              id: `${step.code}-default-${step.default_step}`,
              source: step.code,
              target: step.default_step,
              sourceHandle: "default_step",
              type: "smoothstep",
              animated: true,
            }
            edges.push(edge)
          } else {
            console.warn(
              `Edge target node ${step.default_step} for source ${step.code} (default_step) not found. Skipping edge.`,
            )
          }
        }
      }
    })

    return { nodes, edges, mapSettings }
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
