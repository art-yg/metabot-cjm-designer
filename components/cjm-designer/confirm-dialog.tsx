"use client"
import { AlertTriangle, X } from "lucide-react"

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  saveText?: string
  onConfirm: () => void
  onCancel: () => void
  onSave?: () => void
  variant?: "warning" | "danger" | "info"
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  saveText,
  onConfirm,
  onCancel,
  onSave,
  variant = "warning"
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const variantStyles = {
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
      iconBg: "bg-amber-100",
      confirmButton: "bg-amber-600 hover:bg-amber-700 text-white"
    },
    danger: {
      icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
      iconBg: "bg-red-100", 
      confirmButton: "bg-red-600 hover:bg-red-700 text-white"
    },
    info: {
      icon: <AlertTriangle className="w-6 h-6 text-blue-600" />,
      iconBg: "bg-blue-100",
      confirmButton: "bg-blue-600 hover:bg-blue-700 text-white"
    }
  }

  const styles = variantStyles[variant]

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50"
      onClick={onCancel}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 overflow-hidden"
        onClick={(e: any) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${styles.iconBg}`}>
                {styles.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
            </div>
            <button
              onClick={onCancel}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-gray-600 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="px-4 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
            {/* Кнопка отмены */}
            <button
              onClick={onCancel}
              className="order-3 sm:order-1 min-w-[90px] text-sm px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {cancelText}
            </button>
            
            {/* Кнопка подтверждения */}
            <button
              onClick={onConfirm}
              className={`order-2 sm:order-2 min-w-[140px] text-sm px-4 py-2 rounded-md transition-colors ${styles.confirmButton}`}
            >
              {confirmText}
            </button>
            
            {/* Кнопка сохранить и закрыть - если есть (приоритетная) */}
            {onSave && saveText && (
              <button
                onClick={onSave}
                className="order-1 sm:order-3 min-w-[140px] text-sm px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white transition-colors"
              >
                {saveText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 