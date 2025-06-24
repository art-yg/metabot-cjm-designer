"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Channel, FormatType } from "@/lib/format-presets"
import { CHANNEL_FRIENDLY_NAMES } from "@/lib/format-presets"
import { marked } from "marked" // For Markdown to HTML conversion

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  channel: Channel
  format: FormatType
  content: string
}

// Basic BBCode to HTML (extend as needed)
function bbcodeToHtml(bbcode: string): string {
  let html = bbcode
  // Bold, Italic, Underline, Strikethrough
  html = html.replace(/\[b\](.*?)\[\/b\]/gis, "<strong>$1</strong>")
  html = html.replace(/\[i\](.*?)\[\/i\]/gis, "<em>$1</em>")
  html = html.replace(/\[u\](.*?)\[\/u\]/gis, "<u>$1</u>")
  html = html.replace(/\[s\](.*?)\[\/s\]/gis, "<s>$1</s>")
  // Links
  html = html.replace(/\[url=(.*?)\](.*?)\[\/url\]/gis, '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>')
  html = html.replace(/\[url\](.*?)\[\/url\]/gis, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
  // New lines
  html = html.replace(/\n/g, "<br />")
  return html
}

// WhatsApp "Markdown Lite" to HTML
function markdownLiteToHtml(text: string): string {
  let html = text
  // Monospace (triple backticks) - order matters, do this first
  html = html.replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
  // Bold (*text*)
  html = html.replace(/(?<!\*)\*([^*\n][\s\S]*?[^*\n])\*(?!\*)/g, "<strong>$1</strong>")
  // Italic (_text_)
  html = html.replace(/(?<!_)_([^_\n][\s\S]*?[^_\n])_(?!_)/g, "<em>$1</em>")
  // Strikethrough (~text~)
  html = html.replace(/(?<!\w)~(\S(?:[\s\S]*?\S)?)~(?![\w~])/g, "<s>$1</s>") // Avoid matching in words like `~~test~~`
  // New lines
  html = html.replace(/\n/g, "<br />")
  return html
}

function PreviewModal({ isOpen, onClose, channel, format, content }: PreviewModalProps) {
  const [renderedContent, setRenderedContent] = React.useState("")

  React.useEffect(() => {
    if (isOpen) {
      let html = ""
      try {
        switch (format) {
          case "markdown_v1":
          case "markdown_v2":
          case "custom_markdown":
            // Configure marked for GitHub Flavored Markdown, breaks for new lines
            marked.setOptions({
              gfm: true,
              breaks: true, // Convert GFM line breaks to <br>
              sanitize: false, // Assuming content is trusted as it's user-input for their bot
            })
            html = marked.parse(content) as string
            break
          case "html":
            html = content
            break
          case "vk_bbcode":
            html = bbcodeToHtml(content)
            break
          case "markdown_lite":
            html = markdownLiteToHtml(content)
            break
          default:
            html = "Unsupported format for preview."
        }
      } catch (e) {
        console.error("Error rendering content for preview:", e)
        html = `<p class="text-red-500">Error rendering preview. Check console.</p>`
      }
      setRenderedContent(html)
    }
  }, [isOpen, format, content])

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[380px] p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>
            Preview: {CHANNEL_FRIENDLY_NAMES[channel]} ({format})
          </DialogTitle>
        </DialogHeader>
        <div className="p-4">
          {/* Phone Mockup */}
          <div className="w-full max-w-sm mx-auto bg-gray-800 border-[10px] border-gray-800 rounded-[40px] shadow-xl overflow-hidden">
            <div className="h-[50px] bg-gray-800 flex items-center justify-center relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-gray-600 rounded-full"></div>
              <div className="w-20 h-4 bg-gray-700 rounded-full"></div>
            </div>
            <div className="bg-white min-h-[400px] max-h-[60vh] p-3 overflow-y-auto custom-scrollbar">
              {/* Message Bubble */}
              <div className="mb-2 flex">
                <div
                  className="bg-blue-500 text-white text-sm p-2 rounded-lg max-w-[80%] break-words"
                  dangerouslySetInnerHTML={{ __html: renderedContent }}
                />
              </div>
            </div>
            <div className="h-[30px] bg-gray-800"></div>
          </div>
        </div>
        <DialogFooter className="p-6 pt-2">
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PreviewModal
