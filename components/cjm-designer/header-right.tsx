"use client"
import { UploadCloud, Save, FileJson, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderRightProps {
  onLoadDraft: () => void
  onSaveDraft: () => void
  onExportJson: () => void
  onExportToMetabot: () => void
}

export function HeaderRight({ 
  onLoadDraft, 
  onSaveDraft, 
  onExportJson, 
  onExportToMetabot 
}: HeaderRightProps) {
  return (
    <div className="fixed top-4 right-4 z-30 bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2 flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onLoadDraft}
        className="text-xs"
      >
        <RotateCcw size={14} className="mr-1.5" />
        Загрузить
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onSaveDraft}
        className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100"
      >
        <Save size={14} className="mr-1.5" />
        Сохранить
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onExportJson}
        className="text-xs bg-purple-50 text-purple-600 hover:bg-purple-100"
      >
        <FileJson size={14} className="mr-1.5" />
        JSON I/O
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onExportToMetabot}
        className="text-xs bg-green-50 text-green-600 hover:bg-green-100"
      >
        <UploadCloud size={14} className="mr-1.5" />
        To Metabot
      </Button>
    </div>
  )
} 