'use client'

import { useEffect, useState, useMemo } from 'react'
import DashboardHeader from '@/components/DashboardHeader'
import SourceCard from '@/components/SourceCard'
import { Notification } from '@/lib/types'
import { supabaseClient } from '@/lib/supabase'

export default function Dashboard() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState({
    total: 0,
    todos: 0,
    notifications: 0,
    bySource: {} as Record<string, number>
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [hiddenSources, setHiddenSources] = useState<string[]>([])
  const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set())

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?limit=50')
      const data = await response.json()
      if (data.success) {
        setNotifications(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  useEffect(() => {
    fetchNotifications()
    fetchStats()

    // Set up real-time subscription
    const channel = supabaseClient
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          console.log('Real-time update:', payload)
          // Refresh notifications and stats when changes occur
          fetchNotifications()
          fetchStats()
        }
      )
      .subscribe()

    return () => {
      supabaseClient.removeChannel(channel)
    }
  }, [])

  // Filter notifications based on search query
  const filteredNotifications = useMemo(() => {
    if (!searchQuery.trim()) {
      return notifications
    }
    const query = searchQuery.toLowerCase()
    return notifications.filter((notification) => {
      const matchesSource = notification.source.toLowerCase().includes(query)
      const matchesNotification = notification.notification?.toLowerCase().includes(query)
      const matchesTodo = notification.todo_text?.toLowerCase().includes(query)
      return matchesSource || matchesNotification || matchesTodo
    })
  }, [notifications, searchQuery])

  // Group notifications by source
  const groupedNotifications = useMemo(() => {
    return filteredNotifications.reduce((acc, notification) => {
      if (!acc[notification.source]) {
        acc[notification.source] = []
      }
      acc[notification.source].push(notification)
      return acc
    }, {} as Record<string, Notification[]>)
  }, [filteredNotifications])

  // Common sources we want to display
  const sources = [
    {
      name: 'Email',
      icon: <span className="material-symbols-outlined text-xl">mail</span>,
      notifications: groupedNotifications['Email'] || [],
    },
    {
      name: 'GitHub',
      icon: (
        <svg className="size-6" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.19.01-.82.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21-.15.46-.55.38A8.013 8.013 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
        </svg>
      ),
      notifications: groupedNotifications['GitHub'] || [],
    },
    {
      name: 'Slack',
      icon: (
        <svg className="size-6" fill="none" viewBox="0 0 48 48">
          <g clipPath="url(#clip0_105_23)">
            <path d="M11 31C8.23858 31 6 28.7614 6 26V15C6 12.2386 8.23858 10 11 10C13.7614 10 16 12.2386 16 15V26C16 28.7614 13.7614 31 11 31Z" fill="#36C5F0"></path>
            <path d="M17 31C17 33.7614 19.2386 36 22 36C24.7614 36 27 33.7614 27 31V20C27 17.2386 24.7614 15 22 15C19.2386 15 17 17.2386 17 20V31Z" fill="#2EB67D"></path>
            <path d="M37 17C39.7614 17 42 19.2386 42 22V33C42 35.7614 39.7614 38 37 38C34.2386 38 32 35.7614 32 33V22C32 19.2386 34.2386 17 37 17Z" fill="#ECB22E"></path>
            <path d="M31 17C31 14.2386 28.7614 12 26 12C23.2386 12 21 14.2386 21 17V28C21 30.7614 23.2386 33 26 33C28.7614 33 31 30.7614 31 28V17Z" fill="#E01E5A"></path>
          </g>
          <defs>
            <clipPath id="clip0_105_23">
              <rect fill="white" height="48" width="48"></rect>
            </clipPath>
          </defs>
        </svg>
      ),
      notifications: groupedNotifications['Slack'] || [],
    },
  ]

  // Add any other sources that have notifications
  Object.keys(groupedNotifications).forEach((sourceName) => {
    if (!sources.find(s => s.name === sourceName)) {
      sources.push({
        name: sourceName,
        icon: <span className="material-symbols-outlined text-xl">notifications</span>,
        notifications: groupedNotifications[sourceName] || [],
      })
    }
  })

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setNotifications(notifications.filter((n) => n.id !== notificationId))
        fetchStats()
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const handleToggleExpand = (notificationId: string) => {
    setExpandedNotifications((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId)
      } else {
        newSet.add(notificationId)
      }
      return newSet
    })
  }

  const handleHideSource = (sourceName: string) => {
    setHiddenSources((prev) => [...prev, sourceName])
  }

  const handleShowSource = (sourceName: string) => {
    setHiddenSources((prev) => prev.filter((s) => s !== sourceName))
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          <p className="text-text-light-secondary dark:text-text-dark-secondary">Loading...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader onSearchChange={setSearchQuery} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-tighter text-text-light-primary dark:text-text-dark-primary">
            Dashboard
          </h1>
          <p className="text-base text-text-light-secondary dark:text-text-dark-secondary">
            You have{' '}
            <span className="font-bold text-primary">{stats.total} update{stats.total !== 1 ? 's' : ''}</span>.
          </p>
        </div>
        {searchQuery && filteredNotifications.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-text-light-secondary dark:text-text-dark-secondary">
              No notifications found matching "{searchQuery}"
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {sources
                .filter((source) => !hiddenSources.includes(source.name))
                .map((source) => (
                  <SourceCard
                    key={source.name}
                    source={source.name}
                    notifications={source.notifications}
                    icon={source.icon}
                    onDelete={handleDeleteNotification}
                    onToggleExpand={handleToggleExpand}
                    expandedNotifications={expandedNotifications}
                    onHideSource={handleHideSource}
                  />
                ))}
            </div>
            {hiddenSources.length > 0 && (
              <div className="mt-6">
                <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary mb-2">
                  Hidden sources:
                </p>
                <div className="flex flex-wrap gap-2">
                  {hiddenSources.map((sourceName) => (
                    <button
                      key={sourceName}
                      onClick={() => handleShowSource(sourceName)}
                      className="px-3 py-1 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-sm text-text-light-secondary dark:text-text-dark-secondary hover:text-text-light-primary dark:hover:text-text-dark-primary"
                    >
                      {sourceName} <span className="material-symbols-outlined text-xs align-middle">close</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}