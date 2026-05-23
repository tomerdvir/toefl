import { HashRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import Reading from './components/Reading'
import Listening from './components/Listening'
import Speaking from './components/Speaking'
import Writing from './components/Writing'

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50">
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/reading" element={<Reading />} />
          <Route path="/listening" element={<Listening />} />
          <Route path="/speaking" element={<Speaking />} />
          <Route path="/writing" element={<Writing />} />
        </Routes>
      </div>
    </HashRouter>
  )
}

export default App
