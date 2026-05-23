import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProgress } from '../../hooks/useProgress'
import { useOllama } from '../../hooks/useOllama'
import { evaluateSpeaking, DEFAULT_MODEL } from '../../services/ollamaService'
import OllamaSetup from '../OllamaSetup'
import prompts from '../../data/speaking.json'

function ScoreBar({ label, value, max = 4 }) {
  const pct = (value / max) * 100
  const color = pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div className="mb-2">
      <div className="flex justify-between text-sm mb-0.5">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-800">
          {value} / {max}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function Speaking() {
  const { getNextItem, markComplete, getStats } = useProgress()
  const { status, recheck } = useOllama()
  const [prompt, setPrompt] = useState(null)
  const [response, setResponse] = useState('')
  const [evaluating, setEvaluating] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const stats = getStats('speaking', prompts.length)

  useEffect(() => {
    setPrompt(getNextItem('speaking', prompts))
    setResponse('')
    setResult(null)
    setError(null)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleEvaluate() {
    if (!response.trim() || !prompt) return
    setEvaluating(true)
    setError(null)
    try {
      const res = await evaluateSpeaking(prompt.prompt, response, DEFAULT_MODEL)
      setResult(res)
      markComplete('speaking', prompt.id, res.score)
    } catch (e) {
      setError(e.message)
    } finally {
      setEvaluating(false)
    }
  }

  function handleNext() {
    const next = getNextItem('speaking', prompts)
    setPrompt(next)
    setResponse('')
    setResult(null)
    setError(null)
  }

  if (!prompt) return <div className="p-8 text-center text-slate-500">No prompts available.</div>

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-slate-700">
            Dashboard
          </Link>
          <span>›</span>
          <span className="text-slate-700 font-medium">Speaking</span>
        </div>
        <span className="text-sm text-slate-400">
          {stats.completed} / {stats.total} completed
        </span>
      </div>

      {status === 'offline' && <OllamaSetup onRecheck={recheck} />}

      {/* Prompt */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 mb-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium uppercase tracking-wide text-orange-600">
            Independent Task · 45 sec
          </span>
        </div>
        <p className="text-slate-800 leading-relaxed">{prompt.prompt}</p>
        <p className="text-xs text-slate-400 mt-3">
          In the real test you would speak your answer. Here, type your response as you would say it.
        </p>
      </div>

      {/* Response area */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">Your Response</label>
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          disabled={!!result}
          rows={6}
          placeholder="Type your spoken response here…"
          className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none disabled:bg-slate-50 disabled:text-slate-500"
        />
        <div className="text-right text-xs text-slate-400 mt-0.5">
          {response.trim().split(/\s+/).filter(Boolean).length} words
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      {/* Evaluate button */}
      {!result && (
        <button
          onClick={handleEvaluate}
          disabled={!response.trim() || evaluating || status !== 'online'}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors mb-4"
        >
          {evaluating ? 'Evaluating…' : 'Evaluate with Gemma 4'}
        </button>
      )}

      {/* Results */}
      {result && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-slate-800">AI Evaluation</h3>
            <div className="text-center">
              <span className="text-3xl font-bold text-orange-500">{result.score}</span>
              <span className="text-slate-400 text-sm"> / 4</span>
            </div>
          </div>

          <ScoreBar label="Delivery" value={result.delivery} />
          <ScoreBar label="Language Use" value={result.language} />
          <ScoreBar label="Topic Development" value={result.development} />

          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-700 leading-relaxed">{result.feedback}</p>
          </div>

          {result.strengths?.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">
                Strengths
              </p>
              <ul className="text-sm text-slate-700 space-y-0.5">
                {result.strengths.map((s, i) => (
                  <li key={i}>✓ {s}</li>
                ))}
              </ul>
            </div>
          )}

          {result.improvements?.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-1">
                Areas to Improve
              </p>
              <ul className="text-sm text-slate-700 space-y-0.5">
                {result.improvements.map((s, i) => (
                  <li key={i}>→ {s}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={handleNext}
            className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl transition-colors"
          >
            Next Prompt →
          </button>
        </div>
      )}
    </main>
  )
}
