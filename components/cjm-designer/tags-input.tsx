"use client"

import { useState, useRef, type KeyboardEvent } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface TagsInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  className?: string
  variant?: "add" | "remove"
}

function TagsInput({
  tags,
  onChange,
  placeholder = "Введите тег и нажмите Enter",
  className,
  variant = "add",
}: TagsInputProps) {
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const addTag = (tagText: string) => {
    const trimmedTag = tagText.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChange([...tags, trimmedTag])
    }
    setInputValue("")
  }

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, index) => index !== indexToRemove))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  const handleInputBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue)
    }
  }

  const tagColorClasses =
    variant === "add"
      ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
      : "bg-red-100 text-red-800 border-red-200 hover:bg-red-200"

  return (
    <div
      className={cn(
        "border border-gray-300 rounded-md p-2 min-h-[42px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500",
        className,
      )}
    >
      <div className="flex flex-wrap gap-1 items-center">
        {tags.map((tag, index) => (
          <span
            key={index}
            className={cn(
              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border transition-colors",
              tagColorClasses,
            )}
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleInputBlur}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
        />
      </div>
    </div>
  )
}

export default TagsInput
