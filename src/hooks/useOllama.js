import { useState, useEffect, useCallback } from 'react'
import { checkOllamaHealth } from '../services/ollamaService'

export function useOllama() {
  const [status, setStatus] = useState('checking') // 'checking' | 'online' | 'offline'
  const [models, setModels] = useState([])

  const check = useCallback(() => {
    setStatus('checking')
    checkOllamaHealth()
      .then((m) => {
        setModels(m)
        setStatus('online')
      })
      .catch(() => {
        setStatus('offline')
      })
  }, [])

  useEffect(() => {
    check()
  }, [check])

  return { status, models, recheck: check }
}
