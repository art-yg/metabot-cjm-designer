"use client"
import { useState } from "react"
import { 
  Search, 
  MousePointer, 
  MessageSquare, 
  KeyboardIcon, 
  Clock, 
  Code, 
  Tags, 
  User, 
  BarChart, 
  Brain, 
  BookOpen, 
  Split, 
  Shuffle, 
  Play, 
  Target 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface NodeType {
  id: string
  title: string
  description: string
  category: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  color: string
  action: () => void
}

interface AddNodePopoverProps {
  isOpen: boolean
  onClose: () => void
  nodeCreators: {
    onAddSendTextNode: () => void
    onAddInputNode: () => void
    onAddRunScriptNode: () => void
    onAddEntryPointNode: () => void
    onAddGoToMapEntryNode: () => void
    onAddWaitNode: () => void
    onAddTagsNode: (tagType: "add_tags" | "remove_tags") => void
    onAddCustomFieldNode: () => void
    onAddIfElseNode: () => void
    onAddSwitchNode: () => void
    onAddLogActionNode: () => void
    onAddCallLLMNode: () => void
    onAddSearchKnowledgebaseNode: () => void
  }
}

export function AddNodePopover({ isOpen, onClose, nodeCreators }: AddNodePopoverProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const nodeTypes: NodeType[] = [
    // Логические операторы
    {
      id: "if-else",
      title: "IF / ELSE",
      description: "Условное ветвление на основе проверки условий",
      category: "Логические операторы",
      icon: Split,
      color: "bg-yellow-500",
      action: () => { nodeCreators.onAddIfElseNode(); onClose(); }
    },
    {
      id: "switch",
      title: "SWITCH",
      description: "Множественное ветвление по значению переменной",
      category: "Логические операторы",
      icon: Shuffle,
      color: "bg-blue-400",
      action: () => { nodeCreators.onAddSwitchNode(); onClose(); }
    },
    
    // Шаги коммуникации
    {
      id: "send-text",
      title: "Отправить текст",
      description: "Отправка текстового сообщения пользователю",
      category: "Шаги коммуникации",
      icon: MessageSquare,
      color: "bg-blue-500",
      action: () => { nodeCreators.onAddSendTextNode(); onClose(); }
    },
    {
      id: "user-input",
      title: "Ввод пользователя",
      description: "Ожидание ввода данных от пользователя",
      category: "Шаги коммуникации",
      icon: KeyboardIcon,
      color: "bg-purple-500",
      action: () => { nodeCreators.onAddInputNode(); onClose(); }
    },
    {
      id: "wait",
      title: "Ожидание",
      description: "Пауза в выполнении сценария",
      category: "Шаги коммуникации",
      icon: Clock,
      color: "bg-orange-500",
      action: () => { nodeCreators.onAddWaitNode(); onClose(); }
    },
    {
      id: "run-script",
      title: "Запустить скрипт",
      description: "Выполнение пользовательского JavaScript кода",
      category: "Шаги коммуникации",
      icon: Code,
      color: "bg-amber-600",
      action: () => { nodeCreators.onAddRunScriptNode(); onClose(); }
    },
    {
      id: "add-tags",
      title: "Добавить теги",
      description: "Добавление тегов к пользователю",
      category: "Шаги коммуникации",
      icon: Tags,
      color: "bg-green-500",
      action: () => { nodeCreators.onAddTagsNode("add_tags"); onClose(); }
    },
    {
      id: "remove-tags",
      title: "Удалить теги",
      description: "Удаление тегов у пользователя",
      category: "Шаги коммуникации",
      icon: Tags,
      color: "bg-red-500",
      action: () => { nodeCreators.onAddTagsNode("remove_tags"); onClose(); }
    },
    {
      id: "custom-field",
      title: "Установить поле",
      description: "Установка значения пользовательского поля",
      category: "Шаги коммуникации",
      icon: User,
      color: "bg-indigo-500",
      action: () => { nodeCreators.onAddCustomFieldNode(); onClose(); }
    },
    {
      id: "log-action",
      title: "Записать в аналитику",
      description: "Логирование события для аналитики",
      category: "Шаги коммуникации",
      icon: BarChart,
      color: "bg-emerald-500",
      action: () => { nodeCreators.onAddLogActionNode(); onClose(); }
    },
    {
      id: "call-llm",
      title: "Обращение к LLM",
      description: "Запрос к языковой модели ИИ",
      category: "Шаги коммуникации",
      icon: Brain,
      color: "bg-amber-700",
      action: () => { nodeCreators.onAddCallLLMNode(); onClose(); }
    },
    {
      id: "search-kb",
      title: "Поиск по базе знаний",
      description: "Поиск информации в базе знаний",
      category: "Шаги коммуникации",
      icon: BookOpen,
      color: "bg-purple-600",
      action: () => { nodeCreators.onAddSearchKnowledgebaseNode(); onClose(); }
    },
    
    // Системные команды
    {
      id: "entry-point",
      title: "Точка входа",
      description: "Начальная точка сценария",
      category: "Системные команды",
      icon: Play,
      color: "bg-green-500",
      action: () => { nodeCreators.onAddEntryPointNode(); onClose(); }
    },
    {
      id: "go-to-map",
      title: "Переход в воронку",
      description: "Переход к другому сценарию",
      category: "Системные команды",
      icon: Target,
      color: "bg-purple-500",
      action: () => { nodeCreators.onAddGoToMapEntryNode(); onClose(); }
    },
  ]

  const filteredNodes = nodeTypes.filter(node => {
    const matchesSearch = node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         node.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === null || node.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const groupedNodes = filteredNodes.reduce((acc, node) => {
    if (!acc[node.category]) {
      acc[node.category] = []
    }
    acc[node.category].push(node)
    return acc
  }, {} as Record<string, NodeType[]>)

  const categories = Array.from(new Set(nodeTypes.map(node => node.category)))

  const handleClose = () => {
    setSearchTerm("")
    setSelectedCategory(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Добавить компонент</DialogTitle>
        </DialogHeader>
        
        {/* Фильтры по категориям */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="h-8"
          >
            Все
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="h-8 text-xs"
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Поиск компонентов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-6">
          {Object.entries(groupedNodes).map(([category, nodes]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-gray-600 mb-3 border-b pb-1">
                {category}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {nodes.map(node => {
                  const IconComponent = node.icon
                  return (
                    <div
                      key={node.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm cursor-pointer transition-all group"
                      onClick={node.action}
                    >
                      <div className={`flex-shrink-0 w-10 h-10 ${node.color} rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform`}>
                        <IconComponent size={20} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 group-hover:text-gray-700">{node.title}</div>
                        <div className="text-xs text-gray-500 mt-1 leading-relaxed">{node.description}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
} 