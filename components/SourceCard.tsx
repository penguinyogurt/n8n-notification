import { useState, useEffect, useRef } from 'react'
import { Notification } from '@/lib/types'

interface SourceCardProps {
  source: string
  notifications: Notification[]
  icon: React.ReactNode
  onDelete?: (notificationId: string) => void
  onToggleExpand?: (notificationId: string) => void
  expandedNotifications?: Set<string>
  onHideSource?: (sourceName: string) => void
}

export default function SourceCard({ 
  source, 
  notifications, 
  icon, 
  onDelete,
  onToggleExpand,
  expandedNotifications = new Set(),
  onHideSource
}: SourceCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      Email: 'text-red-500',
      GitHub: 'text-text-light-primary dark:text-text-dark-primary',
      Slack: 'text-text-light-primary dark:text-text-dark-primary',
    }
    return colors[source] || 'text-text-light-primary dark:text-text-dark-primary'
  }

  const formatNotification = (notification: Notification) => {
    if (notification.notification) {
      // Try to extract sender name and message
      const match = notification.notification.match(/^(.+?)\s*says?:\s*(.+)$/i)
      if (match) {
        return { sender: match[1], message: match[2] }
      }
      return { sender: null, message: notification.notification }
    }
    return { sender: null, message: notification.todo_text || 'No message' }
  }

  const getInitials = (text: string) => {
    return text.substring(0, 2).toUpperCase()
  }

  const handleDeleteClick = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this notification?')) {
      onDelete?.(notificationId)
    }
  }

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMenu(!showMenu)
  }

  const handleHideSourceClick = () => {
    if (confirm(`Hide all ${source} notifications?`)) {
      onHideSource?.(source)
      setShowMenu(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-card-light dark:bg-card-dark p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={getSourceColor(source)}>
            {icon}
          </div>
          <h3 className="text-lg font-bold text-text-light-primary dark:text-text-dark-primary">{source}</h3>
          <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-white">
            {notifications.length}
          </span>
        </div>
        <div className="relative" ref={menuRef}>
          <button 
            onClick={handleMenuClick}
            className="text-text-light-secondary dark:text-text-dark-secondary hover:text-text-light-primary dark:hover:text-text-dark-primary"
          >
            <span className="material-symbols-outlined text-lg">more_horiz</span>
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark shadow-lg z-10">
              <button
                onClick={handleHideSourceClick}
                className="w-full text-left px-4 py-2 text-sm text-text-light-primary dark:text-text-dark-primary hover:bg-background-light dark:hover:bg-background-dark rounded-t-lg"
              >
                <span className="material-symbols-outlined text-base align-middle mr-2">visibility_off</span>
                Hide source
              </button>
              <button
                onClick={() => setShowMenu(false)}
                className="w-full text-left px-4 py-2 text-sm text-text-light-primary dark:text-text-dark-primary hover:bg-background-light dark:hover:bg-background-dark rounded-b-lg"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {notifications.length === 0 ? (
          <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary text-center py-4">
            No notifications
          </p>
        ) : (
          notifications.map((notification) => {
            const { sender, message } = formatNotification(notification)
            const isMention = notification.notification?.includes('@') || false
            const initials = sender ? getInitials(sender) : source.substring(0, 2).toUpperCase()
            const isExpanded = expandedNotifications.has(notification.id)
            const fullMessage = notification.notification || notification.todo_text || 'No message'
            const displayMessage = notification.is_todo && notification.todo_text 
              ? notification.todo_text 
              : sender || 'Notification'
            
            return (
              <div
                key={notification.id}
                className={`rounded-lg border ${
                  isMention
                    ? 'border-mention/50 dark:border-mention/50 bg-mention/10 dark:bg-mention/20'
                    : 'border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark'
                }`}
              >
                <div
                  className={`flex gap-3 p-3 cursor-pointer hover:opacity-80 transition-opacity ${
                    isExpanded ? 'border-b border-border-light dark:border-border-dark' : ''
                  }`}
                  onClick={() => onToggleExpand?.(notification.id)}
                >
                  {source === 'Email' && (
                    <div className="h-10 w-10 shrink-0 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-800">
                      {initials}
                    </div>
                  )}
                  {source === 'GitHub' && (
                    <span className={`material-symbols-outlined mt-1 ${
                      notification.notification?.includes('merge') ? 'text-green-500' :
                      notification.notification?.includes('@') ? 'text-mention' :
                      'text-purple-500'
                    }`}>
                      {notification.notification?.includes('merge') ? 'merge_type' :
                       notification.notification?.includes('@') ? 'alternate_email' :
                       'adjust'}
                    </span>
                  )}
                  {source === 'Slack' && (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold text-sm">
                      {initials[0] || '#'}
                    </div>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <p className={`text-sm font-medium text-text-light-primary dark:text-text-dark-primary ${
                      !isExpanded ? 'truncate' : ''
                    }`}>
                      {displayMessage}
                    </p>
                    <p className={`text-xs text-text-light-secondary dark:text-text-dark-secondary ${
                      !isExpanded ? 'truncate' : ''
                    }`}>
                      {notification.is_todo && notification.todo_text ? 'Todo item' : message}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleDeleteClick(e, notification.id)}
                      className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                      title="Delete notification"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleExpand?.(notification.id)
                      }}
                      className="text-text-light-secondary dark:text-text-dark-secondary hover:text-text-light-primary dark:hover:text-text-dark-primary"
                      title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      <span className="material-symbols-outlined text-base transition-transform">
                        {isExpanded ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="p-3 pt-0">
                    <div className="text-sm text-text-light-secondary dark:text-text-dark-secondary mb-3 whitespace-pre-wrap">
                      {fullMessage}
                    </div>
                    <div className="flex items-center justify-between text-xs text-text-light-secondary dark:text-text-dark-secondary">
                      <span>
                        {new Date(notification.created_at).toLocaleDateString()} at{' '}
                        {new Date(notification.created_at).toLocaleTimeString()}
                      </span>
                      {notification.source && (
                        <span className="px-2 py-0.5 rounded bg-background-light dark:bg-background-dark">
                          {notification.source}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

