/* global fountCharCI */
const CI = fountCharCI

await CI.test('GetGreeting', async () => {
	const greeting = await CI.char.interfaces.chat.GetGreeting({ chat_log: [], locales: ['en-UK'] }, 0)
	CI.assert(typeof greeting?.content === 'string' && greeting.content.length > 0, `expected non-empty greeting, got: ${JSON.stringify(greeting)}`)
})

await CI.test('GetGroupGreeting', async () => {
	const greeting = await CI.char.interfaces.chat.GetGroupGreeting({ chat_log: [], locales: ['zh-CN'] }, 0)
	CI.assert(typeof greeting?.content === 'string' && greeting.content.includes('daisyUI'), `expected group greeting, got: ${JSON.stringify(greeting)}`)
})

await CI.test('GetPromptForOther', async () => {
	const prompt = await CI.char.interfaces.chat.GetPromptForOther({})
	CI.assert(Array.isArray(prompt?.text) && prompt.text.some(t => String(t.content || '').includes('daisyUI')), `expected daisyUI prompt, got: ${JSON.stringify(prompt)}`)
})

await CI.test('noAI Fallback', async () => {
	await CI.char.interfaces.config.SetData({ AIsource: '' })
	const { reply } = await CI.runInput('Hello')
	CI.assert(typeof reply?.content === 'string' && reply.content.length > 0, `expected fallback reply, got: ${JSON.stringify(reply)}`)
})

await CI.test('Basic AI Response', async () => {
	await CI.char.interfaces.config.SetData({ AIsource: 'CI' })
	const { reply } = await CI.runInput('Hello')
	CI.assert(reply.content.includes('good morning'), 'Character failed to return the AI content correctly.')
})
