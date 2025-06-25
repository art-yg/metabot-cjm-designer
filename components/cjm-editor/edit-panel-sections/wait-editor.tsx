"use client"
import { Input } from "@/components/ui/input"

import type { CJMNode } from "@/app/cjm-editor/types"
import type { WaitNodeData } from "@/components/cjm-editor/nodes/wait-node"

interface WaitEditorProps {
  node: CJMNode
  onUpdateData: (nodeId: string, newData: Partial<WaitNodeData>) => void
}

function WaitEditor({ node, onUpdateData }: WaitEditorProps) {
  const data = node.data as WaitNodeData

  const handleDelayChange = (field: keyof typeof data.delay, value: number) => {
    const updatedDelay = {
      ...data.delay,
      [field]: Math.max(0, value),
    }
    onUpdateData(node.id, { delay: updatedDelay })
  }

  return (
    <div className="space-y-4">
      <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
        <p className="text-sm text-orange-700 mb-2">
          <strong>Ожидание</strong> создает паузу в выполнении сценария на указанное время.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="days" className="block text-sm font-medium text-gray-600 mb-1">
            Дни:
          </label>
          <Input
            id="days"
            type="number"
            min="0"
            value={data.delay.days}
            onChange={(e) => handleDelayChange("days", Number.parseInt(e.target.value, 10) || 0)}
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor="hours" className="block text-sm font-medium text-gray-600 mb-1">
            Часы:
          </label>
          <Input
            id="hours"
            type="number"
            min="0"
            max="23"
            value={data.delay.hours}
            onChange={(e) => handleDelayChange("hours", Number.parseInt(e.target.value, 10) || 0)}
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor="minutes" className="block text-sm font-medium text-gray-600 mb-1">
            Минуты:
          </label>
          <Input
            id="minutes"
            type="number"
            min="0"
            max="59"
            value={data.delay.minutes}
            onChange={(e) => handleDelayChange("minutes", Number.parseInt(e.target.value, 10) || 0)}
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor="seconds" className="block text-sm font-medium text-gray-600 mb-1">
            Секунды:
          </label>
          <Input
            id="seconds"
            type="number"
            min="0"
            max="59"
            value={data.delay.seconds}
            onChange={(e) => handleDelayChange("seconds", Number.parseInt(e.target.value, 10) || 0)}
            className="w-full"
          />
        </div>
      </div>

      <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
        <p className="text-sm text-gray-600">
          <strong>Общее время ожидания:</strong> {data.delay.days > 0 && `${data.delay.days} дн. `}
          {data.delay.hours > 0 && `${data.delay.hours} ч. `}
          {data.delay.minutes > 0 && `${data.delay.minutes} мин. `}
          {data.delay.seconds > 0 && `${data.delay.seconds} сек.`}
          {data.delay.days === 0 &&
            data.delay.hours === 0 &&
            data.delay.minutes === 0 &&
            data.delay.seconds === 0 &&
            "0 секунд"}
        </p>
      </div>
    </div>
  )
}

export default WaitEditor
