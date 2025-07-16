"use client"
import { MousePointer, Plus, BookOpen, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CompactToolbarProps {
  selectedTool: 'pointer' | 'add'
  onToolSelect: (tool: 'pointer' | 'add') => void
  onAddNode: () => void
  onKnowledgeBaseOpen: () => void
  onPromptsOpen: () => void
}

export function CompactToolbar({ 
  selectedTool, 
  onToolSelect, 
  onAddNode, 
  onKnowledgeBaseOpen, 
  onPromptsOpen 
}: CompactToolbarProps) {
  return (
    <div className="fixed top-20 left-4 z-30 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex flex-col gap-1">
      <Button
        variant={selectedTool === 'pointer' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onToolSelect('pointer')}
        className={cn(
          "w-10 h-10 p-0",
          selectedTool === 'pointer' && "bg-blue-500 hover:bg-blue-600"
        )}
        title="Указатель - выбор и перемещение узлов"
      >
        <MousePointer size={18} />
      </Button>
      
      <Button
        variant={selectedTool === 'add' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => {
          onToolSelect('add')
          onAddNode()
        }}
        className={cn(
          "w-10 h-10 p-0",
          selectedTool === 'add' && "bg-green-500 hover:bg-green-600"
        )}
        title="Добавить компонент"
      >
        <Plus size={18} />
      </Button>

      {/* Разделитель */}
      <div className="h-px bg-gray-200 my-1" />

      {/* Кнопка Промпты */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onPromptsOpen}
        className="w-10 h-10 p-0 hover:bg-purple-50 hover:text-purple-600"
        title="Промпты - шаблоны для ИИ"
      >
        <Brain size={18} />
      </Button>

      {/* Кнопка База знаний */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onKnowledgeBaseOpen}
        className="w-10 h-10 p-0 hover:bg-amber-50 hover:text-amber-600"
        title="База знаний - управление контентом"
      >
        <BookOpen size={18} />
      </Button>
    </div>
  )
} 