import type { FormatType } from "./format-presets"

export interface ValidationResult {
  ok: boolean
  errors: string[]
}

// Basic validation, can be expanded
function validateMarkdown(text: string): string[] {
  const errors: string[] = []
  const boldItalicPatterns = [
    { char: "*", name: "asterisk" },
    { char: "_", name: "underscore" },
    { char: "~", name: "tilde" },
    { char: "`", name: "backtick" },
    { char: "||", name: "spoiler" },
  ]

  boldItalicPatterns.forEach((pattern) => {
    const regex = new RegExp(`\\${pattern.char}`, "g")
    const count = (text.match(regex) || []).length
    if (count % 2 !== 0) {
      errors.push(`Unclosed ${pattern.name} formatting ('${pattern.char}').`)
    }
  })

  // Check for unclosed brackets in links/images: [text](url) or ![alt](src)
  let openBrackets = 0
  let openParens = 0
  let inLinkText = false

  for (let i = 0; i < text.length; i++) {
    if (text[i] === "[" && (i === 0 || text[i - 1] !== "!")) {
      // Start of link text
      openBrackets++
      inLinkText = true
    } else if (text[i] === "]" && inLinkText) {
      openBrackets--
      if (i + 1 < text.length && text[i + 1] === "(") {
        // Expected parenthesis
      } else if (openBrackets < 0) {
        errors.push("Mismatched closing square bracket ']' for link.")
        openBrackets = 0 // Reset
      }
      inLinkText = false
    } else if (text[i] === "(" && openBrackets >= 0 && text[i - 1] === "]") {
      // Start of link URL
      openParens++
    } else if (text[i] === ")" && openParens > 0) {
      openParens--
    }
  }
  if (openBrackets > 0) errors.push("Unclosed square bracket '[' for link.")
  if (openBrackets < 0) errors.push("Mismatched closing square bracket ']' for link.") // Should be caught above but as a fallback
  if (openParens > 0) errors.push("Unclosed parenthesis '(' for link URL.")
  if (openParens < 0) errors.push("Mismatched closing parenthesis ')' for link URL.")

  // Check for unclosed preformatted blocks ```
  const preformattedBlocks = (text.match(/```/g) || []).length
  if (preformattedBlocks % 2 !== 0) {
    errors.push("Unclosed preformatted block ('```').")
  }

  return errors
}

function validateHtml(text: string): string[] {
  const errors: string[] = []
  const stack: string[] = []
  const selfClosingTags = new Set(["br", "hr", "img", "input", "meta", "link"]) // Common self-closing tags

  // Simplified regex to find tags
  const tagRegex = /<\/?([a-zA-Z0-9]+)[^>]*>/g
  let match

  while ((match = tagRegex.exec(text)) !== null) {
    const fullTag = match[0]
    const tagName = match[1].toLowerCase()

    if (fullTag.startsWith("</")) {
      // Closing tag
      if (stack.length === 0) {
        errors.push(`Unexpected closing tag: ${fullTag}. No opening tag found.`)
      } else if (stack[stack.length - 1] === tagName) {
        stack.pop()
      } else {
        errors.push(`Mismatched closing tag: ${fullTag}. Expected </${stack[stack.length - 1]}>.`)
      }
    } else if (!fullTag.endsWith("/>") && !selfClosingTags.has(tagName)) {
      // Opening tag
      stack.push(tagName)
    }
  }

  if (stack.length > 0) {
    stack.forEach((tag) => errors.push(`Unclosed HTML tag: <${tag}>.`))
  }
  return errors
}

function validateBBCode(text: string): string[] {
  const errors: string[] = []
  const tagStack: string[] = []
  // Matches [tag], [tag=value], or [/tag]
  const bbRegex = /\[(\/)?([a-zA-Z]+)(?:=[^\]]+)?\]/g
  let match

  while ((match = bbRegex.exec(text)) !== null) {
    const isClosingTag = !!match[1]
    const tagName = match[2].toLowerCase()

    if (isClosingTag) {
      if (tagStack.length === 0 || tagStack[tagStack.length - 1] !== tagName) {
        errors.push(`Mismatched or unexpected closing BBCode tag: [/${tagName}].`)
      } else {
        tagStack.pop()
      }
    } else {
      // For simplicity, not checking for self-closing BBCode tags here,
      // as common ones like [b], [i], [url] require closing.
      tagStack.push(tagName)
    }
  }

  tagStack.forEach((tag) => errors.push(`Unclosed BBCode tag: [${tag}].`))
  return errors
}

export function validateFormattedText(text: string, format: FormatType): ValidationResult {
  let errors: string[] = []

  if (!text.trim()) {
    // No errors if text is empty or whitespace
    return { ok: true, errors: [] }
  }

  switch (format) {
    case "markdown_v1":
    case "markdown_v2":
    case "markdown_lite": // WhatsApp uses a subset of Markdown
    case "custom_markdown": // ChatWidget custom markdown
      errors = validateMarkdown(text)
      break
    case "html":
      errors = validateHtml(text)
      break
    case "vk_bbcode":
      errors = validateBBCode(text)
      break
    default:
      // Should not happen if types are correct
      errors.push(`Unsupported format type for validation: ${format}`)
  }

  return {
    ok: errors.length === 0,
    errors,
  }
}
