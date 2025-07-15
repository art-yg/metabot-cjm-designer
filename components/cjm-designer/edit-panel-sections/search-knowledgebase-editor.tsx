"use client"

import React from "react"
import type { CJMNode } from "@/app/cjm-editor/types"
import type { SearchKnowledgebaseNodeData } from "../nodes/search-knowledgebase-node"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface SearchKnowledgebaseEditorProps {
  node: CJMNode
  onUpdateData: (nodeId: string, newData: any) => void
}

function SearchKnowledgebaseEditor({ node, onUpdateData }: SearchKnowledgebaseEditorProps) {
  const data = node.data as SearchKnowledgebaseNodeData

  const handleField = (field: keyof SearchKnowledgebaseNodeData, value: any) => {
    onUpdateData(node.id, { [field]: value })
  }

  return (
      <div className="space-y-4">
        {/* Основные поля базы знаний */}
        <div className="border rounded p-3">
          <Label className="mb-2 block font-medium">Настройки поиска</Label>
          <div className="space-y-3">
            <div>
              <Label htmlFor="knowbase_name">База знаний <span className="text-red-500">*</span></Label>
              <Input
                id="knowbase_name"
                value={data.knowbase_name}
                onChange={(e) => handleField("knowbase_name", e.target.value)}
                placeholder="knowledge_base_name"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Имя зарегистрированной базы знаний в системе
              </p>
            </div>

            <div>
              <Label htmlFor="query_attr">Атрибут запроса <span className="text-red-500">*</span></Label>
              <Input
                id="query_attr"
                value={data.query_attr}
                onChange={(e) => handleField("query_attr", e.target.value)}
                placeholder="user_intent"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ключ атрибута, откуда берётся строка запроса (например: lead.getAttr("user_intent"))
              </p>
            </div>

            <div>
              <Label htmlFor="domain">Домен (необязательно)</Label>
              <Input
                id="domain"
                value={data.domain}
                onChange={(e) => handleField("domain", e.target.value)}
                placeholder="support, faq, docs..."
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Фильтр по домену внутри базы знаний. Оставьте пустым для поиска по всей базе.
              </p>
            </div>

            <div>
              <Label htmlFor="save_results_to_attr">Сохранить результат в <span className="text-red-500">*</span></Label>
              <Input
                id="save_results_to_attr"
                value={data.save_results_to_attr}
                onChange={(e) => handleField("save_results_to_attr", e.target.value)}
                placeholder="bestChunks"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ключ атрибута для сохранения найденного текста (строка из склеенных chunks)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="trace_enabled"
                checked={data.trace_enabled}
                onCheckedChange={(checked) => handleField("trace_enabled", !!checked)}
              />
              <Label htmlFor="trace_enabled" className="text-sm">
                Включить трассировку (отправлять найденные chunks в чат для отладки)
              </Label>
            </div>
          </div>
        </div>

        {/* Переходы */}
        <div className="border rounded p-3">
          <Label className="mb-2 block font-medium">Переходы</Label>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <Label htmlFor="next_step">
                <span className="inline-flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  Успешный поиск (next_step)
                </span>
              </Label>
              <Input
                id="next_step"
                value={data.next_step || ""}
                onChange={(e) => handleField("next_step", e.target.value.trim() || null)}
                placeholder="Код следующего шага"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                                 Переход, если найдены результаты (chunks.length &gt; 0)
              </p>
            </div>

            <div>
              <Label htmlFor="not_found_step">
                <span className="inline-flex items-center">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  Результаты не найдены (not_found_step)
                </span>
              </Label>
              <Input
                id="not_found_step"
                value={data.not_found_step || ""}
                onChange={(e) => handleField("not_found_step", e.target.value.trim() || null)}
                placeholder="Код шага при отсутствии результатов"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Переход, если поиск выполнен успешно, но результатов нет
              </p>
            </div>

            <div>
              <Label htmlFor="error_step">
                <span className="inline-flex items-center">
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                  Ошибка (error_step)
                </span>
              </Label>
              <Input
                id="error_step"
                value={data.error_step || ""}
                onChange={(e) => handleField("error_step", e.target.value.trim() || null)}
                placeholder="Код шага при ошибке"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Переход при ошибке (база не найдена, нет эмбеддингов и т.п.)
              </p>
            </div>
          </div>
        </div>

        {/* Информационный блок */}
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
          <p className="text-sm text-purple-700">
            <strong>Поиск по базе знаний</strong> выполняет семантический поиск по векторной базе.
            Запрос берётся из атрибута, результаты склеиваются в одну строку и сохраняются в указанный атрибут.
            Используется для RAG-диалогов и систем поддержки.
          </p>
        </div>
      </div>
  )
}

export default SearchKnowledgebaseEditor 