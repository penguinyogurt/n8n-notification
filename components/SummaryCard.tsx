'use client'

import { useEffect, useState } from 'react'

interface SummaryCardProps {
  source: string
  notifications: any[]
  icon: React.ReactNode
}

export default function SummaryCard({ source, notifications, icon }: SummaryCardProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSummary = async () => {
    if (notifications.length === 0) {
      setSummary(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source,
          messages: notifications,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSummary(data.summary)
      } else {
        setError(data.error || 'Failed to generate summary')
      }
    } catch (err: any) {
      console.error('Error fetching summary:', err)
      setError('Failed to generate summary')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Debounce summary generation
    const timer = setTimeout(() => {
      fetchSummary()
    }, 1000)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, notifications.length, notifications.map((n) => n.id).join(',')])

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 border border-border-light dark:border-border-dark">
      <div className="flex items-center gap-2 mb-3">
        <div className="text-primary">{icon}</div>
        <h3 className="text-lg font-bold text-text-light-primary dark:text-text-dark-primary">
          {source} Summary
        </h3>
        <span className="text-xs text-text-light-secondary dark:text-text-dark-secondary">
          ({notifications.length} {notifications.length === 1 ? 'message' : 'messages'})
        </span>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-text-light-secondary dark:text-text-dark-secondary">
          <span className="material-symbols-outlined animate-spin text-base">refresh</span>
          <span className="text-sm">Generating summary...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <span className="material-symbols-outlined text-base">error</span>
          <span>{error}</span>
        </div>
      )}

      {summary && !loading && (
        <div className="text-sm text-text-light-secondary dark:text-text-dark-secondary leading-relaxed">
          {summary}
        </div>
      )}

      {!summary && !loading && !error && (
        <button
          onClick={fetchSummary}
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-base">auto_awesome</span>
          Generate summary
        </button>
      )}
    </div>
  )
}

