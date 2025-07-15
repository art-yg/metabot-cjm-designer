"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import type { CJMNode } from "@/app/cjm-designer/types"
import type { TagsNodeData } from "@/components/cjm-designer/nodes/tags-node"
import TagsInput from "../tags-input"

interface TagsEditorProps {
  node: CJMNode
  onUpdateData: (nodeId: string, newData: Partial<TagsNodeData>) => void
}

function TagsEditor({ node, onUpdateData }: TagsEditorProps) {
  const data = node.data as TagsNodeData
  const isAddTags = data.type === "add_tags"

  const handleTypeChange = (newType: "add_tags" | "remove_tags") => {
    onUpdateData(node.id, {
      type: newType,
      label: newType === "add_tags" ? "Добавить теги" : "Удалить теги",
    })
  }

  const handleTagsChange = (newTags: string[]) => {
    onUpdateData(node.id, { tags: newTags })
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="tag_type" className="block text-sm font-medium text-gray-600 mb-1">
          Тип операции:
        </label>
        <Select value={data.type} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Выберите операцию" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="add_tags">Добавить теги</SelectItem>
            <SelectItem value="remove_tags">Удалить теги</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-600 mb-1">
          Теги:
        </label>
        <TagsInput
          tags={data.tags}
          onChange={handleTagsChange}
          placeholder="Введите тег и нажмите Enter или запятую"
          variant={isAddTags ? "add" : "remove"}
        />
        <p className="text-xs text-gray-500 mt-1">Введите теги через запятую или нажмите Enter после каждого тега</p>
      </div>

      <div
        className={`p-3 border rounded-md ${isAddTags ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
      >
        <p className={`text-sm ${isAddTags ? "text-green-700" : "text-red-700"}`}>
          <strong>{isAddTags ? "Добавление тегов" : "Удаление тегов"}</strong> используется для сегментации
          пользователей и создания условий в сценариях.
        </p>
      </div>
    </div>
  )
}

export default TagsEditor
