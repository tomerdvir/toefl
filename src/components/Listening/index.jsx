import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useProgress } from '../../hooks/useProgress'
import transcripts from '../../data/listening.json'

function QuestionCard({ q, index, selected, onSelect, submitted }) {
  return (
    <div className="mb-5">
      <p className="font-medium text-slate-800 mb-2">
        {index + 1}. {q.text}
      </p>
      <div className="space-y-2">
        {q.options.map((opt, i) => {
          let cls =
            'w-full text-left px-4 py-2 rounded-lg border text-sm transition-colors cursor-pointer '
          if (!submitted) {
            cls +=
              selected === i
                ? 'border-purple-500 bg-purple-50 text-purple-800'
                : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
          } else {
            if (i === q.answer) cls += 'border-green-500 bg-green-50 text-green-800 font-medium'
            else if (i === selected && i !== q.answer)
              cls += 'border-red-400 bg-red-50 text-red-700'
            else cls += 'border-slate-200 text-slate-500'
          }
          return (
            <button key={i} className={cls} onClick={() => !submitted && onSelect(q.id, i)}>
              <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function Listening() {
  const { getNextItem, markComplete, getStats } = useProgress()
  const [item, setItem] = useState(null)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(null)
  const [showTranscript, setShowTranscript] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const utteranceRef = useRef(null)

  const stats = getStats('listening', transcripts.length)

  useEffect(() => {
    setItem(getNextItem('listening', transcripts))
    setAnswers({})
    setSubmitted(false)
    setScore(null)
    setShowTranscript(false)
    stopSpeech()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => stopSpeech()
  }, [])

  function stopSpeech() {
    window.speechSynthesis.cancel()
    setIsPlaying(false)
    utteranceRef.current = null
  }

  function handlePlayPause() {
    if (isPlaying) {
      stopSpeech()
      return
    }
    if (!item) return
    const utterance = new SpeechSynthesisUtterance(item.transcript)
    utterance.rate = 0.95
    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => setIsPlaying(false)
    utteranceRef.current = utterance
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
    setIsPlaying(true)
  }

  function handleSelect(qId, optIdx) {
    setAnswers((prev) => ({ ...prev, [qId]: optIdx }))
  }

  function handleSubmit() {
    if (!item) return
    const correct = item.questions.filter((q) => answers[q.id] === q.answer).length
    const pct = Math.round((correct / item.questions.length) * 100)
    setScore({ correct, total: item.questions.length, pct })
    setSubmitted(true)
    markComplete('listening', item.id, pct)
  }

  function handleNext() {
    stopSpeech()
    const next = getNextItem('listening', transcripts)
    setItem(next)
    setAnswers({})
    setSubmitted(false)
    setScore(null)
    setShowTranscript(false)
  }

  const allAnswered = item && Object.keys(answers).length === item.questions.length

  if (!item) return <div className="p-8 text-center text-slate-500">No transcripts available.</div>

  const typeLabel = item.type === 'lecture' ? 'Lecture' : 'Conversation'

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6 bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-xl">🎧</div>
          <div>
            <Link to="/" className="text-xs text-slate-400 hover:text-purple-500 transition-colors">
              ← Dashboard
            </Link>
            <h1 className="font-bold text-slate-800 leading-tight">Listening</h1>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-slate-700">{stats.completed} / {stats.total}</div>
          <div className="text-xs text-slate-400">completed</div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-medium uppercase tracking-wide text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
          {typeLabel} · {item.subject}
        </span>
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-4">{item.title}</h2>

      {/* Audio player & Transcript toggle */}
      <div className="mb-6 flex flex-wrap items-start gap-3">
        <button
          onClick={handlePlayPause}
          className={`flex items-center gap-2 text-sm font-medium border px-4 py-2 rounded-lg transition-colors ${
            isPlaying
              ? 'border-purple-600 bg-purple-600 text-white hover:bg-purple-700'
              : 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100'
          }`}
        >
          {isPlaying ? (
            <>
              <span>⏹</span> Stop Audio
            </>
          ) : (
            <>
              <span>▶</span> Play Audio
            </>
          )}
        </button>

        <button
          onClick={() => setShowTranscript((v) => !v)}
          className="flex items-center gap-2 text-sm text-purple-700 font-medium border border-purple-300 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-lg transition-colors"
        >
          <span>{showTranscript ? '▲' : '▼'}</span>
          {showTranscript ? 'Hide Transcript' : 'Show Transcript'}
        </button>
      </div>
      {showTranscript && (
        <div className="mb-6 mt-[-12px] bg-white border border-purple-200 rounded-xl p-5 max-h-64 overflow-y-auto">
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {item.transcript}
          </p>
        </div>
      )}

      {/* Questions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <p className="text-xs text-slate-400 mb-4">
          Answer all {item.questions.length} questions below.
        </p>
        {item.questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            q={q}
            index={i}
            selected={answers[q.id] ?? null}
            onSelect={handleSelect}
            submitted={submitted}
          />
        ))}

        {submitted && score && (
          <div
            className={`rounded-xl p-4 mb-4 border ${
              score.pct >= 70
                ? 'bg-green-50 border-green-300 text-green-800'
                : 'bg-orange-50 border-orange-300 text-orange-800'
            }`}
          >
            <p className="font-bold text-lg">
              {score.correct}/{score.total} correct ({score.pct}%)
            </p>
            <p className="text-sm mt-0.5">
              {score.pct >= 70 ? 'Good work! Keep it up.' : 'Review the highlighted answers below.'}
            </p>
          </div>
        )}

        {!submitted ? (
          <>
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>{Object.keys(answers).length} / {item.questions.length} answered</span>
              <div className="w-32 bg-gray-200 rounded-full h-1.5 self-center">
                <div
                  className="bg-purple-400 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.round((Object.keys(answers).length / item.questions.length) * 100)}%` }}
                />
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md"
            >
              {allAnswered ? 'Submit Answers' : `Answer all ${item.questions.length} questions`}
            </button>
          </>
        ) : (
          <button
            onClick={handleNext}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            Next Transcript →
          </button>
        )}
      </div>
    </main>
  )
}
