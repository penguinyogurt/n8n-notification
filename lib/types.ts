// Type definitions for notifications

export type TaskStatus = 'new' | 'in_progress' | 'completed'

export interface Notification {
  id: string
  source: string
  is_todo: boolean
  todo_text: string | null
  notification: string | null
  status?: TaskStatus
  due_date?: string | null
  created_at: string
}

export interface WebhookPayload {
  source: string
  is_todo: boolean
  todo_text?: string
  notification?: string
  status?: TaskStatus
  due_date?: string
}
