"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, Link2 } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { v4 as uuidv4 } from "uuid"
import type { Link } from "@/lib/link-types"
import LinkEditor from "./link-editor"
import { Label } from "@/components/ui/label"

interface LinkSectionProps {
  links: Link[]
  onChange: (updatedLinks: Link[]) => void
  parentStepCode: string
}

const LinkSection: React.FC<LinkSectionProps> = ({ links = [], onChange, parentStepCode }) => {
  const [openItems, setOpenItems] = useState<string[]>([])
  const newLinkRef = useRef<string | null>(null)

  const generateUniqueLinkCode = (base: string): string => {
    let counter = 0
    let newCode = base
    while (links.some((l) => l.code === newCode)) {
      counter++
      newCode = `${base}_${counter}`
    }
    return newCode
  }

  const handleAddLink = () => {
    const newLinkId = uuidv4()
    const newLink: Link = {
      id: newLinkId,
      code: generateUniqueLinkCode("new_link"),
      title: "New Link",
      url: "",
      triggers: [],
    }
    onChange([...links, newLink])
    newLinkRef.current = newLinkId

    // Auto-open the new link for editing
    setOpenItems([...openItems, `link-${newLinkId}`])
  }

  const handleLinkChange = (index: number, updatedLink: Link) => {
    const newLinks = [...links]
    newLinks[index] = updatedLink
    onChange(newLinks)
  }

  const handleDeleteLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index)
    onChange(newLinks)
  }

  // Scroll to new link when added
  useEffect(() => {
    if (newLinkRef.current) {
      const element = document.querySelector(`[data-link-id="${newLinkRef.current}"]`)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
      }
      newLinkRef.current = null
    }
  }, [links])

  return (
    <div className="space-y-4">
      {/* Header with title and add button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link2 size={16} className="mr-2 text-blue-600" />
          <Label className="text-sm font-medium text-gray-700">
            Ссылки
            {links.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">{links.length}</span>
            )}
          </Label>
        </div>
        <Button variant="outline" size="sm" onClick={handleAddLink} className="h-8 text-xs">
          <PlusCircle size={14} className="mr-1.5" />
          Добавить ссылку
        </Button>
      </div>

      {/* Links list */}
      {links.length === 0 ? (
        <div className="text-center p-4 border border-dashed border-gray-300 rounded-md">
          <Link2 size={24} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Нет ссылок. Будет использован стандартный переход next_step.</p>
        </div>
      ) : (
        <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="w-full">
          {links.map((link, index) => (
            <AccordionItem
              value={`link-${link.id}`}
              key={link.id}
              className="border border-blue-200 rounded-md mb-2"
              data-link-id={link.id}
            >
              <AccordionTrigger className="text-xs py-2 px-3 hover:no-underline bg-blue-50 rounded-t-md">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <span className="font-medium">
                      {index + 1}. {link.title || link.code || "Без названия"}
                    </span>
                    {link.url && (
                      <span className="ml-2 text-blue-600 text-xs truncate max-w-[200px]">→ {link.url}</span>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3">
                <LinkEditor
                  link={link}
                  onChange={(updated) => handleLinkChange(index, updated)}
                  onDelete={() => handleDeleteLink(index)}
                  parentStepCode={parentStepCode}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {links.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-xs text-blue-700">
            <strong>Ссылки активны:</strong> будут созданы триггеры для отслеживания кликов и игнорирования ссылок.
            Используйте макросы {`{{ ^link_code }}`} в тексте сообщения.
          </p>
        </div>
      )}
    </div>
  )
}

export default LinkSection
