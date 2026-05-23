import { Link } from 'react-router-dom'
import { useProgress } from '../../hooks/useProgress'
import readingData from '../../data/reading.json'
import listeningData from '../../data/listening.json'
import speakingData from '../../data/speaking.json'
import writingData from '../../data/writing.json'

const sections = [
  {
    key: 'reading',
    label: 'Reading',
    to: '/reading',
    emoji: '📖',
    color: 'blue',
    bg: 'bg-blue-600',
    light: 'bg-blue-50 border-blue-200',
    bar: 'bg-blue-500',
    description: 'Academic passages with multiple-choice questions',
    time: '35 min · 20 questions per test',
    data: readingData,
  },
  {
    key: 'listening',
    label: 'Listening',
    to: '/listening',
    emoji: '🎧',
    color: 'purple',
    bg: 'bg-purple-600',
    light: 'bg-purple-50 border-purple-200',
    bar: 'bg-purple-500',
    description: 'Lectures and conversations (text transcript mode)',
    time: '36 min · 28 questions per test',
    data: listeningData,
  },
  {
    key: 'speaking',
    label: 'Speaking',
    to: '/speaking',
    emoji: '🎙️',
    color: 'orange',
    bg: 'bg-orange-500',
    light: 'bg-orange-50 border-orange-200',
    bar: 'bg-orange-500',
    description: 'Independent tasks evaluated by Gemma 4 AI',
    time: '16 min · 4 tasks per test',
    data: speakingData,
  },
  {
    key: 'writing',
    label: 'Writing',
    to: '/writing',
    emoji: '✍️',
    color: 'green',
    bg: 'bg-green-600',
    light: 'bg-green-50 border-green-200',
    bar: 'bg-green-500',
    description: 'Integrated and independent essays evaluated by AI',
    time: '29 min · 2 tasks per test',
    data: writingData,
  },
]

function ProgressBar({ pct, barClass }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
      <div
        className={`${barClass} h-2 rounded-full transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export default function Dashboard() {
  const { getStats, resetAll } = useProgress()

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-1">TOEFL iBT Preparation</h1>
        <p className="text-slate-500">
          Practice all four sections. Progress is saved automatically in your browser.
        </p>
      </div>

      {/* Section cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {sections.map((s) => {
          const stats = getStats(s.key, s.data.length)
          return (
            <div
              key={s.key}
              className={`border rounded-xl p-5 ${s.light} flex flex-col gap-3`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xl">{s.emoji}</span>
                    <h2 className="font-bold text-lg text-slate-800">{s.label}</h2>
                  </div>
                  <p className="text-sm text-slate-600">{s.description}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.time}</p>
                </div>
                {stats.avgScore !== null && (
                  <span className="text-sm font-semibold text-slate-600 whitespace-nowrap">
                    avg {stats.avgScore}
                  </span>
                )}
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-0.5">
                  <span>
                    {stats.completed} / {stats.total} completed
                  </span>
                  <span>{stats.percentage}%</span>
                </div>
                <ProgressBar pct={stats.percentage} barClass={s.bar} />
              </div>

              <Link
                to={s.to}
                className={`${s.bg} text-white text-sm font-medium px-4 py-2 rounded-lg text-center hover:opacity-90 transition-opacity`}
              >
                {stats.completed === 0 ? 'Start Practice' : 'Continue'}
              </Link>
            </div>
          )
        })}
      </div>

      {/* Reset */}
      <div className="border-t border-slate-200 pt-5">
        <button
          onClick={() => {
            if (window.confirm('Reset all progress? This cannot be undone.')) resetAll()
          }}
          className="text-xs text-slate-400 hover:text-red-500 transition-colors underline"
        >
          Reset all progress
        </button>
      </div>
    </main>
  )
}
