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
    // Шаги коммуникации (первое место)
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
    
    // Команды ввода (второе место)
    {
      id: "user-input",
      title: "Ввод пользователя",
      description: "Ожидание ввода данных от пользователя",
      category: "Команды ввода",
      icon: KeyboardIcon,
      color: "bg-purple-500",
      action: () => { nodeCreators.onAddInputNode(); onClose(); }
    },
    {
      id: "custom-field",
      title: "Установить поле",
      description: "Установка значения пользовательского поля",
      category: "Команды ввода",
      icon: User,
      color: "bg-indigo-500",
      action: () => { nodeCreators.onAddCustomFieldNode(); onClose(); }
    },
    
    // Логические операторы (третье место)
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
    
    // Искусственный интеллект (четвертое место)
    {
      id: "call-llm",
      title: "Обращение к LLM",
      description: "Запрос к языковой модели ИИ",
      category: "Искусственный интеллект",
      icon: Brain,
      color: "bg-amber-700",
      action: () => { nodeCreators.onAddCallLLMNode(); onClose(); }
    },
    {
      id: "search-kb",
      title: "Поиск по базе знаний",
      description: "Поиск информации в базе знаний",
      category: "Искусственный интеллект",
      icon: BookOpen,
      color: "bg-purple-600",
      action: () => { nodeCreators.onAddSearchKnowledgebaseNode(); onClose(); }
    },
    
    // Аналитика и теги (пятое место)
    {
      id: "log-action",
      title: "Записать в аналитику",
      description: "Логирование события для аналитики",
      category: "Аналитика и теги",
      icon: BarChart,
      color: "bg-emerald-500",
      action: () => { nodeCreators.onAddLogActionNode(); onClose(); }
    },
    {
      id: "add-tags",
      title: "Добавить теги",
      description: "Добавление тегов к пользователю",
      category: "Аналитика и теги",
      icon: Tags,
      color: "bg-green-500",
      action: () => { nodeCreators.onAddTagsNode("add_tags"); onClose(); }
    },
    {
      id: "remove-tags",
      title: "Удалить теги",
      description: "Удаление тегов у пользователя",
      category: "Аналитика и теги",
      icon: Tags,
      color: "bg-red-500",
      action: () => { nodeCreators.onAddTagsNode("remove_tags"); onClose(); }
    },
    
    // Переходы и точки входа (шестое место)
    {
      id: "entry-point",
      title: "Точка входа",
      description: "Начальная точка сценария",
      category: "Переходы и точки входа",
      icon: Play,
      color: "bg-green-500",
      action: () => { nodeCreators.onAddEntryPointNode(); onClose(); }
    },
    {
      id: "go-to-map",
      title: "Переход в воронку",
      description: "Переход к другому сценарию",
      category: "Переходы и точки входа",
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

  // Правильный порядок категорий
  const categoryOrder = [
    "Шаги коммуникации",
    "Команды ввода", 
    "Логические операторы",
    "Искусственный интеллект",
    "Аналитика и теги",
    "Переходы и точки входа"
  ]

  const categories = categoryOrder.filter(cat => 
    nodeTypes.some(node => node.category === cat)
  )

  const handleClose = () => {
    setSearchTerm("")
    setSelectedCategory(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle>Добавить компонент</DialogTitle>
        </DialogHeader>
        
        {/* Поиск */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Поиск компонентов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Основной контент */}
        <div className="flex flex-1 min-h-0">
          {/* Боковая панель с категориями */}
          <div className="w-56 border-r bg-gray-50 p-3">
            <div className="space-y-1">
              <Button
                variant={selectedCategory === null ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="w-full justify-start text-left h-auto py-1.5 px-2"
              >
                <span className="text-sm">Все категории</span>
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="w-full justify-start text-left h-auto py-1.5 px-2"
                >
                  <span className="text-sm">{category}</span>
                </Button>
              ))}
            </div>
          </div>
          
          {/* Список команд */}
          <div className="flex-1 overflow-y-auto p-4">
            {selectedCategory === null ? (
              // Показать все группы
              <div className="space-y-5">
                {categoryOrder.map(category => {
                  const nodes = groupedNodes[category]
                  if (!nodes || nodes.length === 0) return null
                  
                  return (
                    <div key={category}>
                      <h3 className="text-sm font-medium text-gray-600 mb-2 border-b pb-1">
                        {category}
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        {nodes.map(node => {
                          const IconComponent = node.icon
                          return (
                            <div
                              key={node.id}
                              className="flex items-start gap-3 p-2.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm cursor-pointer transition-all group"
                              onClick={node.action}
                            >
                              <div className={`flex-shrink-0 w-9 h-9 ${node.color} rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform`}>
                                <IconComponent size={18} className="text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-gray-900 group-hover:text-gray-700">{node.title}</div>
                                <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{node.description}</div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              // Показать только выбранную категорию
              <div className="grid grid-cols-1 gap-2">
                {(groupedNodes[selectedCategory] || []).map(node => {
                  const IconComponent = node.icon
                  return (
                    <div
                      key={node.id}
                      className="flex items-start gap-3 p-2.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm cursor-pointer transition-all group"
                      onClick={node.action}
                    >
                      <div className={`flex-shrink-0 w-9 h-9 ${node.color} rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform`}>
                        <IconComponent size={18} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 group-hover:text-gray-700">{node.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{node.description}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 