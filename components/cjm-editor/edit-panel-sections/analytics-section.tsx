"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
import { PlusCircle, Trash2, BarChart3, ChevronUp, ChevronDown, AlertTriangle } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

import type { LogWayData, LogWayStep, LogWayStepType, TagAction } from "@/lib/analytics-types"
import { validateLogWayStep, getLogWayStepTypeLabel, getLogWayStepSummary } from "@/lib/analytics-types"

interface AnalyticsSectionProps {
  logWayData?: LogWayData
  onLogWayChange: (data: LogWayData | undefined) => void
}

function AnalyticsSection({ logWayData, onLogWayChange }: AnalyticsSectionProps) {
  const [isEnabled, setIsEnabled] = useState(!!(logWayData && logWayData.steps.length > 0))
  const [openItems, setOpenItems] = useState<string[]>([])

  const steps = logWayData?.steps || []

  const toggleEnabled = (enabled: boolean) => {
    setIsEnabled(enabled)
    if (enabled) {
      // Включаем - создаем первую запись если нет
      if (!logWayData || logWayData.steps.length === 0) {
        const newStep: LogWayStep = {
          id: uuidv4(),
          type: "step",
          way: "",
          step: "",
        }
        onLogWayChange({ steps: [newStep] })
        setOpenItems([`step-${newStep.id}`])
      }
    } else {
      // Выключаем - очищаем данные
      onLogWayChange(undefined)
      setOpenItems([])
    }
  }

  const addStep = () => {
    const newStep: LogWayStep = {
      id: uuidv4(),
      type: "step",
      way: "",
      step: "",
    }
    const updatedSteps = [...steps, newStep]
    onLogWayChange({ steps: updatedSteps })

    // Автоматически открываем новую запись
    setOpenItems([...openItems, `step-${newStep.id}`])
  }

  const updateStep = (index: number, field: keyof LogWayStep, value: string | TagAction) => {
    const updatedSteps = [...steps]
    updatedSteps[index] = {
      ...updatedSteps[index],
      [field]: value,
    }
    onLogWayChange({ steps: updatedSteps })
  }

  const updateStepType = (index: number, newType: LogWayStepType) => {
    const updatedSteps = [...steps]
    const currentStep = updatedSteps[index]

    // Очищаем поля, которые не относятся к новому типу
    const cleanStep: LogWayStep = {
      id: currentStep.id,
      type: newType,
      way: currentStep.way, // way сохраняем всегда
      utter: currentStep.utter, // utter сохраняем всегда (опционален)
    }

    // Добавляем поля специфичные для типа
    switch (newType) {
      case "step":
        cleanStep.step = currentStep.step || ""
        break
      case "event":
        cleanStep.event = currentStep.event || ""
        break
      case "tag":
        cleanStep.tag = currentStep.tag || ""
        cleanStep.tag_action = currentStep.tag_action || "add"
        break
      case "utter":
        // utter уже установлен выше
        break
    }

    updatedSteps[index] = cleanStep
    onLogWayChange({ steps: updatedSteps })
  }

  const removeStep = (index: number) => {
    const updatedSteps = steps.filter((_, i) => i !== index)
    onLogWayChange(updatedSteps.length > 0 ? { steps: updatedSteps } : undefined)

    if (updatedSteps.length === 0) {
      setIsEnabled(false)
    }
  }

  const moveStep = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === steps.length - 1)) {
      return
    }

    const updatedSteps = [...steps]
    const targetIndex = direction === "up" ? index - 1 : index + 1

    // Swap steps
    const temp = updatedSteps[index]
    updatedSteps[index] = updatedSteps[targetIndex]
    updatedSteps[targetIndex] = temp

    onLogWayChange({ steps: updatedSteps })
  }

  const renderStepFields = (step: LogWayStep, index: number) => {
    const validation = validateLogWayStep(step)

    return (
      <div className="space-y-3">
        <div>
          <Label htmlFor={`type-${step.id}`} className="text-xs font-medium text-gray-600">
            Тип записи <span className="text-red-500">*</span>
          </Label>
          <Select value={step.type} onValueChange={(value: LogWayStepType) => updateStepType(index, value)}>
            <SelectTrigger className="w-full h-8 text-xs">
              <SelectValue placeholder="Выберите тип" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="step">Шаг (Step)</SelectItem>
              <SelectItem value="event">Событие (Event)</SelectItem>
              <SelectItem value="tag">Тег (Tag)</SelectItem>
              <SelectItem value="utter">Высказывание (Utter)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Way - показываем всегда, обязателен только для step */}
        <div>
          <Label htmlFor={`way-${step.id}`} className="text-xs font-medium text-gray-600">
            Way (путь аналитики) {step.type === "step" && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id={`way-${step.id}`}
            value={step.way || ""}
            onChange={(e) => updateStep(index, "way", e.target.value)}
            className="h-8 text-xs"
            placeholder="e.g., bot_analytics_quiz"
          />
        </div>

        {/* Поля специфичные для типа */}
        {step.type === "step" && (
          <div>
            <Label htmlFor={`step-${step.id}`} className="text-xs font-medium text-gray-600">
              Шаг <span className="text-red-500">*</span>
            </Label>
            <Input
              id={`step-${step.id}`}
              value={step.step || ""}
              onChange={(e) => updateStep(index, "step", e.target.value)}
              className="h-8 text-xs"
              placeholder="e.g., start_quiz"
            />
          </div>
        )}

        {step.type === "event" && (
          <div>
            <Label htmlFor={`event-${step.id}`} className="text-xs font-medium text-gray-600">
              Событие <span className="text-red-500">*</span>
            </Label>
            <Input
              id={`event-${step.id}`}
              value={step.event || ""}
              onChange={(e) => updateStep(index, "event", e.target.value)}
              className="h-8 text-xs"
              placeholder="e.g., pdf_downloaded"
            />
          </div>
        )}

        {step.type === "tag" && (
          <>
            <div>
              <Label htmlFor={`tag-${step.id}`} className="text-xs font-medium text-gray-600">
                Тег <span className="text-red-500">*</span>
              </Label>
              <Input
                id={`tag-${step.id}`}
                value={step.tag || ""}
                onChange={(e) => updateStep(index, "tag", e.target.value)}
                className="h-8 text-xs"
                placeholder="e.g., hot_lead"
              />
            </div>
            <div>
              <Label htmlFor={`tag_action-${step.id}`} className="text-xs font-medium text-gray-600">
                Действие <span className="text-red-500">*</span>
              </Label>
              <Select
                value={step.tag_action || "add"}
                onValueChange={(value: TagAction) => updateStep(index, "tag_action", value)}
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Выберите действие" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Добавить (add)</SelectItem>
                  <SelectItem value="remove">Удалить (remove)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* Utter - показываем всегда, обязателен только для type === "utter" */}
        <div>
          <Label htmlFor={`utter-${step.id}`} className="text-xs font-medium text-gray-600">
            Высказывание {step.type === "utter" && <span className="text-red-500">*</span>}
          </Label>
          <Textarea
            id={`utter-${step.id}`}
            value={step.utter || ""}
            onChange={(e) => updateStep(index, "utter", e.target.value)}
            rows={2}
            className="text-xs custom-scrollbar"
            placeholder={step.type === "utter" ? "Обязательное описание" : "Опциональное описание"}
          />
        </div>

        {/* Показываем ошибки валидации */}
        {!validation.isValid && (
          <div className="p-2 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start">
              <AlertTriangle size={14} className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-red-800 mb-1">Ошибки:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {validation.errors.map((error, idx) => (
                    <li key={idx} className="text-xs text-red-700">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4 pt-4 border-t">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch id="enable-analytics" checked={isEnabled} onCheckedChange={toggleEnabled} />
          <Label htmlFor="enable-analytics" className="text-sm font-medium text-gray-700 flex items-center">
            <BarChart3 size={16} className="mr-2 text-emerald-600" />
            Записать в аналитику
          </Label>
        </div>
        {isEnabled && (
          <Button variant="outline" size="sm" onClick={addStep} className="h-8 text-xs">
            <PlusCircle size={14} className="mr-1.5" />
            Добавить запись
          </Button>
        )}
      </div>

      {isEnabled && (
        <div className="space-y-3">
          {steps.length === 0 ? (
            <div className="text-center p-4 border border-dashed border-gray-300 rounded-md">
              <BarChart3 size={24} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Нет записей аналитики. Добавьте первую запись.</p>
            </div>
          ) : (
            <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="w-full">
              {steps.map((step, index) => {
                const validation = validateLogWayStep(step)
                return (
                  <AccordionItem
                    value={`step-${step.id}`}
                    key={step.id}
                    className="border border-emerald-200 rounded-md mb-2"
                  >
                    <AccordionTrigger className="text-xs py-2 px-3 hover:no-underline bg-emerald-50 rounded-t-md">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <span className="font-medium">
                            {index + 1}. {getLogWayStepTypeLabel(step.type)}: {getLogWayStepSummary(step)}
                          </span>
                          {!validation.isValid && (
                            <AlertTriangle size={14} className="ml-2 text-red-500" title="Есть ошибки" />
                          )}
                        </div>
                        <div className="flex items-center space-x-1 mr-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              moveStep(index, "up")
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
                              moveStep(index, "down")
                            }}
                            disabled={index === steps.length - 1}
                            className="h-6 w-6"
                          >
                            <ChevronDown size={12} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeStep(index)
                            }}
                            className="h-6 w-6 text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3">{renderStepFields(step, index)}</AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          )}

          {isEnabled && steps.length > 0 && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md">
              <p className="text-xs text-emerald-700">
                <strong>Встроенная аналитика:</strong> записи будут выполнены при достижении этого шага. Записи
                выполняются в порядке сверху вниз.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AnalyticsSection
