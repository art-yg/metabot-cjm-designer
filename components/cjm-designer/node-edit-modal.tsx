"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Save, Check } from "lucide-react"
import { toast } from "react-hot-toast"
import EditorFactory from "@/components/cjm-designer/edit-panel-sections/editor-factory"
import { ConfirmDialog } from "./confirm-dialog"
import type { CJMNode, CJMNodeData } from "@/app/cjm-designer/types"
import type { MapSettings } from "@/lib/map-settings"

interface NodeEditModalProps {
  isOpen: boolean
  onClose: () => void
  node: CJMNode | null
  onUpdateData: (nodeId: string, newData: any) => void
  mapSettings: MapSettings
  checkCodeUniqueness?: (code: string, currentNodeId: string) => boolean
}

export function NodeEditModal({ 
  isOpen, 
  onClose, 
  node, 
  onUpdateData, 
  mapSettings,
  checkCodeUniqueness
}: NodeEditModalProps) {
  // Локальное состояние для редактирования
  const [localNodeData, setLocalNodeData] = useState<CJMNodeData | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // Инициализация локального состояния при открытии модального окна
  useEffect(() => {
    if (node && isOpen) {
      setLocalNodeData({ ...node.data })
      setHasChanges(false)
    }
  }, [node, isOpen])

  // Сброс состояния при закрытии
  useEffect(() => {
    if (!isOpen) {
      setLocalNodeData(null)
      setHasChanges(false)
      setIsSaving(false)
      setShowConfirmDialog(false)
    }
  }, [isOpen])

  if (!node || !isOpen || !localNodeData) return null

  // Функция для обновления локального состояния
  const handleLocalUpdate = (nodeId: string, newData: Partial<CJMNodeData>) => {
    setLocalNodeData(prev => prev ? { ...prev, ...newData } as CJMNodeData : null)
    setHasChanges(true)
  }

  // Функция сохранения
  const handleSave = async () => {
    if (!localNodeData) return

    setIsSaving(true)
    try {
      // Проверка уникальности кода, если он изменился
      if (localNodeData.code !== node.data.code) {
        if (checkCodeUniqueness && !checkCodeUniqueness(localNodeData.code, node.id)) {
          toast.error("Код должен быть уникальным")
          setIsSaving(false)
          return
        }
      }

      // Сохранение в основное состояние
      onUpdateData(node.id, localNodeData)
      setHasChanges(false)
      toast.success("Изменения сохранены")
    } catch (error) {
      toast.error("Ошибка при сохранении")
    } finally {
      setIsSaving(false)
    }
  }

  // Сохранить и закрыть
  const handleSaveAndClose = async () => {
    await handleSave()
    if (!isSaving) {
      onClose()
    }
  }

  // Закрыть с предупреждением о несохраненных изменениях
  const handleClose = () => {
    if (hasChanges) {
      setShowConfirmDialog(true)
    } else {
      onClose()
    }
  }

  // Подтверждение закрытия без сохранения
  const handleConfirmClose = () => {
    setShowConfirmDialog(false)
    onClose()
  }

  // Сохранить и закрыть из диалога
  const handleSaveAndCloseFromDialog = async () => {
    setShowConfirmDialog(false)
    await handleSaveAndClose()
  }

  // Отмена закрытия
  const handleCancelClose = () => {
    setShowConfirmDialog(false)
  }

  // Создаем временный узел для передачи в редактор
  const localNode: CJMNode = {
    ...node,
    data: localNodeData
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleClose}
    >
      <div 
        className="max-w-4xl max-h-[90vh] w-full mx-4 bg-white rounded-lg shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b bg-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">
                Редактирование: {localNodeData.title || localNodeData.code}
              </h2>
              {hasChanges && (
                <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                  Есть изменения
                </span>
              )}
            </div>
            <button
              onClick={handleClose}
              className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <EditorFactory
            node={localNode}
            onClose={onClose}
            onUpdateData={handleLocalUpdate}
            mapSettings={mapSettings}
            checkCodeUniqueness={checkCodeUniqueness}
            isModal={true}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 rounded-b-lg flex justify-between">
          <Button variant="outline" onClick={handleClose}>
            {hasChanges ? "Закрыть без сохранения" : "Закрыть"}
          </Button>
          
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="flex items-center gap-2"
            >
              <Save size={16} />
              {isSaving ? "Сохранение..." : "Сохранить"}
            </Button>
            
            <Button 
              onClick={handleSaveAndClose}
              disabled={!hasChanges || isSaving}
              className="flex items-center gap-2"
            >
              <Check size={16} />
              Сохранить и закрыть
            </Button>
          </div>
        </div>
      </div>

      {/* Диалог подтверждения */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Несохраненные изменения"
        message="У вас есть несохраненные изменения. Выберите действие:"
        confirmText="Закрыть без сохранения"
        saveText="Сохранить и закрыть"
        cancelText="Отмена"
        onConfirm={handleConfirmClose}
        onSave={handleSaveAndCloseFromDialog}
        onCancel={handleCancelClose}
        variant="warning"
      />
    </div>
  )
} 