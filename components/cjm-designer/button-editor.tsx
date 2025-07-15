"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import type { SendTextButton } from "@/lib/button-types"
import TagsInput from "./tags-input"

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
      next_step: null,
      row: 1,
      input_code: "",
      js_condition: "",
      value: "",
      add_tags: [],
      remove_tags: [],
    }
    const updatedButtons = [...buttons, newButton]
    onButtonsChange(updatedButtons)
    setOpenItems([...openItems, newButton.id])
  }

  const updateButton = (id: string, updates: Partial<SendTextButton>) => {
    const updatedButtons = buttons.map((button) => (button.id === id ? { ...button, ...updates } : button))
    onButtonsChange(updatedButtons)
  }

  const removeButton = (id: string) => {
    const updatedButtons = buttons.filter((button) => button.id !== id)
    onButtonsChange(updatedButtons)
    setOpenItems(openItems.filter((item) => item !== id))
  }

  const moveButton = (fromIndex: number, toIndex: number) => {
    const updatedButtons = [...buttons]
    const [movedButton] = updatedButtons.splice(fromIndex, 1)
    updatedButtons.splice(toIndex, 0, movedButton)
    onButtonsChange(updatedButtons)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-gray-700">Кнопки</Label>
        <Button onClick={addButton} size="sm" variant="outline" className="h-8 bg-transparent">
          <Plus size={14} className="mr-1" />
          Добавить кнопку
        </Button>
      </div>

      {buttons.length > 0 && (
        <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="w-full">
          {buttons.map((button, index) => (
            <AccordionItem value={button.id} key={button.id} className="border rounded-md">
              <AccordionTrigger className="px-3 py-2 hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <GripVertical size={14} className="text-gray-400" />
                    <span className="text-sm font-medium">
                      {index + 1}. {button.title || "Новая кнопка"}
                      {button.input_code && (
                        <span className="font-mono text-xs ml-2 text-gray-600">[{button.input_code}]</span>
                      )}
                      {((button.add_tags && button.add_tags.length > 0) ||
                        (button.remove_tags && button.remove_tags.length > 0)) && (
                        <span className="text-xs ml-2 text-purple-600">
                          [+{button.add_tags?.length || 0} -{button.remove_tags?.length || 0} tags]
                        </span>
                      )}
                    </span>
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                      removeButton(button.id)
                    }}
                    className="h-6 w-6 p-0 flex items-center justify-center rounded-sm text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer transition-colors"
                  >
                    <Trash2 size={12} />
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3">
                <div className="space-y-3">
                  {/* Название кнопки */}
                  <div>
                    <Label htmlFor={`button-title-${button.id}`} className="text-sm font-medium text-gray-600 mb-1">
                      Название кнопки <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`button-title-${button.id}`}
                      value={button.title}
                      onChange={(e) => updateButton(button.id, { title: e.target.value })}
                      placeholder="Введите название кнопки"
                      className="w-full"
                    />
                  </div>

                  {/* Переход к шагу */}
                  <div>
                    <Label htmlFor={`button-next-step-${button.id}`} className="text-sm font-medium text-gray-600 mb-1">
                      Переход к шагу <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`button-next-step-${button.id}`}
                      value={button.next_step || ""}
                      onChange={(e) => updateButton(button.id, { next_step: e.target.value.trim() || null })}
                      placeholder="Код следующего шага"
                      className="w-full"
                    />
                  </div>

                  {/* Код ввода */}
                  <div>
                    <Label
                      htmlFor={`button-input-code-${button.id}`}
                      className="text-sm font-medium text-gray-600 mb-1"
                    >
                      Код ввода <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`button-input-code-${button.id}`}
                      value={button.input_code}
                      onChange={(e) => updateButton(button.id, { input_code: e.target.value })}
                      placeholder="Введите код для кнопки"
                      className="w-full font-mono"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Код, который будет отправлен при нажатии кнопки (например: 1, A, yes)
                    </p>
                  </div>

                  {/* Строка */}
                  <div>
                    <Label htmlFor={`button-row-${button.id}`} className="text-sm font-medium text-gray-600 mb-1">
                      Строка
                    </Label>
                    <Input
                      id={`button-row-${button.id}`}
                      value={button.row || ""}
                      onChange={(e) => {
                        const value = e.target.value.trim()
                        updateButton(button.id, {
                          row: value === "" ? undefined : Number.parseInt(value) || 1,
                        })
                      }}
                      placeholder="По умолчанию: 1"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Номер строки для расположения кнопки. Можно оставить пустым.
                    </p>
                  </div>

                  {/* Значение для записи */}
                  <div>
                    <Label htmlFor={`button-value-${button.id}`} className="text-sm font-medium text-gray-600 mb-1">
                      Значение для записи
                    </Label>
                    <Input
                      id={`button-value-${button.id}`}
                      value={button.value || ""}
                      onChange={(e) => updateButton(button.id, { value: e.target.value })}
                      placeholder="Значение для записи в атрибут (опционально)"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Значение, которое будет записано в атрибут при выборе кнопки
                    </p>
                  </div>

                  {/* JS условие */}
                  <div>
                    <Label
                      htmlFor={`button-js-condition-${button.id}`}
                      className="text-sm font-medium text-gray-600 mb-1"
                    >
                      JS условие
                    </Label>
                    <Textarea
                      id={`button-js-condition-${button.id}`}
                      value={button.js_condition}
                      onChange={(e) => updateButton(button.id, { js_condition: e.target.value })}
                      placeholder="return true; // Условие показа кнопки"
                      className="w-full font-mono text-sm"
                      rows={2}
                    />
                    <p className="text-xs text-gray-500 mt-1">JavaScript код для условного показа кнопки</p>
                  </div>

                  {/* Добавить теги */}
                  <div>
                    <Label className="text-sm font-medium text-gray-600 mb-1">Добавить теги</Label>
                    <TagsInput
                      tags={button.add_tags || []}
                      onChange={(tags) => updateButton(button.id, { add_tags: tags })}
                      placeholder="Введите теги для добавления"
                      variant="add"
                    />
                    <p className="text-xs text-gray-500 mt-1">Теги, которые будут добавлены при нажатии кнопки</p>
                  </div>

                  {/* Удалить теги */}
                  <div>
                    <Label className="text-sm font-medium text-gray-600 mb-1">Удалить теги</Label>
                    <TagsInput
                      tags={button.remove_tags || []}
                      onChange={(tags) => updateButton(button.id, { remove_tags: tags })}
                      placeholder="Введите теги для удаления"
                      variant="remove"
                    />
                    <p className="text-xs text-gray-500 mt-1">Теги, которые будут удалены при нажатии кнопки</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {buttons.length === 0 && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-sm">Кнопки не добавлены</p>
          <p className="text-xs mt-1">Нажмите "Добавить кнопку" чтобы создать интерактивные элементы</p>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Кнопки позволяют пользователям выбирать варианты ответов. Каждая кнопка может вести к разным шагам сценария.
      </p>
    </div>
  )
}

export default ButtonEditor
