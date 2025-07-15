import { v4 as uuidv4 } from "uuid"
import type { CJMNode, CJMNodeData } from "@/app/cjm-editor/page"

export interface NodeFactoryOptions {
  position?: { x: number; y: number }
}

export class NodeFactory {
  private getDefaultPosition(): { x: number; y: number } {
    return { x: 100, y: 100 }
  }

  private createBaseNode<T extends CJMNodeData>(
    nodeType: string, // This seems to be the React Flow node type
    reactFlowType: string, // This is the React Flow node type string
    data: T,
    options?: NodeFactoryOptions,
  ): CJMNode {
    return {
      id: data.code,
      type: reactFlowType, // Use the reactFlowType string here
      position: options?.position || this.getDefaultPosition(),
      data,
    } as CJMNode // Cast to CJMNode which expects Node<CJMNodeData>
  }

  createSendTextNode(options?: NodeFactoryOptions): CJMNode {
    const nodeId = `send_text_${uuidv4().substring(0, 8)}`
    return this.createBaseNode(
      "sendText", // React Flow node type
      "sendText", // React Flow node type string
      {
        code: nodeId,
        type: "send_text", // Internal data type
        content: "New universal message...",
        next_step: null,
        title: "Send Text", // Client-side title
        content_per_channel: {}, // Default as empty object
        buttons: undefined,
        buttons_value_target: undefined,
        log_way_steps: undefined,
        links: undefined, // Initialize new links property
      },
      options,
    )
  }

  createValueInputNode(options?: NodeFactoryOptions): CJMNode {
    const nodeId = `value_input_${uuidv4().substring(0, 8)}`
    return this.createBaseNode(
      "valueInput",
      "valueInput",
      {
        code: nodeId,
        type: "value_input",
        title: "User Input",
        variable: "user_variable",
        prompt: "Please provide your input.",
        next_step: null,
        exit_step: null,
        reminders: [],
        log_way_steps: undefined,
      },
      options,
    )
  }

  createRunScriptNode(options?: NodeFactoryOptions): CJMNode {
    const nodeId = `run_script_${uuidv4().substring(0, 8)}`
    return this.createBaseNode(
      "runScript",
      "runScript",
      {
        code: nodeId,
        type: "run_custom_script",
        title: "Запустить скрипт",
        script_code: "",
        note: "",
      },
      options,
    )
  }

  createEntryPointNode(options?: NodeFactoryOptions): CJMNode {
    const nodeId = `entry_point_${uuidv4().substring(0, 8)}`
    return this.createBaseNode(
      "entryPoint",
      "entryPoint",
      {
        code: nodeId,
        type: "entry_point",
        name: "Стартовая точка",
        title: "Точка входа",
        next_step: null,
      },
      options,
    )
  }

  createGoToMapEntryNode(options?: NodeFactoryOptions): CJMNode {
    const nodeId = `go_to_map_${uuidv4().substring(0, 8)}`
    return this.createBaseNode(
      "goToMapEntry",
      "goToMapEntry",
      {
        code: nodeId,
        type: "go_to_map_entry",
        target_map: "",
        entry_point: "",
        note: "",
        title: "Переход в воронку",
      },
      options,
    )
  }

  createWaitNode(options?: NodeFactoryOptions): CJMNode {
    const nodeId = `wait_${uuidv4().substring(0, 8)}`
    return this.createBaseNode(
      "wait",
      "wait",
      {
        code: nodeId,
        type: "wait",
        title: "Ожидание",
        delay: {
          days: 0,
          hours: 0,
          minutes: 5,
          seconds: 0,
        },
        next_step: null,
      },
      options,
    )
  }

  createTagsNode(tagType: "add_tags" | "remove_tags", options?: NodeFactoryOptions): CJMNode {
    const nodeId = `${tagType}_${uuidv4().substring(0, 8)}`
    return this.createBaseNode(
      "tags",
      "tags",
      {
        code: nodeId,
        type: tagType,
        title: tagType === "add_tags" ? "Добавить теги" : "Удалить теги",
        tags: [],
        next_step: null,
        log_way_steps: undefined,
      },
      options,
    )
  }

  createCustomFieldNode(options?: NodeFactoryOptions): CJMNode {
    const nodeId = `custom_field_${uuidv4().substring(0, 8)}`
    return this.createBaseNode(
      "customField",
      "customField",
      {
        code: nodeId,
        type: "set_custom_field",
        title: "Установить поле",
        scope: "lead",
        key: "",
        value: "",
        value_type: "string",
        next_step: null,
        log_way_steps: undefined,
      },
      options,
    )
  }

  createIfElseNode(options?: NodeFactoryOptions): CJMNode {
    const nodeId = `if_else_${uuidv4().substring(0, 8)}`
    return this.createBaseNode(
      "ifElse",
      "ifElse",
      {
        code: nodeId,
        type: "if_else",
        title: "Условие",
        condition: "",
        next_step: null, // For 'true' branch
        else_step: null, // For 'false' branch
      },
      options,
    )
  }

  createSwitchNode(options?: NodeFactoryOptions): CJMNode {
    const nodeId = `switch_${uuidv4().substring(0, 8)}`
    return this.createBaseNode(
      "switch",
      "switch",
      {
        code: nodeId,
        type: "switch",
        title: "Switch",
        cases: [],
        default_step: null,
      },
      options,
    )
  }

  createLogActionNode(options?: NodeFactoryOptions): CJMNode {
    const nodeId = `log_action_${uuidv4().substring(0, 8)}`
    return this.createBaseNode(
      "logAction",
      "logAction",
      {
        code: nodeId,
        type: "log_action",
        title: "Записать в аналитику",
        log_type: "step", // Default log_type
        way: "",
        step: "",
        event: "",
        tag: "",
        tag_action: "add",
        utter: "",
        note: "",
        next_step: null,
      },
      options,
    )
  }

  createCallLLMNode(options?: NodeFactoryOptions): CJMNode {
    const nodeId = `call_llm_${uuidv4().substring(0, 8)}`
    return this.createBaseNode(
      "callLLM",
      "callLLM",
      {
        code: nodeId,
        type: "call_llm",
        title: "Обращение к LLM",
        agent_name: "",
        provider: "",
        model: "",
        prompt_table: "",
        system_prompts: { start: [], final: [] },
        history: { enabled: false, save_to_attr: "chat_history_str", max_length: 4, add_to_prompts: true },
        user_query: { enabled: false, attr: "user_query", add_to_prompts: false },
        response: { enabled: false, save_to_attr: "user_response", display_to_user: true, format: "none" },
        trace_enabled: false,
        next_step: null,
        error_step: null,
        log_way_steps: undefined,
      },
      options,
    )
  }
}

export const nodeFactory = new NodeFactory()
