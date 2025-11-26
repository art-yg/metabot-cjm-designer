/**
 * Metabot CJM Mapper (JS/V8 Plugin)
 *
 * Описание:
 *  JS-обёртка над PHP-плагином Builder, предназначенная для импорта
 *  JSON-сценариев, создания секций, генерации скриптов, команд, меню
 *  и построения связей между шагами воронки. Маппер выполняет логическую
 *  трансляцию компактного JSON-языка описания сценариев no-code в набор
 *  low-code команд конструктора Metabot, напрямую создавая структуры в базе данных.
 *
 *  Используется как ядро для no-code редактора CJM и AI-пайплайнов,
 *  а также для автоматизированного импорта больших схем.
 *
 * Автор: Art Yg (Артём)
 * Версия: v0.1
 * Дата: 25 ноября 2025
 *
 * Дополнительно:
 *  Данный JS-модуль использует «сахарную» V8-интеграцию:
 *
 *      const Builder = require('Common.CJM.Builder')
 *
 *  Это позволяет обращаться к PHP-классу Builder как к обычному JS-объекту,
 *  что делает возможным построение полноценного маппера, пайплайнов,
 *  генераторов команд и инструментов импорта на стороне JS.
 */

const Builder = require('Common.CJM.Builder')

class Mapper {

  constructor() {
    this.builder = Builder
  }
  
  setBotById(botId) {
    const result = this.builder.setBotById(botId)
    if (result.success) {
        this.botId = botId
    }
    return result
  }

  /**
   * Запуск импорта
   */
  runImport(botId, importFormat, importVersion, mapCode, mapTitle, steps = []) {
    const { success, message } = this.setBotById(botId)
    if (!success) throw new Error(message)
    
    const mapPrefix = `${importFormat}:${importVersion}:${mapCode}`;
    const sectionTitle = `${mapPrefix}:${mapTitle}`
    let createdScriptsCnt = 0

    // Очищаем и удаляем секцию
    this.builder.deleteSectionByCodeDeep(mapCode)    
    
    // Создаем секцию
    const section = this.builder.createSection(sectionTitle)
    const sectionId = section.id
    
    const supportedStepTypes = [
      'entry_point',
      'send_text',
      'run_custom_script',
      'log_action',
      'call_llm',
      'search_knowledgebase',
      /*'value_input',
      'run_javascript',
      'send_image',
      'send_file',
      'send_email',
      'run_trigger',
      'set_lead_status',
      'add_lead_tags',
      'remove_lead_tags',
      'nlp_detect_intent',
      'run_js_callback',
      'add_lead_contexts',
      'remove_lead_contexts',
      'forward_to_operator',
      'return_to_bot',
      'repeat_sentence',
      'stop',
      'async_api_call',
      'run_sentence',
      'wait',
      'go_to_map_entry'*/
    ]    
    
    const scriptIds = {}   // Соответствие кода и айди скрипта
    const transitions = [] // Переходы между скриптами
    const validSteps = []  // Валидные шаги схемы, которые умеем low-code'ить 
    const menuButtons = [] // Кнопки меню в скриптах
    const logWayScriptMap = {} // Аналитика 
        
    // 1. Обработка шагов схемы
    for (const [i, step] of steps.entries()) {
      if (!step.code || !step.type) {
        continue // или логгировать ошибку, но не падать
      }

      if (!supportedStepTypes.includes(step.type)) {
        continue // пропускаем неподдерживаемые команды
      }

      // Создаём скрипт с кодом как у кода команды, наполним командами на следущем шаге
      const scriptCode = `${mapPrefix}:${step.code}`;
      const script = this.builder.createScript(sectionId, scriptCode, step.name || step.code)
      createdScriptsCnt++
      scriptIds[scriptCode] = script.id

      // Запоминаем step, чтобы потом обработать в switch-case
      validSteps.push(step)
    }
    // 2. Наполняем скрипты командами
    for (const step of validSteps) {
      const scriptCode = `${mapPrefix}:${step.code}`
      const nextScriptCode = step.next_step ? `${mapPrefix}:${step.next_step}` : false
      let addDefaultExit = true // По умолчанию добавляем дефолтный выход из команды
      let loggerScriptCode = false

      // Создаем скрипт с шагами аналитики, если они есть у команды
      if (Array.isArray(step.log_way_steps) && step.log_way_steps.length > 0) {
        loggerScriptCode = `${scriptCode}_logger`
        const loggerScript = this.builder.createScript(sectionId, loggerScriptCode, `${step.code}_logger`)
        createdScriptsCnt++
        
        let innerSort = 0
        for (const logStep of step.log_way_steps) {
          const js = this._buildLoggerContent(logStep)
          this.builder.createCommand(loggerScriptCode, 'run_javascript', js, null, innerSort++)
        }
        logWayScriptMap[step.code] = loggerScriptCode
        scriptIds[loggerScriptCode] = loggerScript.id
      }           
      
      switch (step.type) {
        case 'send_text': {
          this.builder.createCommand(
            scriptCode,
            'send_text',
            step.content,
            step.code,
            0
          )
          
          //return 'xxx'
          
          // Кнопки — отложенная обработка
          if (Array.isArray(step.buttons) && step.buttons.length > 0) {
            for (const [i, btn] of step.buttons.entries()) {
              menuButtons.push({
                fromScriptCode: scriptCode,
                nextScriptCode: nextScriptCode,
                sortOrder: i,
                button: btn,
                buttons_value_target: step.buttons_value_target ?? null,
                next_step: step.next_step ?? null,
                logger_script: loggerScriptCode ?? null
              })
            }
            addDefaultExit = false // Раз есть кнопки, то дефолтный выход не нужен
          } 

          // TODO: buttons → откладываем
          // TODO: analytics → откладываем

          break
        }
          
        case 'entry_point': {
          // TODO: deep_links → откладываем
          
          break
        }

        case 'log_action': {
          this.builder.createCommand(
            scriptCode,
            'run_javascript',
            this._buildLoggerContent(step),
            null,
            1
          )

          break
        }          
          
        case 'run_custom_script': {
          this.builder.createCommand(scriptCode, 'run_javascript', this._buildCustomScriptJs(step), null, 0)   
          break
        }

        case 'call_llm': {
          this.builder.createCommand(scriptCode, 'run_js_callback', this._buildCallLLMJs(step, mapPrefix), null, 0)
          break
        }

        case 'search_knowledgebase': {
          this.builder.createCommand(scriptCode, 'run_js_callback', this._buildSearchKbJs(step, mapPrefix), null, 0)
          break
        }          
          
        default:
          break // другие типы позже
      }     
          
      // Обработка next_step (если нет кнопок)
      if (addDefaultExit) {
        // Сначала, если у шага есть логирование аналитики,
        if (loggerScriptCode) {
          // то добавляем перехд в логгер
          transitions.push({ from: scriptCode, to: loggerScriptCode })
        }
        
        // А затем, если есть следующий шаг
        if (nextScriptCode) {
          // и есть аналитика, то из логирования ведем в следующий шаг
          if (loggerScriptCode) {
            transitions.push({ from: loggerScriptCode, to: nextScriptCode })
          } else {
            // А если следующий шаг есть, но аналитики нет, просто ведем в следуюший шаг
            transitions.push({ from: scriptCode, to: nextScriptCode })
          }
        }          
      }
    }    
    
    // Добавляем кнопки в меню, если есть, и сопутствующие скрипты-обработчики клика, если нужны
    for (const item of menuButtons) {
      const { fromScriptCode, nextScriptCode, button, sortOrder, buttons_value_target, next_step, logger_script } = item
      const scriptId = scriptIds[fromScriptCode]
      if (!scriptId) continue

      let jumpScriptId = null
      let toScriptId = null
      let toScriptCode = null

      // 1. Если есть обработка по нажатию
      const hasHandler =
        buttons_value_target ||
        button.add_tags || button.remove_tags

      if (hasHandler) {
        // Создаем скрипт для обработчика нажатия по кнопке
        const handlerCode = `${fromScriptCode}_handler_${sortOrder}`
        const handlerScript = this.builder.createScript(sectionId, handlerCode, handlerCode)
        createdScriptsCnt++
        const handlerScriptId = handlerScript.id
        jumpScriptId = handlerScriptId
        
        let innerSort = 0

        // Атрибуты добавляем
        if (buttons_value_target) {
          const { scope, key } = buttons_value_target
          const value = button.value || button.title || ''
          const expr = `${scope}.setAttr("${key}", "${value}")`
          this.builder.createCommand(handlerCode, 'run_javascript', expr, null, innerSort++)
        }

        // Теги добавляем
        if (Array.isArray(button.add_tags) && button.add_tags.length > 0) {
          const tagsStr = Array.isArray(button.add_tags) ? button.add_tags.join(',') : String(button.add_tags)
          this.builder.createCommand(handlerCode, 'add_lead_tags', tagsStr, null, innerSort++)
        }

        // Теги удаляем
        if (Array.isArray(button.remove_tags) && button.remove_tags.length > 0) {
          const tagsStr = Array.isArray(button.remove_tags) ? button.remove_tags.join(',') : String(button.remove_tags)
          this.builder.createCommand(handlerCode, 'remove_lead_tags', tagsStr, null, innerSort++)
        }

        // Обработка next_step (когда есть кнопки)
        // Получаем айди скрипта куда ведем после нажатия кнопки
        if (button.next_step) {
          toScriptCode = `${mapPrefix}:${button.next_step}`
        } else if (next_step) {
          // Или переход, указанный в самое команде
          toScriptCode = nextScriptCode
        }        
        toScriptId = scriptIds[toScriptCode]
        
        // Скрипт получили куда вести
        if (toScriptId) {
          // Если логгер нужен, сперва ведем в скрипт логирования, а потом из него далее
          if (logger_script) {
            this.builder.createCommand(handlerCode, 'run_sentence', String(scriptIds[logger_script]), null, 777)
            transitions.push({ from: logger_script, to: toScriptCode })            
          } else {
            // А если логгера нет, то сразу ведем в след шаг
            this.builder.createCommand(handlerCode, 'run_sentence', String(toScriptId), null, 777)        
          }
        } 
        
      } else if (button.next_step) {
        // 2. У кнопки нет обработчика нажатия (т.е. теги и атрибуты создавать не надо),
        // но есть общий next_step выход у самой команды
        toScriptCode = `${mapPrefix}:${button.next_step}`
        toScriptId = scriptIds[toScriptCode]
        if (toScriptId) {
          // Если логгер нужен, сперва ведем в скрипт логирования, а потом из него далее
          if (logger_script) {
            jumpScriptId = scriptIds[logger_script]            
            transitions.push({ from: logger_script, to: toScriptCode })    
          } else {
            // А если логгера нет, то сразу ведем в след шаг
            jumpScriptId = toScriptId
          }
        }
      } else {
        // 3. Нет ни общего выхода, ни обработчика клика у кнопки
        // Но есть логгер аналитики 
        if (logger_script) {
          jumpScriptId = scriptIds[logger_script]  
        }          
      }

      // 3. Создаём reference (меню)
      if (jumpScriptId) {
        this.builder.createMenuItem(
          scriptId,
          button.title || '',
          button.input_code || 777,
          sortOrder,
          button.row ?? null,
          button.js_condition || null,
          jumpScriptId
        )
      }
    }

    // Склеиваем скрипты вместе, командой "выполнить скрипт"
    const transitionMap = new Map()

    for (const { from, to } of transitions) {
      const key = `${from}→${to}`
      transitionMap.set(key, { from, to }) // дубликаты будут перезаписаны
    }

    for (const { from, to } of transitionMap.values()) {
      const toScriptId = scriptIds[to]
      if (!toScriptId) continue
      // Добавляям команду перехода в конец 
      this.builder.createCommand(from, 'run_sentence', String(toScriptId), null, 777)
    }
      
    return {
      success: true,
      section_id: sectionId,
      created_scripts: createdScriptsCnt
    }
  }

  _buildLoggerContent(step) {
    // В ?? исправляю баг. У меня разные параметры для log_action и log_way_steps
    const type = step.log_type ?? step.type 
    const way = step.way || ''
    const payload = {}

    if (type === 'step') {
      if (!step.step || !step.way) {
        throw new Error(`log_action step: "step" and "way" required`)
      }
      payload.step = step.step
      payload.way = step.way
      if (step.utter) payload.utter = step.utter        
    } else if (type === 'event') {
      if (!step.event) {
        throw new Error(`log_action event: "event" required`)
      }
      payload.event = step.event
      if (step.way) payload.way = step.way
      if (step.utter) payload.utter = step.utter        
    } else if (type === 'tag') {
      if (!step.tag || !step.tag_action) {
        throw new Error(`log_action tag: "tag" and "tag_action" required`)
      }
      payload.tag = step.tag
      payload.tag_action = step.tag_action
      if (step.way) payload.way = step.way
      if (step.utter) payload.utter = step.utter    
    } else if (type === 'utter') {
      if (!step.utter) {
        throw new Error(`log_action utter: "utter" required`)
      }
      payload.utter = step.utter
      if (step.way) payload.way = step.way    
    } else {
      throw new Error(`Unsupported log_action type "${type}"`)
    }

    const json = JSON.stringify(payload)
    return `const WayLogger = require('Common.Analytics.WayLogger')
const logger = new WayLogger()
logger.logWay(${json})`
  }

  _buildCustomScriptJs(step) {
    if (!step.script_code) {
      throw new Error(`Script code is not specified for "${step.code}"`)    
    }

    return `const scriptId = bot.getScriptIdByCode("${step.script_code}")
bot.run({"script_id": scriptId})`
  }    
      
  _buildCallLLMJs(step, mapPrefix) {
    const errorScript = step.error_step ? `${mapPrefix}:${step.error_step}` : null
    const nextScript = step.next_step ? `${mapPrefix}:${step.next_step}` : null
    
    const comment = step.title || null
    const sessionName = step.code || 'default'
    const agent = step.agent_name || ''
    const provider = step.provider || 'OpenAI'
    const model = step.model || 'gpt-3.5-turbo'
    const promptTable = step.prompt_table || 'gpt_prompts'
    const nextFlow = step.next_step || ''
    const errorFlow = errorScript || 'LLM:ErrorFallback'
    const traceEnabled = step.trace_enabled ? true : false
    const format = step.response?.format || 'none'
    
    const sysStart = (step.system_prompts?.start || [])
      .map(p => `llm.addSystemPrompt(${JSON.stringify(p)})`)
      .join('\n')
    const sysFinal = (step.system_prompts?.final || [])
      .map(p => `llm.addSystemPrompt(${JSON.stringify(p)})`)
      .join('\n')

    const useHistory = step.history?.enabled
    const historyMax = step.history?.max_length || 4

    const userQuery = step.user_query?.enabled
      ? `llm.addUserQuery(lead.getAttr("${step.user_query.attr}"))`
      : ''

    let handleResponse = ''
    if (step.response?.enabled && step.response.display_to_user) {
      const format = step.response.format || 'none'
      handleResponse =
        format === 'none'
          ? `bot.sendMessage(llm.getResponseText())`
          : `llm.sendFormattedResponse("${format}")`
    }

    const pluginName = 'require' + '("Common.MetabotAI.LLMClient")'
    
    const jsCode = `// LLM Client: ${comment ? comment : ''}
const LLMClient = ${pluginName}
const llm = new LLMClient("${sessionName}", "${agent}")
llm.setPromptTable("${promptTable}", "${agent}")
llm.setProvider("${provider}")
llm.setModel("${model}")
llm.setErrorScript("${errorFlow}")
lead.setAttr("trace_on", ${traceEnabled})

${useHistory ? `llm.setHistoryMaxLength(${historyMax})` : `llm.disableHistory()`}

${sysStart}
${userQuery}
${sysFinal}

if (isFirstImmediateCall) {
  llm.prepareRequest()
  llm.sendRequest()
  return false
}

if (!llm.handleResponse()) {
  if (${traceEnabled}) bot.sendMessage("@!llm.handleResponse()@")
  return false
}

${traceEnabled ? `bot.sendMessage("Ответ от LLM: " + llm.getResponseText())` : ''}

${handleResponse}`
    
// ${nextScript ? 'bot.run({ script_code: "' + nextScript + '" })' : ''}    
    
    const payload = {
      js_code: jsCode,
      is_immediate_call: 1,
      error_message: null
    }

    return JSON.stringify(payload)    
  }

  _buildSearchKbJs(step, mapPrefix) {
    const nextScript = step.next_step ? `${mapPrefix}:${step.next_step}` : null
    const notFoundScript = step.not_found_step ? `${mapPrefix}:${step.not_found_step}` : null
    const errorScript = step.error_step ? `${mapPrefix}:${step.error_step}` : null
    
    const trace = step.trace_enabled ? '1' : '0'

    const pluginName = 'require' + '("Common.MetabotAI.KnowbaseSearch")'
    const plugin2Name = 'require' + '("Common.TelegramComponents.MenuHelper")'
    
    const jsCode =  `try { 
  const KnowbaseSearch = ${pluginName}
  const kbSearch = new KnowbaseSearch()
  const bestChunks = kbSearch.findBestChunks("${step.knowbase_name}", lead.getAttr("${step.query_attr}"), "${step.domain || ''}")
  let strBestChunks = ""
  if (bestChunks !== null && bestChunks.length > 0) {
    bestChunks.forEach((el) => { strBestChunks += ' ' + el.content })
  }
  lead.setAttr("${step.save_results_to_attr}", strBestChunks)

  if (${trace} > 0) {
    const telegramMenuHelper = ${plugin2Name}
    telegramMenuHelper.sendTelegramMessageByParts("KB Search [${step.save_results_to_attr}] = " + strBestChunks)
  }

  if (chunks && chunks.length > 0) {
    ${nextScript ? 'bot.run({ script_code: "' + nextScript + '" })' : ''}
  } else {
    ${notFoundScript ? 'bot.run({ script_code: "' + notFoundScript + '" })' : ''}
  }
} catch (e) {
  ${errorScript ? 'bot.run({ script_code: "' + errorScript + '" })' : ''}
}`
    
    const payload = {
      js_code: jsCode,
      is_immediate_call: 1,
      error_message: null
    }

    return JSON.stringify(payload)        
  }     
}
      
module.exports = { Mapper }
