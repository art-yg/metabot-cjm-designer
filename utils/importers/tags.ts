import type { Node } from "reactflow"
import type { TagsNodeData } from "@/components/cjm-editor/nodes/tags-node"
import type { LogWayStep } from "@/lib/analytics-types"
import { v4 as uuidv4 } from "uuid"

export function importTags(step: any): Node<TagsNodeData> {
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

  const nodeData: TagsNodeData = {
    code: step.code,
    type: step.type,
    title: step.type === "add_tags" ? "Добавить теги" : "Удалить теги",
    tags: step.tags || [],
    next_step: step.next_step || null,
    log_way_steps: importedLogWaySteps, // Import log_way_steps
  }

  return {
    id: step.code,
    type: "tags",
    position: step.coordinates
      ? { x: step.coordinates.x, y: step.coordinates.y }
      : { x: Math.random() * 400, y: Math.random() * 400 },
    data: nodeData,
  }
}
