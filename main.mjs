/**
 * @typedef {import('../../../../../src/decl/charAPI.ts').CharAPI_t} CharAPI_t
 * @typedef {import('../../../../../src/decl/charAPI.ts').charInit_t} charInit_t
 * @typedef {import('../../../../../src/public/parts/shells/chat/decl/chatLog.ts').chatReplyRequest_t} chatReplyRequest_t
 * @typedef {import('../../../../../src/public/parts/shells/chat/decl/chatLog.ts').chatReply_t} chatReply_t
 * @typedef {import('../../../../../src/public/parts/shells/chat/decl/chatLog.ts').chatLogEntry_t} chatLogEntry_t
 * @typedef {import('../../../../../src/public/parts/shells/chat/decl/chatLog.ts').CharReplyPreviewUpdater_t} CharReplyPreviewUpdater_t
 */

import { buildPromptStruct } from '../../../../../src/public/parts/shells/chat/src/prompt_struct/index.mjs'
import { loadPart } from '../../../../../src/server/parts_loader.mjs'

/** @type {import('../../../../../src/decl/AIsource.ts').AIsource_t} */
let AIsource = null

/** @type {string} */
let username = ''

/**
 * 从请求中取出语言主标签。
 * @param {chatReplyRequest_t} arg - 聊天回复请求。
 * @returns {string} 语言主标签，缺省为 en。
 */
function localeKey(arg) {
	return arg.locales?.[0]?.split('-')[0] || 'en'
}

const greetings = {
	zh: { content: '您好！我是daisyUI助手，很高兴为您服务。' },
	en: { content: 'Hello! I am the daisyUI Helper, nice to meet you.' },
	es: { content: '¡Hola! Soy el asistente de daisyUI, encantado de ayudarle.' },
	fr: { content: 'Bonjour ! Je suis l\'assistant daisyUI, ravi de vous aider.' },
	de: { content: 'Hallo! Ich bin der daisyUI-Helfer, freut mich, Ihnen zu helfen.' },
	ja: { content: 'こんにちは！daisyUIヘルパーです。お役に立てて嬉しいです。' },
	ko: { content: '안녕하세요! daisyUI 도우미입니다. 도와드릴 수 있어서 기쁩니다.' },
	ru: { content: 'Здравствуйте! Я помощник daisyUI, рад помочь вам.' },
	pt: { content: 'Olá! Eu sou o assistente daisyUI, prazer em ajudar.' },
	it: { content: 'Ciao! Sono l\'assistente daisyUI, lieto di aiutarla.' },
	ar: { content: 'مرحباً! أنا مساعد ديزي يو آي، سعيد بمساعدتك.' },
	hi: { content: 'नमस्ते! मैं डेज़ीयूआई सहायक हूँ, आपकी मदद करके खुशी हुई।' },
}

const groupGreetings = {
	zh: { content: '大家好！我是daisyUI助手，可以在群里帮助大家解决daisyUI相关的问题。' },
	en: { content: 'Hello everyone! I am the daisyUI Helper, I can help you with daisyUI related questions in the group.' },
	es: { content: '¡Hola a todos! Soy el asistente de daisyUI, puedo ayudarles con preguntas relacionadas con daisyUI en el grupo.' },
	fr: { content: 'Bonjour à tous ! Je suis l\'assistant daisyUI, je peux vous aider avec les questions relatives à daisyUI dans le groupe.' },
	de: { content: 'Hallo zusammen! Ich bin der daisyUI-Helfer, ich kann Ihnen bei Fragen zu daisyUI in der Gruppe helfen.' },
	ja: { content: '皆さん、こんにちは！daisyUIヘルパーです。グループ内でdaisyUIに関する質問にお答えできます。' },
	ko: { content: '여러분 안녕하세요! 저는 daisyUI 도우미입니다. 그룹에서 daisyUI 관련 질문에 대해 도움을 드릴 수 있습니다.' },
	ru: { content: 'Всем привет! Я помощник daisyUI, могу помочь вам с вопросами по daisyUI в группе.' },
	pt: { content: 'Olá a todos! Eu sou o assistente daisyUI, posso ajudá-los com questões relacionadas ao daisyUI no grupo.' },
	it: { content: 'Ciao a tutti! Sono l\'assistente daisyUI, posso aiutarvi con domande relative a daisyUI nel gruppo.' },
	ar: { content: 'مرحباً بالجميع! أنا مساعد ديزي يو آي، يمكنني مساعدتكم في حل المشكلات المتعلقة بديزي يو آي في المجموعة.' },
	hi: { content: 'नमस्ते सब लोग! मैं डेज़ीयूआई सहायक हूँ, मैं समूह में डेज़ीयूआई से संबंधित प्रश्नों में आपकी मदद कर सकता हूँ।' },
}

/** @type {CharAPI_t} */
export default {
	info: {
		'zh-CN': {
			name: 'daisyUI助手', // 角色的名字
			avatar: 'https://daisyui.com/favicon.ico', // 角色的头像
			description: 'daisyUI开发助手，提供代码示例和问题解答。', // 角色的简短介绍
			description_markdown: `\
# daisyUI助手

一个帮助你使用daisyUI快速构建页面的助手。

*   提供daisyUI组件的代码示例
*   解答daisyUI相关问题
*   支持**中文、英文、西班牙语、法语、德语、日语、韩语、俄语、葡萄牙语和意大利语**
`, // 角色的详细介绍，支持Markdown语法
			version: '1.0.0', // 角色的版本号
			author: 'steve02081504 & ZL-31 & Pouya 🌼', // 角色的作者
			home_page: 'https://daisyui.com',
			issue_page: 'https://github.com/steve02081504/daisyUI_helper/issues',
			tags: ['daisyUI', '前端开发', '助手'], // 角色的标签
		},
		'en-US': {
			name: 'daisyUI Helper',
			avatar: 'https://daisyui.com/favicon.ico',
			description: 'daisyUI development assistant, providing code examples and answers.',
			description_markdown: `\
# daisyUI Helper

An assistant to help you build pages quickly with daisyUI.

*   Provides code examples for daisyUI components
*   Answers daisyUI related questions
*   Supports **English, Chinese, Spanish, French, German, Japanese, Korean, Russian, Portuguese, and Italian**
`,
			version: '1.0.0',
			author: 'steve02081504 & ZL-31 & Pouya 🌼',
			home_page: 'https://daisyui.com',
			issue_page: 'https://github.com/steve02081504/daisyUI_helper/issues',
			tags: ['daisyUI', 'Front-end Development', 'Assistant'],
		},
		'es-ES': { // 西班牙语
			name: 'Ayudante de daisyUI',
			avatar: 'https://daisyui.com/favicon.ico',
			description: 'Asistente de desarrollo de daisyUI, proporciona ejemplos de código y respuestas a preguntas.',
			description_markdown: `\
# Ayudante de daisyUI

Un asistente para ayudarte a construir páginas rápidamente con daisyUI.

*   Proporciona ejemplos de código para componentes de daisyUI
*   Responde preguntas relacionadas con daisyUI
*   Soporta **español, inglés, chino, francés, alemán, japonés, coreano, ruso, portugués e italiano**
`,
			version: '1.0.0',
			author: 'steve02081504 & ZL-31 & Pouya 🌼',
			home_page: 'https://daisyui.com',
			issue_page: 'https://github.com/steve02081504/daisyUI_helper/issues',
			tags: ['daisyUI', 'Desarrollo Front-end', 'Asistente'],
		},
		'fr-FR': { // 法语
			name: 'Assistant daisyUI',
			avatar: 'https://daisyui.com/favicon.ico',
			description: 'Assistant de développement daisyUI, fournissant des exemples de code et des réponses aux questions.',
			description_markdown: `\
# Assistant daisyUI

Un assistant pour vous aider à construire des pages rapidement avec daisyUI.

*   Fournit des exemples de code pour les composants daisyUI
*   Répond aux questions relatives à daisyUI
*   Supporte **français, anglais, chinois, espagnol, allemand, japonais, coréen, russe, portugais et italien**
`,
			version: '1.0.0',
			author: 'steve02081504 & ZL-31 & Pouya 🌼',
			home_page: 'https://daisyui.com',
			issue_page: 'https://github.com/steve02081504/daisyUI_helper/issues',
			tags: ['daisyUI', 'Développement Front-end', 'Assistant'],
		},
		'de-DE': { // 德语
			name: 'daisyUI Helfer',
			avatar: 'https://daisyui.com/favicon.ico',
			description: 'daisyUI-Entwicklungsassistent, der Codebeispiele und Antworten liefert.',
			description_markdown: `\
# daisyUI Helfer

Ein Assistent, der Ihnen hilft, schnell Seiten mit daisyUI zu erstellen.

*   Bietet Codebeispiele für daisyUI-Komponenten
*   Beantwortet Fragen zu daisyUI
*   Unterstützt **Deutsch, Englisch, Chinesisch, Spanisch, Französisch, Japanisch, Koreanisch, Russisch, Portugiesisch und Italienisch**
`,
			version: '1.0.0',
			author: 'steve02081504 & ZL-31 & Pouya 🌼',
			home_page: 'https://daisyui.com',
			issue_page: 'https://github.com/steve02081504/daisyUI_helper/issues',
			tags: ['daisyUI', 'Frontend-Entwicklung', 'Assistent'],
		},
		'ja-JP': { // 日语
			name: 'daisyUIヘルパー',
			avatar: 'https://daisyui.com/favicon.ico',
			description: 'daisyUI開発アシスタント、コード例と質問への回答を提供します。',
			description_markdown: `\
# daisyUIヘルパー

daisyUIで素早くページを構築するのに役立つアシスタント。

*   daisyUIコンポーネントのコード例を提供
*   daisyUI関連の質問に回答
*   **日本語、英語、中国語、スペイン語、フランス語、ドイツ語、韓国語、ロシア語、ポルトガル語、イタリア語**をサポート
`,
			version: '1.0.0',
			author: 'steve02081504 & ZL-31 & Pouya 🌼',
			home_page: 'https://daisyui.com',
			issue_page: 'https://github.com/steve02081504/daisyUI_helper/issues',
			tags: ['daisyUI', 'フロントエンド開発', 'アシスタント'],
		},
		'ko-KR': { // 韩语
			name: 'daisyUI 도우미',
			avatar: 'https://daisyui.com/favicon.ico',
			description: 'daisyUI 개발 도우미, 코드 예제 및 질문 답변을 제공합니다.',
			description_markdown: `\
# daisyUI 도우미

daisyUI를 사용하여 페이지를 빠르게 구축하도록 돕는 도우미입니다.

*   daisyUI 컴포넌트의 코드 예제 제공
*   daisyUI 관련 질문에 답변
*   **한국어, 영어, 중국어, 스페인어, 프랑스어, 독일어, 일본어, 러시아어, 포르투갈어, 이탈리아어** 지원
`,
			version: '1.0.0',
			author: 'steve02081504 & ZL-31 & Pouya 🌼',
			home_page: 'https://daisyui.com',
			issue_page: 'https://github.com/steve02081504/daisyUI_helper/issues',
			tags: ['daisyUI', '프론트엔드 개발', '도우미'],
		},
		'ru-RU': { // 俄语
			name: 'Помощник daisyUI',
			avatar: 'https://daisyui.com/favicon.ico',
			description: 'Ассистент разработчика daisyUI, предоставляет примеры кода и ответы на вопросы.',
			description_markdown: `\
# Помощник daisyUI

Ассистент, который поможет вам быстро создавать страницы с помощью daisyUI.

*   Предоставляет примеры кода для компонентов daisyUI
*   Отвечает на вопросы, связанные с daisyUI
*   Поддерживает **русский, английский, китайский, испанский, французский, немецкий, японский, корейский, португальский и итальянский**
`,
			version: '1.0.0',
			author: 'steve02081504 & ZL-31 & Pouya 🌼',
			home_page: 'https://daisyui.com',
			issue_page: 'https://github.com/steve02081504/daisyUI_helper/issues',
			tags: ['daisyUI', 'Фронтенд-разработка', 'Ассистент'],
		},
		'pt-PT': { // 葡萄牙语
			name: 'Assistente daisyUI',
			avatar: 'https://daisyui.com/favicon.ico',
			description: 'Assistente de desenvolvimento daisyUI, fornecendo exemplos de código e respostas a perguntas.',
			description_markdown: `\
# Assistente daisyUI

Um assistente para ajudá-lo a construir páginas rapidamente com daisyUI.

*   Fornece exemplos de código para componentes daisyUI
*   Responde a perguntas relacionadas com daisyUI
*   Suporta **português, inglês, chinês, espanhol, francês, alemão, japonês, coreano, russo e italiano**
`,
			version: '1.0.0',
			author: 'steve02081504 & ZL-31 & Pouya 🌼',
			home_page: 'https://daisyui.com',
			issue_page: 'https://github.com/steve02081504/daisyUI_helper/issues',
			tags: ['daisyUI', 'Desenvolvimento Front-end', 'Assistente'],
		},
		'it-IT': { // 意大利语
			name: 'Assistente daisyUI',
			avatar: 'https://daisyui.com/favicon.ico',
			description: 'Assistente per lo sviluppo daisyUI, fornisce esempi di codice e risposte alle domande.',
			description_markdown: `\
# Assistente daisyUI

Un assistente per aiutarti a costruire pagine rapidamente con daisyUI.

*   Fornisce esempi di codice per i componenti daisyUI
*   Risponde alle domande relative a daisyUI
*   Supporta **italiano, inglese, cinese, spagnolo, francese, tedesco, giapponese, coreano, russo e portoghese**
`,
			version: '1.0.0',
			author: 'steve02081504 & ZL-31 & Pouya 🌼',
			home_page: 'https://daisyui.com',
			issue_page: 'https://github.com/steve02081504/daisyUI_helper/issues',
			tags: ['daisyUI', 'Sviluppo Front-end', 'Assistente'],
		},
		'ar-AR': { // 阿拉伯语
			name: 'مساعد ديزي يو آي',
			avatar: 'https://daisyui.com/favicon.ico',
			description: 'مساعد تطوير ديزي يو آي، يقدم أمثلة للتعليمات البرمجية وإجابات للأسئلة.',
			description_markdown: `\
# مساعد ديزي يو آي

مساعد لمساعدتك في بناء صفحات بسرعة باستخدام ديزي يو آي.

*   يقدم أمثلة تعليمات برمجية لمكونات ديزي يو آي
*   يجيب على الأسئلة المتعلقة بديزي يو آي
*   يدعم **العربية والإنجليزية والصينية والإسبانية والفرنسية والألمانية واليابانية والكورية والروسية والبرتغالية والإيطالية**
`,
			version: '1.0.0',
			author: 'steve02081504 & ZL-31 & Pouya 🌼',
			home_page: 'https://daisyui.com',
			issue_page: 'https://github.com/steve02081504/daisyUI_helper/issues',
			tags: ['daisyUI', 'تطوير الواجهة الأمامية', 'مساعد'],
			direction: 'rtl', // 阿拉伯语是从右向左书写的
		},
		'hi-IN': { // 印地语
			name: 'डेज़ीयूआई सहायक',
			avatar: 'https://daisyui.com/favicon.ico',
			description: 'डेज़ीयूआई विकास सहायक, कोड उदाहरण और प्रश्नों के उत्तर प्रदान करता है।',
			description_markdown: `\
# डेज़ीयूआई सहायक

डेज़ीयूआई के साथ पृष्ठों को तेज़ी से बनाने में आपकी सहायता करने के लिए एक सहायक।

*   डेज़ीयूआई घटकों के लिए कोड उदाहरण प्रदान करता है
*   डेज़ीयूआई संबंधित प्रश्नों के उत्तर देता है
*   **हिंदी, अंग्रेजी, चीनी, स्पेनिश, फ्रेंच, जर्मन, जापानी, कोरियाई, रूसी, पुर्तगाली और इतालवी** का समर्थन करता है
`,
			version: '1.0.0',
			author: 'steve02081504 & ZL-31 & Pouya 🌼',
			home_page: 'https://daisyui.com',
			issue_page: 'https://github.com/steve02081504/daisyUI_helper/issues',
			tags: ['daisyUI', 'फ्रंट-एंड डेवलपमेंट', 'सहायक'],
		},
	},

	/**
	 * 角色启用时的初始化钩子。
	 * @param {charInit_t} stat - 角色初始化信息。
	 * @returns {void}
	 */
	Init: (stat) => { },

	/**
	 * 角色卸载时的清理钩子。
	 * @param {string} reason - 卸载原因。
	 * @param {string} from - 卸载来源。
	 * @returns {void}
	 */
	Uninstall: (reason, from) => { },

	/**
	 * 角色加载时的钩子。
	 * @param {charInit_t} stat - 角色初始化信息。
	 * @returns {void}
	 */
	Load: (stat) => {
		username = stat.username
	},

	/**
	 * 角色卸载出内存时的钩子。
	 * @param {string} reason - 卸载原因。
	 * @returns {void}
	 */
	Unload: (reason) => { },

	interfaces: {
		config: {
			/**
			 * 获取角色配置。
			 * @returns {{ AIsource: string }} 当前 AI 源文件名。
			 */
			GetData: () => ({
				AIsource: AIsource?.filename || '',
			}),
			/**
			 * 设置角色配置。
			 * @param {{ AIsource?: string }} data - 配置数据。
			 * @returns {Promise<void>}
			 */
			SetData: async (data) => {
				if ('AIsource' in data)
					AIsource = data.AIsource
						? await loadPart(username, 'serviceSources/AI/' + data.AIsource)
						: null
			}
		},
		chat: {
			/**
			 * 获取角色开场白。
			 * @param {chatReplyRequest_t} arg - 聊天回复请求。
			 * @param {number} index - 开场白索引。
			 * @returns {chatReply_t} 开场白回复。
			 */
			GetGreeting: (arg, index) => [greetings[localeKey(arg)] || greetings.en][index],
			/**
			 * 获取角色加入群聊时的问候。
			 * @param {chatReplyRequest_t} arg - 聊天回复请求。
			 * @param {number} index - 问候索引。
			 * @returns {chatReply_t} 群组问候回复。
			 */
			GetGroupGreeting: (arg, index) => [groupGreetings[localeKey(arg)] || groupGreetings.en][index],
			/**
			 * 获取角色自身提示词。
			 * @param {chatReplyRequest_t} args - 聊天回复请求。
			 * @returns {Promise<{ text: { content: string, important: number }[], additional_chat_log: never[], extension: object }>} 提示结构。
			 */
			GetPrompt: async (args) => {
				try {
					const response = await fetch('https://daisyui.com/llms.txt')
					const daisyUIPrompt = await response.text()

					return {
						text: [{
							content: `\
你是一个daisyUI开发助手。你的知识来自于：
${daisyUIPrompt}

在输出html代码块时，鼓励你输出不在代码块内的html/css作为示例。
如：[
${args.Charname}: 好的，在daisyUI中创建一个按钮很简单：
\`\`\`html
<div class="btn">Button</div>
\`\`\`
以上代码看上去会是这样：
<div class="btn">Button</div>
希望这些信息对您有所帮助！如果您有任何其他问题，请随时提出。
]
`,
							important: 0
						}],
						additional_chat_log: [],
						extension: {},
					}
				}
				catch (error) {
					console.error('Failed to fetch daisyUI prompt:', error)
					return {
						text: [{
							content: `\
你是一个daisyUI开发助手，但无法获取最新的daisyUI信息。请尽力根据已知知识回答问题。
`,
							important: 0
						}],
						additional_chat_log: [],
						extension: {},
					}
				}
			},
			/**
			 * 获取其他角色视角下的该角色设定。
			 * @param {chatReplyRequest_t} _args - 聊天回复请求。
			 * @returns {{ text: { content: string, important: number }[], additional_chat_log: never[], extension: object }} 他者视角提示。
			 */
			GetPromptForOther: (_args) => ({
				text: [{
					content: `\
一个帮助开发者使用daisyUI框架的角色。
`,
					important: 0
				}],
				additional_chat_log: [],
				extension: {},
			}),
			/**
			 * 基于对话日志生成回复。
			 * @param {chatReplyRequest_t} args - 聊天回复请求。
			 * @returns {Promise<chatReply_t>} 回复内容。
			 */
			GetReply: async (args) => {
				if (!AIsource) {
					if (localeKey(args) === 'zh') return { content: '请先设置角色的AI来源。' }
					return { content: 'Please set the AI source for the character first.' }
				}
				const prompt_struct = await buildPromptStruct(args)
				/** @type {chatReply_t} */
				const result = {
					content: '',
					logContextBefore: [],
					logContextAfter: [],
					files: [],
					extension: {},
				}
				/**
				 * 向结果与 prompt 追加长期上下文。
				 * @param {chatLogEntry_t} entry - 日志条目。
				 * @returns {void}
				 */
				function AddLongTimeLog(entry) {
					entry.charVisibility = [args.char_id]
					entry.uid ??= entry.role === 'user' ? args.UserUid : entry.role === 'char' ? args.CharUid : 'system'
					result?.logContextBefore?.push?.(entry)
					prompt_struct.char_prompt.additional_chat_log.push(entry)
				}

				args.generation_options ??= {}
				const oriReplyPreviewUpdater = args.generation_options?.replyPreviewUpdater
				/**
				 * 聊天回复预览更新管道。
				 * @type {CharReplyPreviewUpdater_t}
				 */
				let replyPreviewUpdater = (req, r) => oriReplyPreviewUpdater?.(r)
				for (const GetReplyPreviewUpdater of [
					...Object.values(args.plugins).map(plugin => plugin.interfaces?.chat?.GetReplyPreviewUpdater)
				].filter(Boolean))
					replyPreviewUpdater = GetReplyPreviewUpdater(replyPreviewUpdater)

				/**
				 * @param {chatReply_t} r - 局部响应。
				 * @returns {void}
				 */
				args.generation_options.replyPreviewUpdater = r => replyPreviewUpdater(args, r)

				regen: while (true) {
					args.generation_options.base_result = result
					await AIsource.StructCall(prompt_struct, args.generation_options)
					let continue_regen = false
					for (const replyHandler of [
						...Object.values(args.plugins).map((plugin) => plugin.interfaces?.chat?.ReplyHandler)
					].filter(Boolean))
						if (await replyHandler(result, { ...args, prompt_struct, AddLongTimeLog }))
							continue_regen = true
					if (continue_regen) continue regen
					break
				}
				return result
			}
		}
	}
}
