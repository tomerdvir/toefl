import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProgress } from '../../hooks/useProgress'
import { useOllama } from '../../hooks/useOllama'
import { evaluateWriting, DEFAULT_MODEL } from '../../services/ollamaService'
import OllamaSetup from '../OllamaSetup'
import prompts from '../../data/writing.json'

function ScoreBar({ label, value, max = 5 }) {
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

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export default function Writing() {
  const { getNextItem, markComplete, getStats } = useProgress()
  const { status, recheck } = useOllama()
  const [item, setItem] = useState(null)
  const [essay, setEssay] = useState('')
  const [evaluating, setEvaluating] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const stats = getStats('writing', prompts.length)

  useEffect(() => {
    setItem(getNextItem('writing', prompts))
    setEssay('')
    setResult(null)
    setError(null)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleEvaluate() {
    if (!essay.trim() || !item) return
    setEvaluating(true)
    setError(null)
    try {
      const promptText =
        item.type === 'integrated'
          ? `Reading: ${item.reading}\n\nLecture Summary: ${item.lecture}\n\nTask: ${item.prompt}`
          : item.prompt
      const res = await evaluateWriting(promptText, essay, item.type, DEFAULT_MODEL)
      setResult(res)
      markComplete('writing', item.id, res.score)
    } catch (e) {
      setError(e.message)
    } finally {
      setEvaluating(false)
    }
  }

  function handleNext() {
    const next = getNextItem('writing', prompts)
    setItem(next)
    setEssay('')
    setResult(null)
    setError(null)
  }

  if (!item) return <div className="p-8 text-center text-slate-500">No prompts available.</div>

  const wc = wordCount(essay)
  const target = item.targetWords ?? 300
  const wcColor = wc >= target ? 'text-green-600' : wc >= target * 0.8 ? 'text-amber-600' : 'text-slate-400'

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6 bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-xl">✍️</div>
          <div>
            <Link to="/" className="text-xs text-slate-400 hover:text-green-500 transition-colors">
              ← Dashboard
            </Link>
            <h1 className="font-bold text-slate-800 leading-tight">Writing</h1>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-slate-700">{stats.completed} / {stats.total}</div>
          <div className="text-xs text-slate-400">completed</div>
        </div>
      </div>

      {status === 'offline' && <OllamaSetup onRecheck={recheck} />}

      {/* Task type badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-medium uppercase tracking-wide text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
          {item.type === 'integrated' ? 'Integrated Task' : 'Independent Task'} ·{' '}
          {item.timeLimitMinutes} min
        </span>
      </div>

      {/* Integrated reading + lecture */}
      {item.type === 'integrated' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Reading Passage
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">{item.reading}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">
              Lecture / Discussion
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">{item.lecture}</p>
          </div>
        </div>
      )}

      {/* Prompt */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-5">
        <p className="text-slate-800 leading-relaxed">{item.prompt}</p>
        <p className="text-xs text-slate-400 mt-2">
          Target: {target}+ words
        </p>
      </div>

      {/* Essay area */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">Your Essay</label>
        <textarea
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          disabled={!!result}
          rows={14}
          placeholder="Write your essay here…"
          className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none disabled:bg-slate-50 disabled:text-slate-500"
        />
        <div className={`text-right text-xs mt-0.5 font-medium ${wcColor}`}>
          {wc} / {target} words
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      {!result && (
        <button
          onClick={handleEvaluate}
          disabled={wc < 30 || evaluating || status !== 'online'}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md mb-4 flex items-center justify-center gap-2"
        >
          {evaluating ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Evaluating…
            </>
          ) : (
            'Evaluate with Gemma 4'
          )}
        </button>
      )}

      {/* Results */}
      {result && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-slate-800">AI Evaluation</h3>
            <div className="text-center">
              <span className="text-3xl font-bold text-green-600">{result.score}</span>
              <span className="text-slate-400 text-sm"> / 5</span>
            </div>
          </div>

          <ScoreBar label="Task Achievement" value={result.taskAchievement} />
          <ScoreBar label="Coherence & Organization" value={result.coherence} />
          <ScoreBar label="Language Use" value={result.language} />

          {result.wordCount && (
            <p className="text-xs text-slate-400 mt-1 mb-3">
              Detected word count: {result.wordCount}
            </p>
          )}

          <div className="p-4 bg-slate-50 rounded-lg mt-2">
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
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">
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
            className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-semibold py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            Next Prompt →
          </button>
        </div>
      )}
    </main>
  )
}
