import type { Node } from "reactflow"
import type { CallLLMNodeData } from "@/components/cjm-editor/nodes/call-llm-node"

export function exportCallLLM(node: Node<CallLLMNodeData>) {
  const d = node.data
  return {
    code: d.code,
    type: "call_llm",
    title: d.title,
    agent_name: d.agent_name,
    provider: d.provider,
    model: d.model,
    prompt_table: d.prompt_table,
    system_prompts: {
      start: d.system_prompts.start,
      final: d.system_prompts.final,
    },
    history: {
      enabled: d.history.enabled,
      save_to_attr: d.history.save_to_attr,
      max_length: d.history.max_length,
      add_to_prompts: d.history.add_to_prompts,
    },
    user_query: {
      enabled: d.user_query.enabled,
      attr: d.user_query.attr,
      add_to_prompts: d.user_query.add_to_prompts,
    },
    response: {
      enabled: d.response.enabled,
      save_to_attr: d.response.save_to_attr,
      display_to_user: d.response.display_to_user,
      format: d.response.format,
    },
    trace_enabled: d.trace_enabled,
    next_step: d.next_step,
    error_step: d.error_step,
    log_way_steps: d.log_way_steps,
    coordinates: node.position,
  }
} 