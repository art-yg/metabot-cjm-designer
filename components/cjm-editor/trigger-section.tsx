"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, LinkIcon, XCircle, ChevronsUpDown } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { v4 as uuidv4 } from "uuid"
import type { Trigger, TriggerEventType } from "@/lib/trigger-types"
import TriggerEditor from "./trigger-editor"

interface TriggerSectionProps {
  triggers: Trigger[]
  onChange: (updatedTriggers: Trigger[]) => void
  allowedEventTypes?: TriggerEventType[]
  context?: "link" | "custom"
  parentCode?: string // e.g., link code or step code for unique trigger code generation
  autoGenerateTags?: boolean
}

const TriggerSection: React.FC<TriggerSectionProps> = ({
  triggers = [],
  onChange,
  allowedEventTypes, // Will be passed to TriggerEditor
  context = "custom",
  parentCode = "",
  autoGenerateTags = true,
}) => {
  const [openTriggers, setOpenTriggers] = React.useState<string[]>([])

  const generateUniqueTriggerCode = (base: string): string => {
    let counter = 0
    let newCode = base
    if (parentCode) {
      newCode = `${parentCode}_${base}`
    }
    // Ensure uniqueness among existing triggers
    while (triggers.some((t) => t.code === newCode + (counter || ""))) {
      counter++
    }
    return newCode + (counter || "")
  }

  const createDefaultTrigger = (
    eventType: TriggerEventType,
    eventValue?: string,
    title?: string,
    customCode?: string,
    runAfter?: number | null,
  ): Trigger => {
    const code = customCode || generateUniqueTriggerCode(eventType.replace(/_/g, ""))
    const newTrigger: Trigger = {
      id: uuidv4(),
      code,
      title: title || `${eventType.replace(/_/g, " ")} for ${eventValue || parentCode || "item"}`,
      active: true,
      event_type: eventType,
      event_value: eventValue || (context === "link" ? parentCode : undefined),
      js_condition: "return true;",
      is_js_condition_custom: false,
      run_after_minutes: runAfter === undefined ? null : runAfter,
      on_true: {
        id: uuidv4(),
        add_tags: [],
        remove_tags: [],
        next_step: null,
        run_after_minutes: null,
        run_at_datetime: null,
      },
      on_false: {
        id: uuidv4(),
        add_tags: [],
        remove_tags: [],
        next_step: null,
        run_after_minutes: null,
        run_at_datetime: null,
      },
    }

    // Auto-generate js_condition and tags based on context and event type
    if (context === "link" && parentCode) {
      const val = eventValue || parentCode
      const clickedTag = `link_clicked_${val}`
      const ignoredTag = `link_ignored_${val}`

      if (eventType === "link_clicked") {
        newTrigger.js_condition = `return !lead.isTagExist('${clickedTag}') && !lead.isTagExist('${ignoredTag}');`
        if (autoGenerateTags && newTrigger.on_true) {
          newTrigger.on_true.add_tags = [clickedTag]
        }
      } else if (eventType === "link_ignored") {
        newTrigger.js_condition = `return !lead.isTagExist('${clickedTag}') && !lead.isTagExist('${ignoredTag}');`
        if (autoGenerateTags && newTrigger.on_true) {
          newTrigger.on_true.add_tags = [ignoredTag]
        }
        if (newTrigger.run_after_minutes === null) newTrigger.run_after_minutes = 30 // Default for ignored
      }
    }
    return newTrigger
  }

  const handleAddTrigger = (template: "link_clicked" | "link_ignored" | "pair" | "custom") => {
    const newTriggers: Trigger[] = []
    const linkCode = context === "link" ? parentCode : undefined

    switch (template) {
      case "link_clicked":
        newTriggers.push(createDefaultTrigger("link_clicked", linkCode, `Клик по ссылке: ${linkCode}`))
        break
      case "link_ignored":
        newTriggers.push(createDefaultTrigger("link_ignored", linkCode, `Игнор ссылки: ${linkCode}`, undefined, 30))
        break
      case "pair":
        const baseCode = generateUniqueTriggerCode(`link_pair`)
        const clickedTrigger = createDefaultTrigger(
          "link_clicked",
          linkCode,
          `Пара - Клик: ${linkCode}`,
          `${baseCode}_clicked`,
        )
        const ignoredTrigger = createDefaultTrigger(
          "link_ignored",
          linkCode,
          `Пара - Игнор: ${linkCode}`,
          `${baseCode}_ignored`,
          30,
        )

        // Adjust conditions for pair to ensure mutual exclusivity if desired by default
        const clickedTag = `link_clicked_${linkCode}`
        const ignoredTag = `link_ignored_${linkCode}`
        clickedTrigger.js_condition = `return !lead.isTagExist('${clickedTag}') && !lead.isTagExist('${ignoredTag}');`
        ignoredTrigger.js_condition = `return !lead.isTagExist('${clickedTag}') && !lead.isTagExist('${ignoredTag}');`

        newTriggers.push(clickedTrigger, ignoredTrigger)
        break
      case "custom":
      default:
        newTriggers.push(createDefaultTrigger("custom_timer", undefined, "Кастомный триггер")) // Default to a generic custom type
        break
    }

    // Добавляем новые триггеры
    const updatedTriggers = [...triggers, ...newTriggers]
    onChange(updatedTriggers)

    // Открываем только новые триггеры, закрываем остальные
    const newTriggerIds = newTriggers.map((t) => t.id)
    setOpenTriggers(newTriggerIds)

    // Прокручиваем к последнему добавленному триггеру
    setTimeout(() => {
      const lastTriggerId = newTriggerIds[newTriggerIds.length - 1]
      const element = document.querySelector(`[data-trigger-id="${lastTriggerId}"]`)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "nearest" })
      }
    }, 100)
  }

  const handleTriggerChange = (index: number, updatedTrigger: Trigger) => {
    const newTriggers = [...triggers]
    newTriggers[index] = updatedTrigger
    onChange(newTriggers)
  }

  const handleDeleteTrigger = (index: number) => {
    const triggerToDelete = triggers[index]
    const newTriggers = triggers.filter((_, i) => i !== index)
    onChange(newTriggers)

    // Убираем удаленный триггер из открытых
    setOpenTriggers((prev) => prev.filter((id) => id !== triggerToDelete.id))
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-700">Триггеры</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <PlusCircle className="h-4 w-4 mr-2" />
              Добавить триггер
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {context === "link" && (
              <>
                <DropdownMenuItem onClick={() => handleAddTrigger("link_clicked")} className="text-xs">
                  <LinkIcon className="h-3 w-3 mr-2 text-green-500" /> При клике на ссылку
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddTrigger("link_ignored")} className="text-xs">
                  <XCircle className="h-3 w-3 mr-2 text-red-500" /> При игноре ссылки
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddTrigger("pair")} className="text-xs">
                  <ChevronsUpDown className="h-3 w-3 mr-2 text-blue-500" /> Пара: клик + игнор
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem onClick={() => handleAddTrigger("custom")} className="text-xs">
              ⚙️ Кастомный триггер
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {triggers.length === 0 && <p className="text-xs text-gray-500 text-center py-2">Триггеры не настроены.</p>}

      <Accordion type="multiple" value={openTriggers} onValueChange={setOpenTriggers} className="w-full space-y-2">
        {triggers.map((trigger, index) => (
          <AccordionItem
            value={trigger.id}
            key={trigger.id}
            className="bg-gray-50 rounded-md border"
            data-trigger-id={trigger.id}
          >
            <AccordionTrigger className="px-3 py-2 text-xs hover:no-underline">
              <span className={`truncate max-w-[200px] ${trigger.active ? "text-slate-800" : "text-slate-400 italic"}`}>
                {trigger.title || trigger.code || `Триггер ${index + 1}`} ({trigger.event_type})
              </span>
            </AccordionTrigger>
            <AccordionContent className="border-t px-0 pb-0">
              <TriggerEditor
                trigger={trigger}
                onChange={(updated) => handleTriggerChange(index, updated)}
                onDelete={() => handleDeleteTrigger(index)}
                allowedEventTypes={
                  allowedEventTypes || (context === "link" ? ["link_clicked", "link_ignored"] : undefined)
                }
                context={context}
                parentCode={parentCode} // Pass link code or step code
                autoGenerateTags={autoGenerateTags}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

export default TriggerSection
