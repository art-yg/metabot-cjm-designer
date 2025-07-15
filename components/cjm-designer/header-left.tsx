"use client"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderLeftProps {
  projectTitle: string
  onSettingsClick: () => void
}

export function HeaderLeft({ projectTitle, onSettingsClick }: HeaderLeftProps) {
  return (
    <div className="fixed top-4 left-4 z-30 bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-2 flex items-center gap-3">
      <div className="flex items-center gap-2">
        {/* Мордашка метабота */}
        <div className="w-8 h-8 flex items-center justify-center">
          <img 
            src="/metabot-sign.png" 
            alt="Metabot" 
            className="w-8 h-8 rounded-md" 
          />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">{projectTitle}</span>
          <span className="text-xs text-gray-500">CJM Designer</span>
        </div>
      </div>
      
      <div className="h-6 w-px bg-gray-200" />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onSettingsClick}
        className="p-1 h-8 w-8"
      >
        <Settings size={16} />
      </Button>
    </div>
  )
} 