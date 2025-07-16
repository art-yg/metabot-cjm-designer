import { loadApiSettings } from './api-settings'
import { toast } from 'react-hot-toast'
import type { 
  MetaTableViewRequest, 
  MetaTableCrudRequest, 
  MetaTableViewResponse, 
  MetaTableCrudResponse,
  TableFilters,
  TablePagination,
  PromptRecord,
  KnowledgeBaseRecord
} from './metatable-types'

export class MetaTableAPI {
  private getConfig() {
    const settings = loadApiSettings()
    return {
      baseUrl: settings.endpoint.replace(/\/$/, ''), // Убираем слэш в конце если есть
      bearerToken: settings.bearerToken,
      clientId: settings.client_id,
      clientKey: settings.client_key,
      promptsTable: settings.prompts_table,
      knowledgeBaseTable: settings.knowledge_base_table
    }
  }

  // Склеивание URL с правильным слэшем
  private buildUrl(endpoint: string, botId: string | number): string {
    const config = this.getConfig()
    const baseWithBotId = config.baseUrl.replace("{bot_id}", botId.toString())
    // Убеждаемся что между base URL и endpoint есть слэш
    return baseWithBotId + '/' + endpoint
  }

  // Проверка настроек перед выполнением запросов
  private validateConfig() {
    const config = this.getConfig()
    if (!config.clientId || !config.clientKey) {
      throw new Error('Client ID и Client Key должны быть настроены в разделе API')
    }
    return config
  }

  // Получение данных таблицы
  async viewTable(
    tableCode: string, 
    botId: string | number,
    options: { 
      filters?: TableFilters
      pagination?: TablePagination 
    } = {}
  ): Promise<MetaTableViewResponse> {
    const config = this.validateConfig()
    
    const payload: MetaTableViewRequest = {
      client_id: config.clientId,
      client_key: config.clientKey,
      table_code: tableCode,
      filters: options.filters || {},
      pagination: options.pagination || { page: 1, size: 50 }
    }

    const apiUrl = this.buildUrl('metatable/view', botId)

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${config.bearerToken}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ script_request_params: payload })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('MetaTable view error:', error)
      throw new Error(`Ошибка загрузки данных: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    }
  }

  // CRUD операции
  async crudOperation(
    tableCode: string, 
    botId: string | number,
    operation: 'create' | 'update' | 'delete' | 'read_one', 
    id?: number, 
    payload?: Record<string, any>
  ): Promise<MetaTableCrudResponse> {
    const config = this.validateConfig()
    
    const requestPayload: MetaTableCrudRequest = {
      client_id: config.clientId,
      client_key: config.clientKey,
      table_code: tableCode,
      operation,
      id,
      payload: payload || {}
    }

    const apiUrl = this.buildUrl('metatable/crud', botId)

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${config.bearerToken}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ script_request_params: requestPayload })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('MetaTable CRUD error:', error)
      throw new Error(`Ошибка выполнения операции: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    }
  }

  // === МЕТОДЫ ДЛЯ РАБОТЫ С ПРОМПТАМИ ===

  getPromptsTableName(): string {
    return this.getConfig().promptsTable
  }

  async getPrompts(botId: string | number, filters?: TableFilters, pagination?: TablePagination): Promise<MetaTableViewResponse> {
    return this.viewTable(this.getPromptsTableName(), botId, { filters, pagination })
  }

  async createPrompt(botId: string | number, prompt: Omit<PromptRecord, 'id'>): Promise<MetaTableCrudResponse> {
    return this.crudOperation(this.getPromptsTableName(), botId, 'create', undefined, prompt)
  }

  async updatePrompt(botId: string | number, id: number, prompt: Partial<Omit<PromptRecord, 'id'>>): Promise<MetaTableCrudResponse> {
    return this.crudOperation(this.getPromptsTableName(), botId, 'update', id, prompt)
  }

  async deletePrompt(botId: string | number, id: number): Promise<MetaTableCrudResponse> {
    return this.crudOperation(this.getPromptsTableName(), botId, 'delete', id)
  }

  async getPrompt(botId: string | number, id: number): Promise<MetaTableCrudResponse> {
    return this.crudOperation(this.getPromptsTableName(), botId, 'read_one', id)
  }

  // === МЕТОДЫ ДЛЯ РАБОТЫ С БАЗОЙ ЗНАНИЙ ===

  getKnowledgeBaseTableName(): string {
    return this.getConfig().knowledgeBaseTable
  }

  async getKnowledgeBase(botId: string | number, filters?: TableFilters, pagination?: TablePagination): Promise<MetaTableViewResponse> {
    return this.viewTable(this.getKnowledgeBaseTableName(), botId, { filters, pagination })
  }

  async createKnowledgeBaseRecord(botId: string | number, record: Omit<KnowledgeBaseRecord, 'id'>): Promise<MetaTableCrudResponse> {
    return this.crudOperation(this.getKnowledgeBaseTableName(), botId, 'create', undefined, record)
  }

  async updateKnowledgeBaseRecord(botId: string | number, id: number, record: Partial<Omit<KnowledgeBaseRecord, 'id'>>): Promise<MetaTableCrudResponse> {
    return this.crudOperation(this.getKnowledgeBaseTableName(), botId, 'update', id, record)
  }

  async deleteKnowledgeBaseRecord(botId: string | number, id: number): Promise<MetaTableCrudResponse> {
    return this.crudOperation(this.getKnowledgeBaseTableName(), botId, 'delete', id)
  }

  async getKnowledgeBaseRecord(botId: string | number, id: number): Promise<MetaTableCrudResponse> {
    return this.crudOperation(this.getKnowledgeBaseTableName(), botId, 'read_one', id)
  }

  // === МЕТОДЫ ВЕКТОРИЗАЦИИ ===

  async vectorizeAll(botId: string | number, tableCode?: string): Promise<any> {
    const config = this.validateConfig()
    const tableName = tableCode || this.getKnowledgeBaseTableName()
    
    const payload = {
      client_id: config.clientId,
      client_key: config.clientKey,
      table_code: tableName
    }

    const apiUrl = this.buildUrl('kb/vectorize-all', botId)

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${config.bearerToken}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ script_request_params: payload })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      toast.success('Векторизация всех записей запущена')
      return result
    } catch (error) {
      console.error('Vectorize all error:', error)
      toast.error(`Ошибка векторизации: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
      throw error
    }
  }

  async vectorizeRecord(id: number, botId: string | number, tableCode?: string): Promise<any> {
    const config = this.validateConfig()
    const tableName = tableCode || this.getKnowledgeBaseTableName()
    
    const payload = {
      client_id: config.clientId,
      client_key: config.clientKey,
      table_code: tableName,
      record_id: id
    }

    const apiUrl = this.buildUrl('kb/vectorize-one', botId)

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${config.bearerToken}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ script_request_params: payload })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      toast.success('Векторизация записи запущена')
      return result
    } catch (error) {
      console.error('Vectorize record error:', error)
      toast.error(`Ошибка векторизации записи: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
      throw error
    }
  }
}

// Экспортируем единственный экземпляр
export const metaTableAPI = new MetaTableAPI() 