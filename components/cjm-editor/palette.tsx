"use client"
import { PlusCircle } from "lucide-react"

interface PaletteProps {
  onAddSendTextNode: () => void
  onAddInputNode: () => void
  onAddRunScriptNode: () => void
  onAddEntryPointNode: () => void
  onAddGoToMapEntryNode: () => void
  onAddWaitNode: () => void
  onAddTagsNode: (tagType: "add_tags" | "remove_tags") => void
  onAddCustomFieldNode: () => void
  onAddIfElseNode: () => void
  onAddSwitchNode: () => void
  onAddLogActionNode: () => void
  onAddCallLLMNode: () => void
}

function Palette({
  onAddSendTextNode,
  onAddInputNode,
  onAddRunScriptNode,
  onAddEntryPointNode,
  onAddGoToMapEntryNode,
  onAddWaitNode,
  onAddTagsNode,
  onAddCustomFieldNode,
  onAddIfElseNode,
  onAddSwitchNode,
  onAddLogActionNode,
  onAddCallLLMNode,
}: PaletteProps) {
  return (
    <div className="w-60 bg-gray-100 p-4 border-r border-gray-200 flex flex-col h-full">
      <h2 className="text-lg font-semibold text-gray-700 mb-2 flex-shrink-0">Steps Palette</h2>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 -mr-2">
        {/* Add a new section for Logic Steps */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600 border-b pb-1">Логические операторы</h3>
          <button
            onClick={onAddIfElseNode}
            className="flex items-center justify-start w-full px-3 py-2 text-sm font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors"
          >
            <PlusCircle size={18} className="mr-2" />
            IF / ELSE
          </button>
          <button
            onClick={onAddSwitchNode}
            className="flex items-center justify-start w-full px-3 py-2 text-sm font-medium text-white bg-blue-400 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-colors"
          >
            <PlusCircle size={18} className="mr-2" />
            SWITCH
          </button>
        </div>

        {/* Communication Steps Section - Now first */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600 border-b pb-1">Шаги коммуникации</h3>
          <button
            onClick={onAddSendTextNode}
            className="flex items-center justify-start w-full px-3 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <PlusCircle size={18} className="mr-2" />
            Add Send Text
          </button>
          <button
            onClick={onAddInputNode}
            className="flex items-center justify-start w-full px-3 py-2 text-sm font-medium text-white bg-purple-500 rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
          >
            <PlusCircle size={18} className="mr-2" />
            Add User Input
          </button>
          <button
            onClick={onAddWaitNode}
            className="flex items-center justify-start w-full px-3 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
          >
            <PlusCircle size={18} className="mr-2" />
            Ожидание
          </button>
          <button
            onClick={onAddRunScriptNode}
            className="flex items-center justify-start w-full px-3 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2 transition-colors"
          >
            <PlusCircle size={18} className="mr-2" />
            Запустить скрипт
          </button>
          <button
            onClick={() => onAddTagsNode("add_tags")}
            className="flex items-center justify-start w-full px-3 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            <PlusCircle size={18} className="mr-2" />
            Добавить теги
          </button>
          <button
            onClick={() => onAddTagsNode("remove_tags")}
            className="flex items-center justify-start w-full px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            <PlusCircle size={18} className="mr-2" />
            Удалить теги
          </button>
          <button
            onClick={onAddCustomFieldNode}
            className="flex items-center justify-start w-full px-3 py-2 text-sm font-medium text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            <PlusCircle size={18} className="mr-2" />
            Установить поле
          </button>
          <button
            onClick={onAddLogActionNode}
            className="flex items-center justify-start w-full px-3 py-2 text-sm font-medium text-white bg-emerald-500 rounded-md hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
          >
            <PlusCircle size={18} className="mr-2" />
            Записать в аналитику
          </button>
          <button
            onClick={onAddCallLLMNode}
            className="flex items-center justify-start w-full px-3 py-2 text-sm font-medium text-white bg-amber-700 rounded-md hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-700 focus:ring-offset-2 transition-colors"
          >
            <PlusCircle size={18} className="mr-2" />
            Обращение к LLM
          </button>
        </div>

        {/* System Commands Section - Now second */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600 border-b pb-1">Системные команды</h3>
          <button
            onClick={onAddEntryPointNode}
            className="flex items-center justify-start w-full px-3 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            <PlusCircle size={18} className="mr-2" />
            Точка входа
          </button>
          <button
            onClick={onAddGoToMapEntryNode}
            className="flex items-center justify-start w-full px-3 py-2 text-sm font-medium text-white bg-purple-500 rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
          >
            <PlusCircle size={18} className="mr-2" />
            Переход в воронку
          </button>
        </div>
      </div>
    </div>
  )
}

export default Palette
