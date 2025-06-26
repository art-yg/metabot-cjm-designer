"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, ExternalLink, Plus } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import DeepLinkEditor from "./deep-link-editor"
import type { DeepLink, ChannelSettings } from "@/lib/deep-link-types"

interface DeepLinkSectionProps {
  deepLinks: DeepLink[]
  channels: ChannelSettings
  onUpdate: (deepLinks: DeepLink[]) => void
}

function DeepLinkSection({ deepLinks, channels, onUpdate }: DeepLinkSectionProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleAddDeepLink = () => {
    const newDeepLink: DeepLink = {
      code: `deeplink_${Date.now()}`,
      title: "", // Убираем title, оставляем только для совместимости
      active: true,
      parameters: [],
    }

    const updatedDeepLinks = [...deepLinks, newDeepLink]
    onUpdate(updatedDeepLinks)
    setIsOpen(true)
  }

  const handleUpdateDeepLink = (index: number, updatedDeepLink: DeepLink) => {
    const updatedDeepLinks = [...deepLinks]
    updatedDeepLinks[index] = updatedDeepLink
    onUpdate(updatedDeepLinks)
  }

  const handleDeleteDeepLink = (index: number) => {
    const updatedDeepLinks = deepLinks.filter((_, i) => i !== index)
    onUpdate(updatedDeepLinks)
  }

  return (
    <div className="space-y-3">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center p-0 h-auto font-medium text-blue-700 hover:text-blue-800"
            >
              {isOpen ? <ChevronDown size={16} className="mr-1" /> : <ChevronRight size={16} className="mr-1" />}
              <ExternalLink size={16} className="mr-2" />
              Deep Links
              {deepLinks.length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  {deepLinks.length}
                </span>
              )}
            </Button>
          </CollapsibleTrigger>

          <Button
            onClick={handleAddDeepLink}
            size="sm"
            variant="outline"
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Plus size={14} className="mr-1" />
            Добавить Deep Link
          </Button>
        </div>

        <CollapsibleContent className="space-y-2 mt-2">
          {deepLinks.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <p className="text-sm">Нет Deep Links</p>
            </div>
          ) : (
            <div className="space-y-2">
              {deepLinks.map((deepLink, index) => (
                <DeepLinkEditor
                  key={index}
                  deepLink={deepLink}
                  channels={channels}
                  onUpdate={(updatedDeepLink) => handleUpdateDeepLink(index, updatedDeepLink)}
                  onDelete={() => handleDeleteDeepLink(index)}
                />
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

export default DeepLinkSection
