import { Link, useLocation } from 'react-router-dom'

const navLinks = [
  { to: '/reading', label: 'Reading', color: 'hover:text-blue-400' },
  { to: '/listening', label: 'Listening', color: 'hover:text-purple-400' },
  { to: '/speaking', label: 'Speaking', color: 'hover:text-orange-400' },
  { to: '/writing', label: 'Writing', color: 'hover:text-green-400' },
]

export default function Header() {
  const { pathname } = useLocation()
  return (
    <header className="bg-slate-800 text-white shadow-lg">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg tracking-wide text-white">
          TOEFL Prep
        </Link>
        <nav className="flex items-center gap-1">
          {navLinks.map(({ to, label, color }) => (
            <Link
              key={to}
              to={to}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                pathname === to
                  ? 'bg-white/20 text-white'
                  : `text-slate-300 ${color}`
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
