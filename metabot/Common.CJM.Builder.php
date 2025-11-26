<?php

/**
 * Metabot CJM Builder (PHP Plugin)
 * 
 * Описание:
 *  Плагин для низкоуровневой сборки чат-ботов непосредственно в базе данных,
 *  минуя графический low-code интерфейс. Позволяет создавать секции, скрипты,
 *  команды, меню, связи и выполнять глубокое удаление структур. Используется
 *  как ядро при импорте JSON-сценариев и для автоматической генерации ботов
 *  из визуального редактора CJM.
 * 
 * Автор: Art Yg (Артём)
 * Версия: v1.0
 * Дата: 25 ноября 2025
 * 
 * Дополнительно:
 *  К модулю создан JS/V8 плагин Common.CJM.Builder — удобная "сахарная"
 *  обёртка, позволяющая вызывать PHP-функции из JS:
 *  
 *    const Builder = require('Common.CJM.Builder')
 * 
 *  Вместо 
 *
 *    const Builder = PHP.CommonCJMBuilder
 * 
 *  Это упрощает разработку кастомных команд, мапперов, пайплайнов и
 *  автоматических генераторов сценариев.
 */

namespace Plugins\Dynamic\Common\CJM\V8Wrapper;

use App\Modules\V8\ScriptBase;
use App\Modules\V8\Exception\UnauthotizedV8Exception;
use App\Business;
use App\Bot;
use App\Lead;
use App\Phrase;
use App\Sentence;
use App\Reference;
use App\ScriptSection;
use App\Botlog;

class Builder extends ScriptBase
{
    protected ?Business $_business = null;
    protected ?Bot $_runFromBot = null;
    protected ?Bot $_bot = null;
    protected int $_botId;
    protected ?Lead $_lead = null;
    
    public function __construct() {}
    
    public function initializeJs($params)
    {
        $this->_business = $params["business"] ?? null;
        $this->_runFromBot = $params["bot"] ?? null;
        $this->_lead = $params["lead"] ?? null;

        if ($this->_lead && $this->_lead->bot) {
            $this->_bot   = $this->_lead->bot;
        }
        
        $this->_botId = $this->_runFromBot->id;            

        $this->checkPolicy();
    }
    
    public function botInfo()
    {
        return $this->_bot;        
    }

    /**
     * Проверка политики доступа
     */
    protected function checkPolicy()
    {
        if (empty($this->_business) || !($this->_business instanceof Business)) {
            throw new UnauthotizedV8Exception();
        }

        if (empty($this->_runFromBot) || !($this->_runFromBot instanceof Bot)) {
            throw new UnauthotizedV8Exception();
        }

        if (!empty($this->_lead) && !($this->_lead instanceof Lead)) {
            throw new UnauthotizedV8Exception();
        }

        if (!empty($this->_bot) && !($this->_bot instanceof Bot)) {
            throw new UnauthotizedV8Exception();
        }

        if (!empty($this->_bot) && $this->_bot->business_id != $this->_business->id) {
            throw new UnauthotizedV8Exception();
        }
        
        if (empty($this->_botId)) {
            throw new \Exception("Bot ID is not set.");
        }                     
    }
    
    public function setBotById(int $botId): array
    {
        $bot = Bot::find($botId);
        if (!$bot) {
            return [
                'success' => false,
                'error'   => true,
                'message' => "Bot with ID $botId not found",
            ];
        }

        if (!$this->_business || $bot->business_id !== $this->_business->id) {
            return [
                'success' => false,
                'error'   => true,
                'message' => "Bot does not belong to current business",
            ];
        }

        $this->_bot = $bot;
        $this->_botId = $bot->id;
        
        return [
            'success' => true,
            'bot_id'  => $bot->id
        ];
    }    

    public function createScript(int $sectionId, string $code, string $name): array
    {
        $this->checkPolicy();    
                
        // Удаляем все связанные команды (Phrase) с этим скриптом (Sentence), а затем и сам скрипт.
        /*$oldSentence = Sentence::where('bot_id', $botId)->where('code', $code)->first();
        if ($oldSentence) {
            Phrase::where('sentence_id', $oldSentence->id)->delete();
            $oldSentence->delete();
        }*/    

        $sentence = new Sentence();
        $sentence->bot_id = $this->_botId;
        $sentence->section_id = $sectionId;
        $sentence->code = $code;
        $sentence->name = $name;
        $sentence->save();

        return [
            'success' => true,
            'id'      => $sentence->id,
            'code'    => $sentence->code
        ];
    }

    public function createCommand(
      string $scriptCode,
      string $type,
      string|array $content,
      string $commandCode = null,
      int $sort_order = null
    ): array {
        $this->checkPolicy();            
                
        // Проверка, существует ли скрипт
        $sentence = Sentence::where('bot_id', $this->_botId)
            ->where('code', $scriptCode)
            ->first();
        if (!$sentence) {
            self::logInfo("[createCommand] ❌ Script not found: $scriptCode");       
            throw new \Exception("Script with code $scriptCode not found for this bot");
            return [
                'success' => false,
                'error' => "Script with code $scriptCode not found for this bot"
            ];
        }

        $phrase = new Phrase();
        $phrase->sentence_id = $sentence->id;
        $phrase->type = $type;
        $phrase->content = is_array($content) ? json_encode($content) : $content;
        $phrase->sort_order = $sort_order ?? 0;
        $phrase->alias = $commandCode ?? \Str::uuid()->toString(); 
        $phrase->save();

        self::logInfo("[createCommand] ✅ Command created", [
            'id' => $phrase->id,
            'alias' => $phrase->alias,
            'type' => $phrase->type
        ]);

        return [
            'success' => true,
            'id'      => $phrase->id,
            'code'    => $phrase->alias
        ];
    }
    
    public function createMenuItem(
      int $scriptId,
      string $caption,
      ?string $code = null,
      ?int $sortOrder = null,
      ?int $lineNum = null,
      ?string $jsCondition = null,
      ?int $jumpScriptId  
    ): array {
        $this->checkPolicy();

        $ref = new Reference();
        $ref->sentence_id = $scriptId;
        $ref->jump_sentence_id = $jumpScriptId;
        $ref->caption = $caption;
        $ref->code = $code;
        $ref->sort_order = $sortOrder ?? 0;
        $ref->line_num = $lineNum;
        $ref->condition_script_code = $jsCondition;
        $ref->save();

        return [
            'success' => true,
            'id' => $ref->id,
            'code' => $ref->code
        ];
    }
    
    public function deleteCommand(string $scriptCode, string $commandCode): array
    {
        $this->checkPolicy(); 
        
        // Находим скрипт по коду
        $sentence = Sentence::where('bot_id', $this->_botId)
            ->where('code', $scriptCode)
            ->first();
        if (!$sentence) {
            return [
                'success' => false,
                'error'   => "Script with code $scriptCode not found for this bot"
            ];
        }

        // Пытаемся найти и удалить фразу по alias (= commandCode)
        $deleted = Phrase::where('sentence_id', $sentence->id)
            ->where('alias', $commandCode)
            ->delete();

        return [
            'success' => $deleted > 0,
            'deleted' => $deleted,
            'message' => $deleted > 0
                ? "Command $commandCode deleted from script $scriptCode"
                : "No command $commandCode found in script $scriptCode"
        ];
    }

    public function deleteScript(string $code): array
    {
        $this->checkPolicy();
        
        $script = $this->findScript($code);
        if (!$script) {
            return [
                'success' => false,
                'message' => "Script $code not found"
            ];
        }

        Phrase::where('sentence_id', $script->id)->delete();
        $script->delete();

        return [
            'success' => true,
            'message' => "Script $code deleted"
        ];
    }
    
    public function existsScript(string $code): bool {
        return Sentence::where('bot_id', $this->_botId)
            ->where('code', $code)
            ->exists();
    }
    
    public function existsCommand(int $scriptId, string $type): bool {
        return Phrase::where('sentence_id', $scriptId)
            ->where('type', $type)
            ->exists();
    }
    
    public function deleteScriptsByCodes(array $codes): void
    {
        $this->checkPolicy();

        $scripts = Sentence::where('bot_id', $this->_botId)
            ->whereIn('code', $codes)
            ->get();

        $ids = $scripts->pluck('id')->all();

        if (!empty($ids)) {
            Phrase::whereIn('sentence_id', $ids)->delete();
            Sentence::whereIn('id', $ids)->delete();
        }
    }
    
    public function findScript(string $code): ?Sentence
    {
        $this->checkPolicy();
        
        return Sentence::where('bot_id', $this->_botId)
            ->where('code', $code)
            ->first();
    }
    
    public function findCommand(string $scriptCode, string $commandAlias): ?Phrase
    {
        $this->checkPolicy();
        
        $script = $this->findScript($scriptCode);
        if (!$script) return null;

        return Phrase::where('sentence_id', $script->id)
            ->where('alias', $commandAlias)
            ->first();
    }    
    
    public function findSectionByCode(string $sectionCode): ?ScriptSection
    {
        $this->checkPolicy();
        
        return ScriptSection::where('bot_id', $this->_botId)
            ->where('name', 'like', "%$sectionCode%")
            ->first();
    }    
    
    public function createSection(string $sectionTitle): ScriptSection
    {
        $this->checkPolicy();
        
        $section = new ScriptSection();
        $section->bot_id = $this->_botId;
        $section->name = $sectionTitle;
        $section->sort_order = 0; 
        $section->save();

        return $section;
    }
    
    /* Удалить секцию по коду содержащемуся в имени */ 
    public function deleteSectionByCodeDeep(string $sectionCode): array
    {
        // Найдём секцию по коду (в name)
        $section = ScriptSection::where('bot_id', $this->_botId)
            ->where('name', 'like', "%$sectionCode%")
            ->first();

        if (!$section) {
            return [
                'success' => true,
                'message' => "Section not found for code: $sectionCode"
            ];
        }    
            
        return $this->deleteSectionByIdDeep($section->id);        
    }
        
    /* Удалить секцию по полному имени */     
    public function deleteSectionByTitleDeep(string $sectionTitle): array
    {
        // Найдём секцию по точному имени
        $section = ScriptSection::where('bot_id', $this->_botId)
            ->where('name', '=', $sectionTitle)
            ->first();

        if (!$section) {
            return [
                'success' => true,
                'message' => "Section not found for title: $sectionTitle"
            ];
        }    
            
        return $this->deleteSectionByIdDeep($section->id);              
    }
    
    /* Удалить секцию по ID */ 
    public function deleteSectionByIdDeep(int $sectionId): array
    {
        $this->checkPolicy();

        // Найдём секцию по коду (в name)
        $section = ScriptSection::where('bot_id', $this->_botId)
            ->where('id', '=', $sectionId)
            ->first();

        if (!$section) {
            return [
                'success' => true,
                'message' => "Section not found for ID: $sectionId"
            ];
        }

        // Найдём все скрипты в этой секции
        $scriptIds = Sentence::where('bot_id', $this->_botId)
            ->where('section_id', $section->id)
            ->pluck('id')
            ->toArray();

        if (!empty($scriptIds)) {
            // Удалим все фразы (Phrase) этих скриптов напрямую
            Phrase::whereIn('sentence_id', $scriptIds)->delete();

            // Удалим связи run_sentence, указывающие на эти скрипты
            Phrase::join('sentences', 'phrases.sentence_id', '=', 'sentences.id')
                ->where('sentences.bot_id', $this->_botId)
                ->where('phrases.type', 'run_sentence')
                ->whereIn('phrases.content', array_map('strval', $scriptIds))
                ->delete();

            // Удалим references внутри скриптов
            Reference::whereIn('sentence_id', $scriptIds)->delete();

            // Удалим references, которые ссылаются на эти скрипты
            Reference::join('sentences', 'references.jump_sentence_id', '=', 'sentences.id')
                ->where('sentences.bot_id', $this->_botId)
                ->whereIn('references.jump_sentence_id', $scriptIds)
                ->delete();

            // Удаляем логи для всех скриптов этой секции
            if (!empty($scriptIds)) {
                Botlog::whereIn('sentence_id', $scriptIds)->delete();
            }
            
            // Удалим сами скрипты
            Sentence::whereIn('id', $scriptIds)->delete();
        } 

        // Удалим секцию
        $section->delete();

        return [
            'success' => true,
            'message' => "Section $sectionId fully cleared and deleted"
        ];
    }
}
