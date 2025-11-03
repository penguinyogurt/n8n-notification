import { Notification } from '@/lib/types'

interface SourceCardProps {
  source: string
  notifications: Notification[]
  icon: React.ReactNode
  onItemClick?: (notification: Notification) => void
}

export default function SourceCard({ source, notifications, icon, onItemClick }: SourceCardProps) {
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
        <button className="text-text-light-secondary dark:text-text-dark-secondary">
          <span className="material-symbols-outlined text-lg">more_horiz</span>
        </button>
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
            
            return (
              <div
                key={notification.id}
                className={`flex gap-3 rounded-lg border p-3 cursor-pointer hover:opacity-80 transition-opacity ${
                  isMention
                    ? 'border-mention/50 dark:border-mention/50 bg-mention/10 dark:bg-mention/20'
                    : 'border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark'
                }`}
                onClick={() => onItemClick?.(notification)}
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
                  notification.notification?.includes('@') ? (
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDpoVahfqnP4OiLdKoJCaZCqnhEz9EG0RaHwBcAa5iBSA5F7bOOWWmWcKL0mDm_vDwGakuQeH4LYTMSrjtyGKmHbFJdd26rE-1wbvTy8KiU13_S7ZSPyseEZ_7Zy6eU2A0GN3nB_fHYlZGQ0yZF6JfYn-QCTK6IrCL6FIJ59LQOlKdCb7oGQ40Hgs6CUr7cyp23cad27u4mNEI3qEEsp7rOBCryzpkQ1d1M6BEh9X8z3m4WWJdJhcjjJGRmH3BQVVJPFXGGwQopvCdt")' }}></div>
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold text-sm">
                      {initials[0] || '#'}
                    </div>
                  )
                )}
                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  <p className="truncate text-sm font-medium text-text-light-primary dark:text-text-dark-primary">
                    {notification.is_todo && notification.todo_text ? notification.todo_text : sender || 'Notification'}
                  </p>
                  <p className="truncate text-xs text-text-light-secondary dark:text-text-dark-secondary">
                    {notification.is_todo && notification.todo_text ? 'Todo item' : message}
                  </p>
                </div>
                <button className="shrink-0 text-xs font-medium text-primary hover:underline">
                  {notification.is_todo ? 'View' : 'Reply'}
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
