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
    gradient: 'from-blue-600 to-blue-500',
    bar: 'bg-blue-500',
    iconBg: 'bg-blue-50',
    btn: 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600',
    description: 'Academic passages with multiple-choice questions',
    time: '35 min · 20 questions per test',
    data: readingData,
  },
  {
    key: 'listening',
    label: 'Listening',
    to: '/listening',
    emoji: '🎧',
    gradient: 'from-purple-600 to-purple-500',
    bar: 'bg-purple-500',
    iconBg: 'bg-purple-50',
    btn: 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600',
    description: 'Lectures and conversations (text transcript mode)',
    time: '36 min · 28 questions per test',
    data: listeningData,
  },
  {
    key: 'speaking',
    label: 'Speaking',
    to: '/speaking',
    emoji: '🎙️',
    gradient: 'from-orange-500 to-amber-400',
    bar: 'bg-orange-500',
    iconBg: 'bg-orange-50',
    btn: 'bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500',
    description: 'Independent tasks evaluated by Gemma 4 AI',
    time: '16 min · 4 tasks per test',
    data: speakingData,
  },
  {
    key: 'writing',
    label: 'Writing',
    to: '/writing',
    emoji: '✍️',
    gradient: 'from-green-600 to-emerald-500',
    bar: 'bg-green-500',
    iconBg: 'bg-green-50',
    btn: 'bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600',
    description: 'Integrated and independent essays evaluated by AI',
    time: '29 min · 2 tasks per test',
    data: writingData,
  },
]

function ProgressBar({ pct, barClass }) {
  return (
    <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
      <div
        className={`${barClass} h-2 rounded-full transition-all duration-700 ease-out`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export default function Dashboard() {
  const { getStats, resetAll } = useProgress()

  const totalCompleted = sections.reduce((acc, s) => acc + getStats(s.key, s.data.length).completed, 0)
  const totalItems = sections.reduce((acc, s) => acc + s.data.length, 0)
  const overallPct = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="mb-8 bg-gradient-to-br from-slate-800 via-slate-800 to-slate-700 rounded-2xl p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent pointer-events-none" />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-1">TOEFL iBT Preparation</h1>
            <p className="text-slate-400 text-sm">
              Practice all four sections. Progress is saved automatically in your browser.
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-4xl font-black text-white">{overallPct}%</div>
            <div className="text-slate-400 text-xs mt-0.5">{totalCompleted} / {totalItems} completed</div>
            <div className="w-28 bg-slate-600 rounded-full h-1.5 mt-2 ml-auto">
              <div className="bg-gradient-to-r from-blue-400 to-purple-400 h-1.5 rounded-full transition-all duration-700" style={{ width: `${overallPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Section cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {sections.map((s) => {
          const stats = getStats(s.key, s.data.length)
          return (
            <div
              key={s.key}
              className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className={`h-1 bg-gradient-to-r ${s.gradient}`} />
              <div className="p-5 flex flex-col gap-4 flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 ${s.iconBg} rounded-xl flex items-center justify-center text-xl shrink-0`}>
                      {s.emoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h2 className="font-bold text-slate-800">{s.label}</h2>
                        {stats.percentage === 100 && (
                          <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                            ✓ Done
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">{s.description}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{s.time}</p>
                    </div>
                  </div>
                  {stats.avgScore !== null && (
                    <div className="text-right shrink-0 ml-2">
                      <div className="text-xl font-black text-slate-700">{stats.avgScore}</div>
                      <div className="text-xs text-slate-400">avg score</div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>{stats.completed} / {stats.total} completed</span>
                    <span className="font-semibold text-slate-600">{stats.percentage}%</span>
                  </div>
                  <ProgressBar pct={stats.percentage} barClass={s.bar} />
                </div>

                <Link
                  to={s.to}
                  className={`${s.btn} text-white text-sm font-semibold px-4 py-2.5 rounded-xl text-center transition-all shadow-sm hover:shadow-md`}
                >
                  {stats.completed === 0 ? 'Start Practice' : stats.percentage === 100 ? 'Review' : 'Continue'}
                </Link>
              </div>
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
