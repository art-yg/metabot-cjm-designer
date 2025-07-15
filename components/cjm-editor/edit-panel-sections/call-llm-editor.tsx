import React, { useState } from "react"
import type { CJMNode } from "@/app/cjm-editor/types"
import type { CallLLMNodeData } from "../nodes/call-llm-node"
import BaseEditor from "./base-editor"
import AnalyticsSection from "./analytics-section"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface CallLLMLEditorProps {
  node: CJMNode
  onUpdateData: (nodeId: string, newData: any) => void
}

function reorder<T>(arr: T[], from: number, to: number): T[] {
  const copy = [...arr]
  const [item] = copy.splice(from, 1)
  copy.splice(to, 0, item)
  return copy
}

const formatOptions = [
  { value: "none", label: "Без форматирования" },
  { value: "html", label: "HTML" },
  { value: "markdown", label: "Markdown" },
  { value: "markdownv2", label: "MarkdownV2" },
]

const CallLLMLEditor: React.FC<CallLLMLEditorProps> = ({ node, onUpdateData }) => {
  const data = node.data as CallLLMNodeData

  // --- System Prompts ---
  const handlePromptChange = (section: "start" | "final", idx: number, value: string) => {
    const prompts = [...data.system_prompts[section]]
    prompts[idx] = value
    onUpdateData(node.id, { system_prompts: { ...data.system_prompts, [section]: prompts } })
  }
  const handlePromptAdd = (section: "start" | "final") => {
    onUpdateData(node.id, { system_prompts: { ...data.system_prompts, [section]: [...data.system_prompts[section], ""] } })
  }
  const handlePromptRemove = (section: "start" | "final", idx: number) => {
    const prompts = data.system_prompts[section].filter((_, i) => i !== idx)
    onUpdateData(node.id, { system_prompts: { ...data.system_prompts, [section]: prompts } })
  }
  const handlePromptMove = (section: "start" | "final", from: number, to: number) => {
    const prompts = [...data.system_prompts[section]]
    const [item] = prompts.splice(from, 1)
    prompts.splice(to, 0, item)
    onUpdateData(node.id, { system_prompts: { ...data.system_prompts, [section]: prompts } })
  }

  // --- History ---
  const handleHistoryChange = (field: keyof CallLLMNodeData["history"], value: any) => {
    onUpdateData(node.id, { history: { ...data.history, [field]: value } })
  }

  // --- User Query ---
  const handleUserQueryChange = (field: keyof CallLLMNodeData["user_query"], value: any) => {
    onUpdateData(node.id, { user_query: { ...data.user_query, [field]: value } })
  }

  // --- Response ---
  const handleResponseChange = (field: keyof CallLLMNodeData["response"], value: any) => {
    onUpdateData(node.id, { response: { ...data.response, [field]: value } })
  }

  // --- Main fields ---
  const handleField = (field: keyof CallLLMNodeData, value: any) => {
    onUpdateData(node.id, { [field]: value })
  }

  return (
    <div className="space-y-4">
      {/* Основные поля */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Название блока</Label>
          <Input value={data.title} onChange={e => handleField("title", e.target.value)} />
        </div>
        <div>
          <Label>Имя агента</Label>
          <Input value={data.agent_name} onChange={e => handleField("agent_name", e.target.value)} />
        </div>
        <div>
          <Label>Провайдер</Label>
          <Input value={data.provider} onChange={e => handleField("provider", e.target.value)} />
        </div>
        <div>
          <Label>Модель</Label>
          <Input value={data.model} onChange={e => handleField("model", e.target.value)} />
        </div>
        <div>
          <Label>Таблица промптов</Label>
          <Input value={data.prompt_table} onChange={e => handleField("prompt_table", e.target.value)} />
        </div>
      </div>

      {/* System Prompts */}
      <div className="border rounded p-3">
        <Label className="mb-2 block">Промпты перед историей</Label>
        {data.system_prompts.start.map((prompt, idx) => (
          <div key={idx} className="flex items-center mb-1 gap-1">
            <Textarea
              value={prompt}
              onChange={e => handlePromptChange("start", idx, e.target.value)}
              placeholder="$macro, @macro, или текст"
              className="flex-1"
              rows={2}
            />
            <Button variant="ghost" size="icon" onClick={() => handlePromptMove("start", idx, idx - 1)} disabled={idx === 0}>↑</Button>
            <Button variant="ghost" size="icon" onClick={() => handlePromptMove("start", idx, idx + 1)} disabled={idx === data.system_prompts.start.length - 1}>↓</Button>
            <Button variant="destructive" size="icon" onClick={() => handlePromptRemove("start", idx)}>✕</Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => handlePromptAdd("start")}>Добавить промпт</Button>
      </div>
      <div className="border rounded p-3">
        <Label className="mb-2 block">Промпты после истории</Label>
        {data.system_prompts.final.map((prompt, idx) => (
          <div key={idx} className="flex items-center mb-1 gap-1">
            <Textarea
              value={prompt}
              onChange={e => handlePromptChange("final", idx, e.target.value)}
              placeholder="$macro, @macro, или текст"
              className="flex-1"
              rows={2}
            />
            <Button variant="ghost" size="icon" onClick={() => handlePromptMove("final", idx, idx - 1)} disabled={idx === 0}>↑</Button>
            <Button variant="ghost" size="icon" onClick={() => handlePromptMove("final", idx, idx + 1)} disabled={idx === data.system_prompts.final.length - 1}>↓</Button>
            <Button variant="destructive" size="icon" onClick={() => handlePromptRemove("final", idx)}>✕</Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => handlePromptAdd("final")}>Добавить промпт</Button>
      </div>

      {/* История */}
      <div className="border rounded p-3">
        <div className="flex items-center mb-2">
          <Checkbox checked={data.history.enabled} onCheckedChange={v => handleHistoryChange("enabled", !!v)} id="history-enabled" />
          <Label htmlFor="history-enabled" className="ml-2">Использовать историю</Label>
        </div>
        {data.history.enabled && (
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Сохранять в атрибут</Label>
              <Input value={data.history.save_to_attr} onChange={e => handleHistoryChange("save_to_attr", e.target.value)} />
            </div>
            <div>
              <Label>Макс. длина</Label>
              <Input type="number" value={data.history.max_length} min={1} onChange={e => handleHistoryChange("max_length", Number(e.target.value))} />
            </div>
            <div className="flex items-center mt-6">
              <Checkbox checked={data.history.add_to_prompts} onCheckedChange={v => handleHistoryChange("add_to_prompts", !!v)} id="history-add-to-prompts" />
              <Label htmlFor="history-add-to-prompts" className="ml-2">Включать в промпты</Label>
            </div>
          </div>
        )}
      </div>

      {/* User Query */}
      <div className="border rounded p-3">
        <div className="flex items-center mb-2">
          <Checkbox checked={data.user_query.enabled} onCheckedChange={v => handleUserQueryChange("enabled", !!v)} id="userquery-enabled" />
          <Label htmlFor="userquery-enabled" className="ml-2">Использовать UserQuery</Label>
        </div>
        {data.user_query.enabled && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Атрибут</Label>
              <Input value={data.user_query.attr} onChange={e => handleUserQueryChange("attr", e.target.value)} />
            </div>
            <div className="flex items-center mt-6">
              <Checkbox checked={data.user_query.add_to_prompts} onCheckedChange={v => handleUserQueryChange("add_to_prompts", !!v)} id="userquery-add-to-prompts" />
              <Label htmlFor="userquery-add-to-prompts" className="ml-2">Добавлять в промпты</Label>
            </div>
          </div>
        )}
      </div>

      {/* Response */}
      <div className="border rounded p-3">
        <div className="flex items-center mb-2">
          <Checkbox checked={data.response.enabled} onCheckedChange={v => handleResponseChange("enabled", !!v)} id="response-enabled" />
          <Label htmlFor="response-enabled" className="ml-2">Обрабатывать ответ</Label>
        </div>
        {data.response.enabled && (
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Сохранять в атрибут</Label>
              <Input value={data.response.save_to_attr} onChange={e => handleResponseChange("save_to_attr", e.target.value)} />
            </div>
            <div className="flex items-center mt-6">
              <Checkbox checked={data.response.display_to_user} onCheckedChange={v => handleResponseChange("display_to_user", !!v)} id="response-display-to-user" />
              <Label htmlFor="response-display-to-user" className="ml-2">Показывать в чате</Label>
            </div>
            <div>
              <Label>Формат</Label>
              <Select value={data.response.format} onValueChange={v => handleResponseChange("format", v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без форматирования</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="markdown">Markdown</SelectItem>
                  <SelectItem value="markdownv2">MarkdownV2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Остальные поля */}
      <div className="border rounded p-3 grid grid-cols-2 gap-3">
        <div className="flex items-center">
          <Checkbox checked={data.trace_enabled} onCheckedChange={v => handleField("trace_enabled", !!v)} id="trace-enabled" />
          <Label htmlFor="trace-enabled" className="ml-2">Показывать трассировку</Label>
        </div>
      </div>

      {/* Переходы и аналитика */}
      <div className="border rounded p-3">
        <Label className="mb-2 block">Переходы</Label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Успешный выход (next_step)</Label>
            <Input value={data.next_step || ""} onChange={e => handleField("next_step", e.target.value)} placeholder="Код следующего шага" />
          </div>
          <div>
            <Label>Ошибка (error_step)</Label>
            <Input value={data.error_step || ""} onChange={e => handleField("error_step", e.target.value)} placeholder="Код шага при ошибке" />
          </div>
        </div>
      </div>

      {/* Аналитика */}
      <AnalyticsSection logWayData={data.log_way_steps} onLogWayChange={logWay => onUpdateData(node.id, { log_way_steps: logWay })} />
    </div>
  )
}

export default CallLLMLEditor 