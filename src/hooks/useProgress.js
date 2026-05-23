import { useState, useCallback } from 'react'

const STORAGE_KEY = 'toefl_progress'

const defaultProgress = {
  reading: { completed: [], scores: [] },
  listening: { completed: [], scores: [] },
  speaking: { completed: [] },
  writing: { completed: [] },
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultProgress
    const parsed = JSON.parse(raw)
    // Merge with defaults to handle new sections added later
    return {
      reading: { completed: [], scores: [], ...parsed.reading },
      listening: { completed: [], scores: [], ...parsed.listening },
      speaking: { completed: [], ...parsed.speaking },
      writing: { completed: [], ...parsed.writing },
    }
  } catch {
    return defaultProgress
  }
}

function persist(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // Storage full or unavailable — silently continue
  }
}

export function useProgress() {
  const [progress, setProgress] = useState(load)

  const update = useCallback((next) => {
    setProgress(next)
    persist(next)
  }, [])

  /** Returns the next unseen item from the array. Resets if all have been seen. */
  const getNextItem = useCallback(
    (section, items) => {
      if (!items || items.length === 0) return null
      const completed = progress[section]?.completed ?? []
      const unseen = items.filter((item) => !completed.includes(item.id))
      return unseen.length > 0 ? unseen[0] : items[0]
    },
    [progress],
  )

  /** Marks an item complete and optionally records a score. */
  const markComplete = useCallback(
    (section, id, score = null) => {
      setProgress((prev) => {
        const sec = prev[section] ?? { completed: [], scores: [] }
        if (sec.completed.includes(id)) return prev
        const next = {
          ...prev,
          [section]: {
            completed: [...sec.completed, id],
            scores: score !== null ? [...(sec.scores ?? []), score] : sec.scores ?? [],
          },
        }
        persist(next)
        return next
      })
    },
    [],
  )

  /** Returns stats for a section given the total number of items. */
  const getStats = useCallback(
    (section, total) => {
      const sec = progress[section] ?? { completed: [], scores: [] }
      const completed = sec.completed.length
      const scores = sec.scores ?? []
      const avgScore =
        scores.length > 0
          ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
          : null
      return {
        completed,
        total,
        avgScore,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      }
    },
    [progress],
  )

  const resetSection = useCallback(
    (section) => {
      update({ ...progress, [section]: { completed: [], scores: [] } })
    },
    [progress, update],
  )

  const resetAll = useCallback(() => {
    update(defaultProgress)
  }, [update])

  return { progress, getNextItem, markComplete, getStats, resetSection, resetAll }
}
