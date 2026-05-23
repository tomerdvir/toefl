const OLLAMA_BASE = 'http://localhost:11434'
export const DEFAULT_MODEL = 'gemma4:e4b'

export async function checkOllamaHealth() {
  const res = await fetch(`${OLLAMA_BASE}/api/tags`, {
    signal: AbortSignal.timeout(3000),
  })
  if (!res.ok) throw new Error('Ollama not reachable')
  const data = await res.json()
  return data.models ?? []
}

async function chat(model, messages) {
  const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: false, format: 'json' }),
  })
  if (!res.ok) throw new Error(`Ollama request failed: ${res.status}`)
  const data = await res.json()
  try {
    return JSON.parse(data.message.content)
  } catch {
    throw new Error('Model returned invalid JSON. Try again.')
  }
}

export async function evaluateSpeaking(prompt, response, model = DEFAULT_MODEL) {
  const system = `You are a certified TOEFL speaking evaluator. Evaluate the candidate's spoken response to the given task.
Score using these four criteria, each on a 0-4 scale (whole numbers only):
- delivery: clarity, fluency, pace, naturalness
- language: grammar accuracy, vocabulary range and precision
- development: relevance, completeness, coherence, use of examples

Return ONLY valid JSON with this exact structure (no other text):
{
  "score": <overall score 0.0-4.0, one decimal>,
  "delivery": <0-4>,
  "language": <0-4>,
  "development": <0-4>,
  "feedback": "<2-4 sentence overall evaluation>",
  "strengths": ["<specific strength>", "<specific strength>"],
  "improvements": ["<specific area to improve>", "<specific area to improve>"]
}`
  return chat(model, [
    { role: 'system', content: system },
    {
      role: 'user',
      content: `Speaking Prompt: ${prompt}\n\nCandidate Response:\n${response}`,
    },
  ])
}

export async function evaluateWriting(prompt, essay, type = 'independent', model = DEFAULT_MODEL) {
  const taskDescription =
    type === 'integrated'
      ? 'an integrated writing task (summarize and relate lecture points to a reading)'
      : 'an independent writing task (opinion essay)'

  const system = `You are a certified TOEFL writing evaluator. Evaluate the following response to ${taskDescription}.
Score each dimension on a 0-5 scale (one decimal allowed):
- taskAchievement: how well the essay addresses the prompt
- coherence: organization, paragraph structure, logical flow
- language: grammar, vocabulary range, sentence variety

Count the approximate word count of the essay provided.

Return ONLY valid JSON with this exact structure (no other text):
{
  "score": <overall 0.0-5.0>,
  "taskAchievement": <0.0-5.0>,
  "coherence": <0.0-5.0>,
  "language": <0.0-5.0>,
  "wordCount": <integer>,
  "feedback": "<3-5 sentence overall evaluation>",
  "strengths": ["<specific strength>", "<specific strength>"],
  "improvements": ["<specific area to improve>", "<specific area to improve>"]
}`
  return chat(model, [
    { role: 'system', content: system },
    {
      role: 'user',
      content: `Writing Prompt:\n${prompt}\n\nEssay:\n${essay}`,
    },
  ])
}
