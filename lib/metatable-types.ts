// Интерфейсы для записей таблиц
export interface PromptRecord {
  id: number
  agent_name: string
  name: string
  prompt: string
}

export interface KnowledgeBaseRecord {
  id: number
  context: string
  section: string
  content: string
  embeddings?: string // Скрыто в списке, показывается только при редактировании
}

// Интерфейсы для API запросов
export interface MetaTableViewRequest {
  client_id: string
  client_key: string
  table_code: string
  filters?: Record<string, any>
  pagination?: {
    page: number
    size: number
  }
}

export interface MetaTableCrudRequest {
  client_id: string
  client_key: string
  table_code: string
  operation: 'create' | 'update' | 'delete' | 'read_one'
  id?: number
  payload?: Record<string, any>
}

// Интерфейсы для API ответов
export interface MetaTableResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  errors?: string[]
}

export interface MetaTableViewResponse {
  success: boolean
  data: any[] // Записи приходят прямо в массиве
  pagination: {
    page: number
    size: number
    count: number // total количество записей
  }
  message?: string
}

export interface MetaTableCrudResponse {
  success: boolean
  data?: {
    id?: number
    result?: any
  }
  message?: string
}

// Типы для фильтрации и пагинации
export interface TableFilters {
  search?: string
  [key: string]: any
}

export interface TablePagination {
  page: number
  size: number
}

export interface TableSortConfig {
  field: string
  direction: 'asc' | 'desc'
} 