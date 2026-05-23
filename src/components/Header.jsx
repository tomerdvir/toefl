import { Link, useLocation } from 'react-router-dom'

const navLinks = [
  { to: '/reading', label: 'Reading', active: 'bg-blue-500/20 text-blue-200', hover: 'hover:text-blue-300' },
  { to: '/listening', label: 'Listening', active: 'bg-purple-500/20 text-purple-200', hover: 'hover:text-purple-300' },
  { to: '/speaking', label: 'Speaking', active: 'bg-orange-500/20 text-orange-200', hover: 'hover:text-orange-300' },
  { to: '/writing', label: 'Writing', active: 'bg-green-500/20 text-green-200', hover: 'hover:text-green-300' },
]

export default function Header() {
  const { pathname } = useLocation()
  return (
    <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl border-b border-slate-700/60">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            TOEFL Prep
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {navLinks.map(({ to, label, active, hover }) => (
            <Link
              key={to}
              to={to}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                pathname === to
                  ? `${active} shadow-inner`
                  : `text-slate-400 ${hover}`
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
