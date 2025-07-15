"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Download, Upload } from "lucide-react"
import { toast } from "react-hot-toast"

interface JsonModalProps {
  isOpen: boolean
  onClose: () => void
  initialJson: string
  onImport: (jsonString: string) => void
}

function JsonModal({ isOpen, onClose, initialJson, onImport }: JsonModalProps) {
  const [jsonContent, setJsonContent] = useState(initialJson)
  const [error, setError] = useState<string | null>(null)

  React.useEffect(() => {
    if (isOpen) {
      setJsonContent(initialJson)
      setError(null)
    }
  }, [isOpen, initialJson])

  const handleImport = () => {
    try {
      setError(null)
      onImport(jsonContent)
      toast.success("JSON imported successfully!")
      onClose()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to import JSON"
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jsonContent)
      toast.success("JSON copied to clipboard!")
    } catch (err) {
      toast.error("Failed to copy to clipboard")
    }
  }

  const handleDownload = () => {
    try {
      const blob = new Blob([jsonContent], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "cjm-schema.json"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success("JSON file downloaded!")
    } catch (err) {
      toast.error("Failed to download file")
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setJsonContent(content)
        setError(null)
      }
      reader.onerror = () => {
        toast.error("Failed to read file")
      }
      reader.readAsText(file)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Export / Import JSON Schema</DialogTitle>
          <DialogDescription>
            Export your current schema to JSON format or import a JSON schema to replace the current flow.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4 min-h-0">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
              <Copy size={16} className="mr-2" />
              Copy to Clipboard
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download size={16} className="mr-2" />
              Download JSON
            </Button>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="json-file-input"
              />
              <Button variant="outline" size="sm" asChild>
                <label htmlFor="json-file-input" className="cursor-pointer">
                  <Upload size={16} className="mr-2" />
                  Upload JSON File
                </label>
              </Button>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <label htmlFor="json-textarea" className="text-sm font-medium text-gray-700 mb-2">
              JSON Schema:
            </label>
            <Textarea
              id="json-textarea"
              value={jsonContent}
              onChange={(e) => {
                setJsonContent(e.target.value)
                setError(null)
              }}
              className="flex-1 min-h-0 font-mono text-sm custom-scrollbar resize-none"
              placeholder="Paste your JSON schema here..."
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600 font-medium">Import Error:</p>
              <p className="text-sm text-red-500 mt-1">{error}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleImport} disabled={!jsonContent.trim()}>
            Import Schema
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default JsonModal
