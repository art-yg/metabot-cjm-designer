import { useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { metaTableAPI } from '@/lib/metatable-api'
import type { 
  PromptRecord, 
  KnowledgeBaseRecord, 
  TableFilters, 
  TablePagination 
} from '@/lib/metatable-types'

export function useMetaTable() {
  const [loading, setLoading] = useState(false)

  // === ПРОМПТЫ ===
  const getPrompts = useCallback(async (filters?: TableFilters, pagination?: TablePagination) => {
    setLoading(true)
    try {
      const response = await metaTableAPI.getPrompts(filters, pagination)
      return response
    } catch (error) {
      toast.error('Ошибка загрузки промптов')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const createPrompt = useCallback(async (prompt: Omit<PromptRecord, 'id'>) => {
    setLoading(true)
    try {
      const response = await metaTableAPI.createPrompt(prompt)
      if (response.success) {
        toast.success('Промпт создан')
      }
      return response
    } catch (error) {
      toast.error('Ошибка создания промпта')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const updatePrompt = useCallback(async (id: number, prompt: Partial<Omit<PromptRecord, 'id'>>) => {
    setLoading(true)
    try {
      const response = await metaTableAPI.updatePrompt(id, prompt)
      if (response.success) {
        toast.success('Промпт обновлен')
      }
      return response
    } catch (error) {
      toast.error('Ошибка обновления промпта')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // === БАЗА ЗНАНИЙ ===
  const getKnowledgeBase = useCallback(async (filters?: TableFilters, pagination?: TablePagination) => {
    setLoading(true)
    try {
      const response = await metaTableAPI.getKnowledgeBase(filters, pagination)
      return response
    } catch (error) {
      toast.error('Ошибка загрузки базы знаний')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const createKnowledgeBaseRecord = useCallback(async (record: Omit<KnowledgeBaseRecord, 'id'>) => {
    setLoading(true)
    try {
      const response = await metaTableAPI.createKnowledgeBaseRecord(record)
      if (response.success) {
        toast.success('Запись добавлена в базу знаний')
      }
      return response
    } catch (error) {
      toast.error('Ошибка создания записи')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const updateKnowledgeBaseRecord = useCallback(async (id: number, record: Partial<Omit<KnowledgeBaseRecord, 'id'>>) => {
    setLoading(true)
    try {
      const response = await metaTableAPI.updateKnowledgeBaseRecord(id, record)
      if (response.success) {
        toast.success('Запись обновлена')
      }
      return response
    } catch (error) {
      toast.error('Ошибка обновления записи')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    
    // Промпты
    getPrompts,
    createPrompt,
    updatePrompt,
    
    // База знаний
    getKnowledgeBase,
    createKnowledgeBaseRecord,
    updateKnowledgeBaseRecord,
  }
}

export default useMetaTable 