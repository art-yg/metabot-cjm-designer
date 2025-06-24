export type Channel = "telegram" | "whatsapp" | "vk" | "chatwidget"

export type FormatType =
  | "markdown_v1"
  | "markdown_v2"
  | "html"
  | "vk_bbcode"
  | "markdown_lite" // For WhatsApp
  | "custom_markdown" // For ChatWidget custom markdown

export interface FormatOption {
  value: FormatType
  label: string
}

export const CHANNEL_FORMATS: Record<Channel, FormatOption[]> = {
  telegram: [
    { value: "markdown_v2", label: "MarkdownV2" },
    { value: "markdown_v1", label: "MarkdownV1 (Legacy)" },
    { value: "html", label: "HTML" },
  ],
  whatsapp: [{ value: "markdown_lite", label: "WhatsApp Formatting" }],
  vk: [{ value: "vk_bbcode", label: "VK BBCode" }],
  chatwidget: [
    { value: "html", label: "HTML" },
    { value: "custom_markdown", label: "Markdown (Custom)" },
  ],
}

export interface QuickTag {
  label: string
  value: string // e.g., "**text**" or "<b>text</b>"
  description?: string // Optional description for tooltip
}

export const QUICK_TAGS: Record<FormatType, QuickTag[]> = {
  markdown_v1: [
    { label: "Bold", value: "**текст**" },
    { label: "Italic", value: "*текст*" },
    { label: "Code", value: "`код`" },
    { label: "Link", value: "[текст ссылки](URL)" },
  ],
  markdown_v2: [
    { label: "Bold", value: "*текст*" },
    { label: "Italic", value: "_текст_" },
    { label: "Strikethrough", value: "~текст~" },
    { label: "Spoiler", value: "||текст||" },
    { label: "Code", value: "`код`" },
    { label: "Preformatted", value: "```\nкод\n```" },
    { label: "Link", value: "[текст ссылки](URL)" },
    { label: "User Link", value: "[текст](tg://user?id=USER_ID)" },
  ],
  html: [
    { label: "Bold", value: "<b>текст</b>" },
    { label: "Italic", value: "<i>текст</i>" },
    { label: "Underline", value: "<u>текст</u>" },
    { label: "Strikethrough", value: "<s>текст</s>" },
    { label: "Link", value: '<a href="URL">текст ссылки</a>' },
    { label: "Code", value: "<code>код</code>" },
    { label: "Pre", value: "<pre>текст</pre>" },
  ],
  vk_bbcode: [
    { label: "Bold", value: "[b]текст[/b]" },
    { label: "Italic", value: "[i]текст[/i]" },
    { label: "Underline", value: "[u]текст[/u]" },
    { label: "Strikethrough", value: "[s]текст[/s]" },
    { label: "Link", value: "[url=URL]текст ссылки[/url]" },
  ],
  markdown_lite: [
    // WhatsApp
    { label: "Bold", value: "*текст*" },
    { label: "Italic", value: "_текст_" },
    { label: "Strikethrough", value: "~текст~" },
    { label: "Monospace", value: "```текст```" },
  ],
  custom_markdown: [
    // Example for ChatWidget, can be similar to MarkdownV2 or simpler
    { label: "Bold", value: "**текст**" },
    { label: "Italic", value: "*текст*" },
    { label: "Link", value: "[текст ссылки](URL)" },
  ],
}

export const CHANNEL_FRIENDLY_NAMES: Record<Channel, string> = {
  telegram: "Telegram",
  whatsapp: "WhatsApp",
  vk: "VKontakte",
  chatwidget: "ChatWidget",
}
