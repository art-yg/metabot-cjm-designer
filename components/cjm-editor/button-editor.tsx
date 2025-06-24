"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { PlusCircle, Trash2, MousePointer, ChevronUp, ChevronDown } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import type { SendTextButton } from "@/lib/button-types"

interface ButtonEditorProps {
  buttons: SendTextButton[]
  onButtonsChange: (buttons: SendTextButton[]) => void
}

function ButtonEditor({ buttons, onButtonsChange }: ButtonEditorProps) {
  const [openItems, setOpenItems] = useState<string[]>([])

  const addButton = () => {
    const newButton: SendTextButton = {
      id: uuidv4(),
      title: "",
      target_code: null,
      row: 1,
      input_code: "",
      js_condition: "",
      value: "", // Новое поле
    }
    const updatedButtons = [...buttons, newButton]
    onButtonsChange(updatedButtons)

    // Auto-open the new button for editing
    setOpenItems([...openItems, `button-${newButton.id}`])
  }

  const updateButton = (index: number, field: keyof SendTextButton, value: string | number | null) => {
    const updatedButtons = [...buttons]
    updatedButtons[index] = {
      ...updatedButtons[index],
      [field]: value,
    }
    onButtonsChange(updatedButtons)
  }

  const removeButton = (index: number) => {
    const updatedButtons = buttons.filter((_, i) => i !== index)
    onButtonsChange(updatedButtons)
  }

  const moveButton = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === buttons.length - 1)) {
      return
    }

    const updatedButtons = [...buttons]
    const targetIndex = direction === "up" ? index - 1 : index + 1

    // Swap buttons
    const temp = updatedButtons[index]
    updatedButtons[index] = updatedButtons[targetIndex]
    updatedButtons[targetIndex] = temp

    onButtonsChange(updatedButtons)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <MousePointer size={16} className="mr-2 text-green-600" />
          <Label className="text-sm font-medium text-gray-700">Кнопки ({buttons.length})</Label>
        </div>
        <Button variant="outline" size="sm" onClick={addButton} className="h-8 text-xs">
          <PlusCircle size={14} className="mr-1.5" />
          Добавить кнопку
        </Button>
      </div>

      {buttons.length === 0 ? (
        <div className="text-center p-4 border border-dashed border-gray-300 rounded-md">
          <MousePointer size={24} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Нет кнопок. Будет использован стандартный переход next_step.</p>
        </div>
      ) : (
        <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="w-full">
          {buttons.map((button, index) => (
            <AccordionItem
              value={`button-${button.id}`}
              key={button.id}
              className="border border-green-200 rounded-md mb-2"
            >
              <AccordionTrigger className="text-xs py-2 px-3 hover:no-underline bg-green-50 rounded-t-md">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <span className="font-medium">
                      {index + 1}. {button.title || "Без названия"}
                    </span>
                    {button.target_code && <span className="ml-2 text-green-600 text-xs">→ {button.target_code}</span>}
                    {button.value && <span className="ml-2 text-purple-600 text-xs">= {button.value}</span>}
                  </div>
                  <div className="flex items-center space-x-1 mr-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        moveButton(index, "up")
                      }}
                      disabled={index === 0}
                      className="h-6 w-6"
                    >
                      <ChevronUp size={12} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        moveButton(index, "down")
                      }}
                      disabled={index === buttons.length - 1}
                      className="h-6 w-6"
                    >
                      <ChevronDown size={12} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeButton(index)
                      }}
                      className="h-6 w-6 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor={`title-${button.id}`} className="text-xs font-medium text-gray-600">
                      Название кнопки <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`title-${button.id}`}
                      value={button.title}
                      onChange={(e) => updateButton(index, "title", e.target.value)}
                      className="h-8 text-xs mt-1"
                      placeholder="Например: Подробнее"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`target-${button.id}`} className="text-xs font-medium text-gray-600">
                      Переход к шагу <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`target-${button.id}`}
                      value={button.target_code || ""}
                      onChange={(e) => updateButton(index, "target_code", e.target.value || null)}
                      className="h-8 text-xs mt-1"
                      placeholder="Код шага для перехода"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`value-${button.id}`} className="text-xs font-medium text-gray-600">
                      Значение для записи в атрибут
                    </Label>
                    <Input
                      id={`value-${button.id}`}
                      value={button.value || ""}
                      onChange={(e) => updateButton(index, "value", e.target.value)}
                      className="h-8 text-xs mt-1"
                      placeholder="Например: yes, option_1, premium"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Значение, которое будет записано в атрибут при нажатии на кнопку
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor={`row-${button.id}`} className="text-xs font-medium text-gray-600">
                        Строка
                      </Label>
                      <Input
                        id={`row-${button.id}`}
                        type="number"
                        min="1"
                        value={button.row}
                        onChange={(e) => updateButton(index, "row", Number.parseInt(e.target.value) || 1)}
                        className="h-8 text-xs mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`input-${button.id}`} className="text-xs font-medium text-gray-600">
                        Код ввода
                      </Label>
                      <Input
                        id={`input-${button.id}`}
                        value={button.input_code}
                        onChange={(e) => updateButton(index, "input_code", e.target.value)}
                        className="h-8 text-xs mt-1"
                        placeholder="1"
                        maxLength={10}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`condition-${button.id}`} className="text-xs font-medium text-gray-600">
                      Условие показа (JavaScript)
                    </Label>
                    <Textarea
                      id={`condition-${button.id}`}
                      value={button.js_condition}
                      onChange={(e) => updateButton(index, "js_condition", e.target.value)}
                      rows={2}
                      className="text-xs mt-1 custom-scrollbar"
                      placeholder="return lead.getAttr('user_role') == 'admin'"
                    />
                    <p className="text-xs text-gray-500 mt-1">Оставьте пустым для показа всегда</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {buttons.length > 0 && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-xs text-green-700">
            <strong>Кнопки активны:</strong> будут созданы выходы для каждой кнопки с заполненным названием и переходом.
            Стандартный выход next_step будет скрыт.
          </p>
        </div>
      )}
    </div>
  )
}

export default ButtonEditor
