import type { DeepLink, ChannelSettings, DeepLinkParameter } from "./deep-link-types"

export class DeepLinkGenerator {
  /**
   * Генерирует hash из кода deep link
   */
  generateHash(code: string): string {
    // Простой алгоритм генерации hash на основе кода
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let hash = ""

    // Используем код как seed для генерации
    let seed = 0
    for (let i = 0; i < code.length; i++) {
      seed += code.charCodeAt(i)
    }

    // Генерируем 16-символьный hash
    for (let i = 0; i < 16; i++) {
      seed = (seed * 9301 + 49297) % 233280
      hash += chars[Math.floor((seed / 233280) * chars.length)]
    }

    return hash
  }

  /**
   * Генерирует строку параметров из массива
   */
  private generateParametersString(parameters: DeepLinkParameter[]): string {
    if (!parameters || parameters.length === 0) return ""

    const paramString = parameters
      .filter((p) => p.key && p.value)
      .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join("&")

    return paramString ? `?${paramString}` : ""
  }

  /**
   * Генерирует URL для всех доступных каналов
   */
  generateUrls(deepLink: DeepLink, channels: ChannelSettings): Record<string, string> {
    const hash = this.generateHash(deepLink.code)
    const params = this.generateParametersString(deepLink.parameters)
    const urls: Record<string, string> = {}

    // Telegram
    if (channels.telegram_bot_name) {
      urls.telegram = `https://app.metabot24.com/deeplink/telegram/${channels.telegram_bot_name}/${hash}${params}`
    }

    // WhatsApp
    if (channels.whatsapp_phone_number) {
      urls.whatsapp = `https://app.metabot24.com/deeplink/whatsapp/${channels.whatsapp_phone_number}/${hash}${params}`
    }

    // VK
    if (channels.vk_group_name) {
      urls.vk = `https://app.metabot24.com/deeplink/vk/${channels.vk_group_name}/${hash}${params}`
    }

    // ChatWidget
    if (channels.use_chat_widget) {
      urls.chatwidget = `https://app.metabot24.com/deeplink/widget/${hash}${params}`
    }

    return urls
  }

  /**
   * Генерирует структуру для ChatWidget
   */
  generateChatWidgetStructure(deepLink: DeepLink, hash: string): object {
    const params = this.generateParametersString(deepLink.parameters)
    const paramsString = params.startsWith("?") ? params.substring(1) : params

    return {
      type: "deepLink",
      event: {
        dataset: {
          deeplink: `${hash}${paramsString ? `?${paramsString}` : ""}`,
        },
      },
      title: {
        color: "#1B1C1E",
        background: "#1B1C1E",
        text: deepLink.title,
      },
      background: "#E8F3FF",
    }
  }

  /**
   * Генерирует макрос-ссылку
   */
  generateMacroLink(code: string): string {
    return `{{ ^#${code} }}`
  }
}

export const deepLinkGenerator = new DeepLinkGenerator()
