"use client"
import { Plus, Minus, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useReactFlow } from "reactflow"

export function ZoomControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow()

  return (
    <div className="fixed bottom-4 right-4 z-30 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex flex-col gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => zoomIn()}
        className="w-8 h-8 p-0"
        title="Увеличить"
      >
        <Plus size={16} />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => zoomOut()}
        className="w-8 h-8 p-0"
        title="Уменьшить"
      >
        <Minus size={16} />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => fitView({ padding: 0.2 })}
        className="w-8 h-8 p-0"
        title="Показать всё"
      >
        <RotateCcw size={16} />
      </Button>
    </div>
  )
} 