export interface ApiSettings {
  endpoint: string
  bearerToken: string
  format: string
  version: string
}

export const DEFAULT_API_SETTINGS: ApiSettings = {
  endpoint: "https://stage.metabot.dev/api/v1/bots/{bot_id}/call/cjm/import",
  bearerToken:
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI4NCIsImp0aSI6IjUyYzBlMWQ2ZjZjZDdhODNhNTdhOGRiZjIxYzc3NDNiNzAzYzFjMzNiM2VlMjAwMGE5ZTBiOWQ2MzlmMDA3YjI4YzlkNzc4Yzg0ZGNhODIzIiwiaWF0IjoxNzQ5NjM4NjcxLjQxNTk0MSwibmJmIjoxNzQ5NjM4NjcxLjQxNTk2OCwiZXhwIjoyMDY0OTk4NjcxLjQxMTIxNCwic3ViIjoiIiwic2NvcGVzIjpbIioiXX0.S5a4dL8HNZw9GpaDZENMFy9ZDIZEJz0m2c4CxuITFAQABz23C7WJzyh00GrHXKLb_zaOVIcOw7nSaBivKMl0nDVX-60UqfkfejkXFabZLiDyIjTbLT8-1hKuk2rOTC0sI8aypOJ76oEAWRI7wvpTLk3bs0640fLIa2Msw9jjvkwO3Db_yjvdZCOk-grD06bFnEqR7tEGYHvLri0ddmpsre16sICEeBwhhByKAMNeiFSG8bNjk5ARHx50kYy8XHbnnQHK5-G2yAAyhIHcoMo_D1wTsiELny00QlI0Vi5sndj1r_HJroJXruz8WwfhHWhUq331MLuFInkIokA1NitVmu4oA1rVTuCUKChrQReKgS6Gt08aeyvhOcNY8P8Jwvx78OpSvNmXAobxj-Q0A2oxgnT0DoVkfrBBRrtRiC7Epz4E2CEeAourwA8TdvvqLx9erSnr-uZl9_LKLYiIS_zZwQLrcL5eZNtIQKof1l-dFf9yeo-6xu-3xyLR35SsgA3Tnu_mq5TIjLLltP4HXhaUOlrKdXImCe5aaZ5tjdJW6iO7GbEYY2VWv21Vm8PWopcUyhA_-mHDN6MDUfbJbJjE0yiN1dWbb-iaeY7UbTuuZoXZi5PSUbRTxwkEwrZB75vcNkPKg8XqlQn6QyAWQ7sLX6tpHgmLRAwHCPswBK-mL2k",
  format: "CJM",
  version: "1.0",
}

const API_SETTINGS_STORAGE_KEY = "metabotApiSettings"

export function saveApiSettings(settings: ApiSettings): void {
  try {
    localStorage.setItem(API_SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error("Failed to save API settings:", error)
  }
}

export function loadApiSettings(): ApiSettings {
  try {
    const saved = localStorage.getItem(API_SETTINGS_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        endpoint: parsed.endpoint || DEFAULT_API_SETTINGS.endpoint,
        bearerToken: parsed.bearerToken || DEFAULT_API_SETTINGS.bearerToken,
        format: parsed.format || DEFAULT_API_SETTINGS.format,
        version: parsed.version || DEFAULT_API_SETTINGS.version,
      }
    }
  } catch (error) {
    console.error("Failed to load API settings:", error)
  }
  return DEFAULT_API_SETTINGS
}

export function validateApiSettings(settings: ApiSettings): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!settings.endpoint || settings.endpoint.trim() === "") {
    errors.push("Endpoint URL обязателен для заполнения")
  } else {
    try {
      new URL(settings.endpoint.replace("{bot_id}", "123")) // Test URL validity
    } catch {
      errors.push("Некорректный формат URL")
    }
  }

  if (!settings.bearerToken || settings.bearerToken.trim() === "") {
    errors.push("Bearer Token обязателен для заполнения")
  }

  if (!settings.format || settings.format.trim() === "") {
    errors.push("Формат обязателен для заполнения")
  }

  if (!settings.version || settings.version.trim() === "") {
    errors.push("Версия обязательна для заполнения")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
