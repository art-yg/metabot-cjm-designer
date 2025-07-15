"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react"
import type { DeepLinkParameter } from "@/lib/deep-link-types"

interface DeepLinkParametersEditorProps {
  parameters: DeepLinkParameter[]
  onChange: (parameters: DeepLinkParameter[]) => void
}

function DeepLinkParametersEditor({ parameters, onChange }: DeepLinkParametersEditorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const addParameter = () => {
    onChange([...parameters, { key: "", value: "" }])
    setIsOpen(true)
  }

  const removeParameter = (index: number) => {
    onChange(parameters.filter((_, i) => i !== index))
  }

  const updateParameter = (index: number, field: keyof DeepLinkParameter, value: string) => {
    const updated = parameters.map((param, i) => (i === index ? { ...param, [field]: value } : param))
    onChange(updated)
  }

  return (
    <div className="space-y-2">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center p-0 h-auto font-medium text-gray-700 hover:text-gray-800"
            >
              {isOpen ? <ChevronDown size={16} className="mr-1" /> : <ChevronRight size={16} className="mr-1" />}
              <span className="text-sm">Параметры</span>
              {parameters.length > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                  {parameters.length}
                </span>
              )}
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="space-y-2 mt-2">
          {parameters.map((param, index) => (
            <div key={index} className="flex items-center gap-2 p-2 border rounded bg-gray-50">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <Input
                  value={param.key}
                  onChange={(e) => updateParameter(index, "key", e.target.value)}
                  placeholder="utm_source"
                  className="h-8 text-sm"
                />
                <Input
                  value={param.value}
                  onChange={(e) => updateParameter(index, "value", e.target.value)}
                  placeholder="ads"
                  className="h-8 text-sm"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeParameter(index)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}

          <Button onClick={addParameter} size="sm" variant="outline" className="w-full">
            <Plus size={14} className="mr-1" />
            Добавить параметр
          </Button>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

export default DeepLinkParametersEditor
