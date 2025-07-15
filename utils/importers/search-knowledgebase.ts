import type { Node } from "reactflow"
import type { SearchKnowledgebaseNodeData } from "@/components/cjm-editor/nodes/search-knowledgebase-node"
import type { LogWayStep } from "@/lib/analytics-types"
import { v4 as uuidv4 } from "uuid"

export function importSearchKnowledgebase(step: any): Node<SearchKnowledgebaseNodeData> {
  // Process log_way_steps - add client-side IDs
  const importedLogWaySteps = step.log_way_steps
    ? {
        steps: (step.log_way_steps || []).map(
          (logStep: any): LogWayStep => ({
            id: uuidv4(), // Add client-side ID
            type: logStep.type || "step",
            way: logStep.way || "",
            step: logStep.step || "",
            event: logStep.event || "",
            tag: logStep.tag || "",
            tag_action: logStep.tag_action || "add",
            utter: logStep.utter || "",
          }),
        ),
      }
    : undefined

  const nodeData: SearchKnowledgebaseNodeData = {
    code: step.code,
    type: "search_knowledgebase",
    title: step.title || "Поиск по базе знаний",
    knowbase_name: step.knowbase_name || "",
    query_attr: step.query_attr || "user_intent",
    domain: step.domain || "",
    save_results_to_attr: step.save_results_to_attr || "bestChunks",
    trace_enabled: !!step.trace_enabled,
    next_step: step.next_step || null,
    not_found_step: step.not_found_step || null,
    error_step: step.error_step || null,
    log_way_steps: importedLogWaySteps,
  }

  return {
    id: step.code,
    type: "searchKnowledgebase",
    position: step.coordinates
      ? { x: step.coordinates.x, y: step.coordinates.y }
      : { x: Math.random() * 400, y: Math.random() * 400 },
    data: nodeData,
  }
} 