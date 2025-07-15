"use client"
import { MousePointer, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CompactToolbarProps {
  selectedTool: 'pointer' | 'add'
  onToolSelect: (tool: 'pointer' | 'add') => void
  onAddNode: () => void
}

export function CompactToolbar({ selectedTool, onToolSelect, onAddNode }: CompactToolbarProps) {
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
    </div>
  )
} 