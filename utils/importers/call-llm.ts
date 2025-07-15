import type { Node } from "reactflow"
import type { CallLLMNodeData } from "@/components/cjm-editor/nodes/call-llm-node"

export function importCallLLM(step: any): Node<CallLLMNodeData> {
  const nodeData: CallLLMNodeData = {
    code: step.code,
    type: "call_llm",
    title: step.title || "Обращение к LLM",
    agent_name: step.agent_name || "",
    provider: step.provider || "",
    model: step.model || "",
    prompt_table: step.prompt_table || "",
    system_prompts: {
      start: step.system_prompts?.start || [],
      final: step.system_prompts?.final || [],
    },
    history: {
      enabled: !!step.history?.enabled,
      save_to_attr: step.history?.save_to_attr || "chat_history_str",
      max_length: step.history?.max_length ?? 4,
      add_to_prompts: !!step.history?.add_to_prompts,
    },
    user_query: {
      enabled: !!step.user_query?.enabled,
      attr: step.user_query?.attr || "user_query",
      add_to_prompts: !!step.user_query?.add_to_prompts,
    },
    response: {
      enabled: !!step.response?.enabled,
      save_to_attr: step.response?.save_to_attr || "user_response",
      display_to_user: !!step.response?.display_to_user,
      format: step.response?.format || "none",
    },
    trace_enabled: !!step.trace_enabled,
    next_step: step.next_step || null,
    error_step: step.error_step || null,
    log_way_steps: step.log_way_steps,
  }

  return {
    id: step.code,
    type: "callLLM",
    position: step.coordinates
      ? { x: step.coordinates.x, y: step.coordinates.y }
      : { x: Math.random() * 400, y: Math.random() * 400 },
    data: nodeData,
  }
} 