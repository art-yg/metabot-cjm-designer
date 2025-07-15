"use client"

import type React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Trash2, Copy } from "lucide-react"
import { toast } from "react-hot-toast"
import type { Link } from "@/lib/link-types"
import TriggerSection from "./trigger-section"

interface LinkEditorProps {
  link: Link
  onChange: (updatedLink: Link) => void
  onDelete: () => void
  parentStepCode: string
}

const LinkEditor: React.FC<LinkEditorProps> = ({ link, onChange, onDelete, parentStepCode }) => {
  const handleFieldChange = <K extends keyof Link>(field: K, value: Link[K]) => {
    onChange({ ...link, [field]: value })
  }

  const handleCopyMacro = () => {
    if (link.code) {
      navigator.clipboard.writeText(`{{ ^${link.code} }}`)
      toast.success(`Макрос {{ ^${link.code} }} скопирован!`)
    } else {
      toast.error("Код ссылки пуст. Невозможно скопировать макрос.")
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Input
          value={link.title || ""}
          onChange={(e) => handleFieldChange("title", e.target.value)}
          placeholder="Название ссылки (опционально)"
          className="text-xs font-medium flex-grow mr-2 h-8"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          aria-label="Удалить ссылку"
          className="h-6 w-6 text-red-500 hover:text-red-700"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-end">
        <div>
          <Label htmlFor={`link-code-${link.id}`} className="text-xs font-medium text-gray-600">
            Код ссылки (для макроса) <span className="text-red-500">*</span>
          </Label>
          <Input
            id={`link-code-${link.id}`}
            value={link.code}
            onChange={(e) => handleFieldChange("code", e.target.value.replace(/\s+/g, "_"))}
            placeholder="например: my_special_link"
            className="text-xs h-8 mt-1"
            required
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleCopyMacro}
          disabled={!link.code}
          title="Копировать макрос"
          className="h-6 w-6"
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>

      <div>
        <Label htmlFor={`link-url-${link.id}`} className="text-xs font-medium text-gray-600">
          URL <span className="text-red-500">*</span>
        </Label>
        <Input
          id={`link-url-${link.id}`}
          type="url"
          value={link.url}
          onChange={(e) => handleFieldChange("url", e.target.value)}
          placeholder="https://example.com/your-page"
          className="text-xs h-8 mt-1"
          required
        />
      </div>

      <div className="pt-3 mt-3 border-t">
        <TriggerSection
          triggers={link.triggers || []}
          onChange={(updatedTriggers) => handleFieldChange("triggers", updatedTriggers)}
          allowedEventTypes={["link_clicked", "link_ignored"]}
          context="link"
          parentCode={link.code}
          autoGenerateTags={true}
        />
      </div>
    </div>
  )
}

export default LinkEditor
