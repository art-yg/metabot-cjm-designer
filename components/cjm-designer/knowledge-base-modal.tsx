"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Zap, 
  Loader2,
  AlertCircle 
} from "lucide-react"
import { toast } from "react-hot-toast"
import { metaTableAPI } from "@/lib/metatable-api"
import type { KnowledgeBaseRecord, TableFilters, TablePagination } from "@/lib/metatable-types"
import type { MapSettings } from "@/lib/map-settings"
import { ConfirmDialog } from "./confirm-dialog"
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea"

interface KnowledgeBaseModalProps {
  isOpen: boolean
  onClose: () => void
  mapSettings: MapSettings
}

export function KnowledgeBaseModal({ isOpen, onClose, mapSettings }: KnowledgeBaseModalProps) {
  const [records, setRecords] = useState<KnowledgeBaseRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null)
  
  // Состояния для модального окна редактирования
  const [editingRecord, setEditingRecord] = useState<KnowledgeBaseRecord | null>(null)
  const [editForm, setEditForm] = useState({ context: '', section: '', content: '' })
  
  // Состояния для диалога удаления
  const [deletingRecord, setDeletingRecord] = useState<KnowledgeBaseRecord | null>(null)
  
  // Состояние данных
  const [totalRecords, setTotalRecords] = useState(0)
  const pageSize = 100

  // Состояния для динамического tooltip
  const [tooltipContent, setTooltipContent] = useState('')
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [tooltipTimer, setTooltipTimer] = useState<NodeJS.Timeout | null>(null)

  // Автоматический resize для textarea
  const contentTextareaRef = useAutoResizeTextarea(editForm.content, 150)

  // Функция сокращения текста
  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  // Загрузка данных
  const fetchRecords = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const filters: TableFilters = {}
      if (searchTerm.trim()) {
        filters.search = searchTerm
      }

      const pagination: TablePagination = {
        page: 1,
        size: pageSize
      }

      const response = await metaTableAPI.getKnowledgeBase(mapSettings.bot_id, filters, pagination)
      
      if (response.success && response.data) {
        setRecords(response.data || [])
        setTotalRecords(response.pagination.count || 0)
      } else {
        throw new Error(response.message || 'Ошибка загрузки данных')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки')
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  // Эффекты
  useEffect(() => {
    if (isOpen) {
      fetchRecords()
    } else {
      // Очищаем tooltip при закрытии модального окна
      if (tooltipTimer) {
        clearTimeout(tooltipTimer)
        setTooltipTimer(null)
      }
      setTooltipVisible(false)
    }
  }, [isOpen])

  // Поиск с задержкой
  useEffect(() => {
    if (!isOpen) return
    
    const debounceTimer = setTimeout(() => {
      fetchRecords()
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  // Обработчики действий
  const handleEdit = (record: KnowledgeBaseRecord) => {
    setEditingRecord(record)
    setEditForm({
      context: record.context || '',
      section: record.section || '',
      content: record.content || ''
    })
  }

  const handleSaveEdit = async () => {
    if (!editingRecord) return
    
    try {
      setLoading(true)
      
      // Если id = 0, то это новая запись - создаем
      if (editingRecord.id === 0) {
        const response = await metaTableAPI.createKnowledgeBaseRecord(
          mapSettings.bot_id,
          editForm
        )
        
        if (response.success) {
          toast.success('Запись создана')
          setEditingRecord(null)
          fetchRecords()
        } else {
          throw new Error(response.message || 'Ошибка создания')
        }
      } else {
        // Иначе обновляем существующую запись
        const response = await metaTableAPI.updateKnowledgeBaseRecord(
          mapSettings.bot_id,
          editingRecord.id,
          editForm
        )
        
        if (response.success) {
          toast.success('Запись обновлена')
          setEditingRecord(null)
          fetchRecords()
        } else {
          throw new Error(response.message || 'Ошибка обновления')
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка обновления')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingRecord(null)
    setEditForm({ context: '', section: '', content: '' })
    // Очищаем tooltip при закрытии окна редактирования
    if (tooltipTimer) {
      clearTimeout(tooltipTimer)
      setTooltipTimer(null)
    }
    setTooltipVisible(false)
  }

  const handleDelete = (record: KnowledgeBaseRecord) => {
    setDeletingRecord(record)
  }

  const confirmDelete = async () => {
    console.log('confirmDelete clicked', deletingRecord)
    if (!deletingRecord) return
    
    try {
      const response = await metaTableAPI.deleteKnowledgeBaseRecord(mapSettings.bot_id, deletingRecord.id)
      if (response.success) {
        toast.success('Запись удалена')
        setDeletingRecord(null)
        fetchRecords()
      } else {
        throw new Error(response.message || 'Ошибка удаления')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка удаления')
    }
  }

  const cancelDelete = () => {
    console.log('cancelDelete clicked')
    setDeletingRecord(null)
  }

  const handleVectorizeRecord = async (record: KnowledgeBaseRecord) => {
    try {
      await metaTableAPI.vectorizeRecord(record.id, mapSettings.bot_id)
      toast.success('Запись переиндексирована')
      fetchRecords()
    } catch (err) {
      // Ошибка уже отображена в metaTableAPI
    }
  }

  const handleVectorizeAll = async () => {
    if (!confirm('Переиндексировать всю базу знаний? Это может занять много времени.')) return
    
    try {
      await metaTableAPI.vectorizeAll(mapSettings.bot_id)
      toast.success('База знаний переиндексирована')
      fetchRecords()
    } catch (err) {
      // Ошибка уже отображена в metaTableAPI
    }
  }

  const handleCreateNew = () => {
    // Создаем новую пустую запись для редактирования
    const newRecord: KnowledgeBaseRecord = {
      id: 0, // Будет создан на сервере
      context: '',
      section: '',
      content: '',
      embeddings: ''
    }
    setEditingRecord(newRecord)
  }

  // Обработчики для динамического tooltip
  const handleMouseEnter = (content: string, event: React.MouseEvent) => {
    // Очищаем предыдущий таймер если есть
    if (tooltipTimer) {
      clearTimeout(tooltipTimer)
    }
    
    // Устанавливаем задержку в 500мс перед показом
    const timer = setTimeout(() => {
      setTooltipContent(content)
      setTooltipVisible(true)
      setTooltipPosition({ x: event.clientX, y: event.clientY })
    }, 500)
    
    setTooltipTimer(timer)
  }

  const handleMouseLeave = () => {
    // Устанавливаем задержку перед скрытием tooltip'а
    const timer = setTimeout(() => {
      setTooltipVisible(false)
    }, 200)
    
    setTooltipTimer(timer)
  }

  // Обработчики для самого tooltip'а
  const handleTooltipMouseEnter = () => {
    // Отменяем скрытие tooltip'а при наведении на него
    if (tooltipTimer) {
      clearTimeout(tooltipTimer)
      setTooltipTimer(null)
    }
  }

  const handleTooltipMouseLeave = () => {
    // Скрываем tooltip при уходе мыши с него
    setTooltipVisible(false)
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    if (tooltipVisible) {
      // Получаем размеры окна для правильного позиционирования
      const x = Math.min(event.clientX + 10, window.innerWidth - 350) // 350px примерная ширина tooltip
      const y = Math.max(event.clientY - 10, 50) // Минимум 50px от верха
      setTooltipPosition({ x, y })
    }
  }

  // Очистка tooltip'а при закрытии модального окна
  const handleModalClose = () => {
    if (tooltipTimer) {
      clearTimeout(tooltipTimer)
      setTooltipTimer(null)
    }
    setTooltipVisible(false)
    onClose()
  }

  // Очистка таймеров при размонтировании компонента
  useEffect(() => {
    return () => {
      if (tooltipTimer) {
        clearTimeout(tooltipTimer)
      }
    }
  }, [tooltipTimer])

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen size={20} className="text-amber-600" />
              База знаний
              <Badge variant="secondary" className="ml-2">
                {totalRecords} записей
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {/* Панель действий */}
          <div className="flex items-center justify-between gap-4 py-3 border-b">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Поиск по домену, разделу или контенту..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm" onClick={fetchRecords} disabled={loading}>
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button onClick={handleCreateNew} size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus size={16} className="mr-1" />
                Создать
              </Button>
              <Button 
                onClick={handleVectorizeAll} 
                disabled={loading}
                size="sm" 
                variant="outline"
                className="text-orange-600 hover:text-orange-700 border-orange-200 hover:border-orange-300"
              >
                <Zap size={16} className="mr-1" />
                Переиндексировать всё
              </Button>
            </div>
          </div>

          {/* Контент */}
          <div className="flex-1 overflow-auto">
            {error ? (
              <div className="flex items-center justify-center h-32 text-red-600">
                <AlertCircle size={20} className="mr-2" />
                {error}
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 size={20} className="animate-spin mr-2" />
                Загрузка...
              </div>
            ) : (
              <>
                <table className="w-full">
                  <thead className="sticky top-0 bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-3 font-medium text-gray-600">Домен</th>
                      <th className="text-left p-3 font-medium text-gray-600">Раздел</th>
                      <th className="text-left p-3 font-medium text-gray-600">Контент</th>
                      <th className="text-left p-3 font-medium text-gray-600 w-24">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr
                        key={record.id}
                        className="border-b hover:bg-gray-50 transition-colors"
                        onMouseEnter={() => setHoveredRowId(record.id)}
                        onMouseLeave={() => setHoveredRowId(null)}
                      >
                        <td className="p-3">
                          <span className="font-medium text-sm">
                            {record.context || '-'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm text-gray-600">
                            {record.section || '-'}
                          </span>
                        </td>
                        <td className="p-3 max-w-md">
                          <div 
                            className="text-sm text-gray-700 cursor-help relative"
                            onMouseEnter={(e) => handleMouseEnter(record.content, e)}
                            onMouseLeave={handleMouseLeave}
                            onMouseMove={handleMouseMove}
                          >
                            {truncateText(record.content)}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className={`flex items-center gap-1 transition-opacity ${
                            hoveredRowId === record.id ? 'opacity-100' : 'opacity-0'
                          }`}>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(record)}
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                              title="Редактировать"
                            >
                              <Edit size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleVectorizeRecord(record)}
                              className="h-8 w-8 p-0 hover:bg-orange-50 hover:text-orange-600"
                              title="Переиндексировать"
                            >
                              <Zap size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(record)}
                              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                              title="Удалить"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {records.length === 0 && !loading && (
                  <div className="flex items-center justify-center h-32 text-gray-500">
                    <BookOpen size={20} className="mr-2" />
                    {searchTerm ? 'Записи не найдены' : 'База знаний пуста'}
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Модальное окно редактирования */}
      {editingRecord && (
        <Dialog open={!!editingRecord} onOpenChange={() => handleCancelEdit()}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingRecord?.id === 0 ? 'Создание новой записи' : 'Редактирование записи базы знаний'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Домен</label>
                <Input
                  value={editForm.context}
                  onChange={(e) => setEditForm(prev => ({ ...prev, context: e.target.value }))}
                  placeholder="Введите домен..."
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Раздел</label>
                <Input
                  value={editForm.section}
                  onChange={(e) => setEditForm(prev => ({ ...prev, section: e.target.value }))}
                  placeholder="Введите раздел..."
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Контент</label>
                <Textarea
                  ref={contentTextareaRef}
                  value={editForm.content}
                  onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Введите контент..."
                  className="min-h-[150px] resize-none"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={handleCancelEdit} disabled={loading}>
                Отмена
              </Button>
              <Button onClick={handleSaveEdit} disabled={loading}>
                {loading ? 'Сохранение...' : (editingRecord?.id === 0 ? 'Создать' : 'Сохранить')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Диалог подтверждения удаления */}
      <ConfirmDialog
        isOpen={!!deletingRecord}
        title="Удаление записи"
        message={`Вы действительно хотите удалить запись "${deletingRecord?.context}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        cancelText="Отмена"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        variant="danger"
      />

      {/* Динамический tooltip */}
      {tooltipVisible && (
        <div 
          className="fixed z-[70] bg-gray-900 text-white text-sm p-3 rounded-lg shadow-lg max-w-md whitespace-pre-wrap select-text cursor-text"
          style={{ 
            left: tooltipPosition.x, 
            top: tooltipPosition.y,
            transform: 'translate(-50%, -100%)'
          }}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        >
          {tooltipContent}
        </div>
      )}
    </>
  )
}