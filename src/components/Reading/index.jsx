import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProgress } from '../../hooks/useProgress'
import passages from '../../data/reading.json'

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
                ? 'border-blue-500 bg-blue-50 text-blue-800'
                : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
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

export default function Reading() {
  const { getNextItem, markComplete, getStats, resetSection } = useProgress()
  const [passage, setPassage] = useState(null)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(null)

  const stats = getStats('reading', passages.length)

  useEffect(() => {
    setPassage(getNextItem('reading', passages))
    setAnswers({})
    setSubmitted(false)
    setScore(null)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSelect(qId, optIdx) {
    setAnswers((prev) => ({ ...prev, [qId]: optIdx }))
  }

  function handleSubmit() {
    if (!passage) return
    const correct = passage.questions.filter((q) => answers[q.id] === q.answer).length
    const pct = Math.round((correct / passage.questions.length) * 100)
    setScore({ correct, total: passage.questions.length, pct })
    setSubmitted(true)
    markComplete('reading', passage.id, pct)
  }

  function handleNext() {
    const next = getNextItem('reading', passages)
    setPassage(next)
    setAnswers({})
    setSubmitted(false)
    setScore(null)
  }

  const allAnswered = passage && Object.keys(answers).length === passage.questions.length

  if (!passage) return <div className="p-8 text-center text-slate-500">No passages available.</div>

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6 bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl">📖</div>
          <div>
            <Link to="/" className="text-xs text-slate-400 hover:text-blue-500 transition-colors flex items-center gap-1">
              ← Dashboard
            </Link>
            <h1 className="font-bold text-slate-800 leading-tight">Reading</h1>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-slate-700">{stats.completed} / {stats.total}</div>
          <div className="text-xs text-slate-400">completed</div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-800 mb-1">{passage.title}</h2>
      <p className="text-xs text-slate-400 mb-5">
        Read the passage carefully, then answer all {passage.questions.length} questions.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Passage */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 h-fit lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto shadow-sm">
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {passage.passage}
          </p>
        </div>

        {/* Questions */}
        <div>
          {passage.questions.map((q, i) => (
            <QuestionCard
              key={q.id}
              q={q}
              index={i}
              selected={answers[q.id] ?? null}
              onSelect={handleSelect}
              submitted={submitted}
            />
          ))}

          {/* Score banner */}
          {submitted && score && (
            <div
              className={`rounded-2xl p-4 mb-4 border ${
                score.pct >= 70
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-orange-50 border-orange-200 text-orange-800'
              }`}
            >
              <p className="font-bold text-lg">
                {score.correct}/{score.total} correct ({score.pct}%)
              </p>
              <p className="text-sm mt-0.5">
                {score.pct >= 70 ? 'Good work! Keep it up.' : 'Review the highlighted answers.'}
              </p>
            </div>
          )}

          {/* Actions */}
          {!submitted ? (
            <>
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>{Object.keys(answers).length} / {passage.questions.length} answered</span>
                <div className="w-32 bg-gray-200 rounded-full h-1.5 self-center">
                  <div
                    className="bg-blue-400 h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.round((Object.keys(answers).length / passage.questions.length) * 100)}%` }}
                  />
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!allAnswered}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md"
              >
                {allAnswered ? 'Submit Answers' : `Answer all ${passage.questions.length} questions`}
              </button>
            </>
          ) : (
            <button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md"
            >
              Next Passage →
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
