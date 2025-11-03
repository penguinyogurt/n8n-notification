'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Notification, TaskStatus } from '@/lib/types'
import { supabaseClient } from '@/lib/supabase'

export default function TasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/notifications?is_todo=true&limit=100')
      const data = await response.json()
      if (data.success) {
        setTasks(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const response = await fetch(`/api/notifications/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, status: newStatus } : task
          )
        )
      }
    } catch (error) {
      console.error('Error updating task status:', error)
    }
  }

  useEffect(() => {
    fetchTasks()

    // Set up real-time subscription
    const channel = supabaseClient
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: 'is_todo=eq.true',
        },
        (payload) => {
          console.log('Real-time task update:', payload)
          fetchTasks()
        }
      )
      .subscribe()

    return () => {
      supabaseClient.removeChannel(channel)
    }
  }, [])

  // Group tasks by status
  const tasksByStatus = {
    new: tasks.filter((task) => (task.status || 'new') === 'new'),
    in_progress: tasks.filter((task) => task.status === 'in_progress'),
    completed: tasks.filter((task) => task.status === 'completed'),
  }

  const getDaysUntilDue = (createdAt: string, days?: number): string => {
    if (!days) return ''
    const dueDate = new Date(createdAt)
    dueDate.setDate(dueDate.getDate() + days)
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Overdue'
    if (diffDays === 0) return 'Due today'
    if (diffDays === 1) return 'Due: 1 day'
    if (diffDays < 7) return `Due: ${diffDays} days`
    if (diffDays < 14) return 'Due: 1 week'
    return `Due: ${Math.ceil(diffDays / 7)} weeks`
  }

  const TaskCard = ({ task }: { task: Notification }) => {
    const status = (task.status || 'new') as TaskStatus
    const isCompleted = status === 'completed'
    
    // Parse due date from notification if available, or estimate from created_at
    const dueInfo = task.notification?.match(/due[:\s]+(\d+)\s*(day|week)s?/i)
    const days = dueInfo ? parseInt(dueInfo[1]) * (dueInfo[2].toLowerCase() === 'week' ? 7 : 1) : undefined
    const dueText = getDaysUntilDue(task.created_at, days)

    return (
      <div
        className={`bg-white dark:bg-background-dark border border-gray-200 dark:border-white/10 rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
          isCompleted ? 'opacity-60' : ''
        }`}
        onClick={() => {
          if (!isCompleted) {
            const nextStatus: TaskStatus = status === 'new' ? 'in_progress' : 'completed'
            updateTaskStatus(task.id, nextStatus)
          }
        }}
      >
        <h3
          className={`text-gray-900 dark:text-gray-50 font-bold mb-2 ${
            isCompleted ? 'line-through' : ''
          }`}
        >
          {task.todo_text || 'Untitled Task'}
        </h3>
        <p
          className={`text-gray-500 dark:text-gray-400 text-sm mb-4 ${
            isCompleted ? 'line-through' : ''
          }`}
        >
          {task.notification || 'No description'}
        </p>
        <div className="flex items-center justify-between">
          {isCompleted ? (
            <span className="text-sm text-green-600 dark:text-green-500">Completed</span>
          ) : dueText ? (
            <span className="text-sm text-gray-500 dark:text-gray-400">{dueText}</span>
          ) : (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(task.created_at).toLocaleDateString()}
            </span>
          )}
          <div className="flex -space-x-2">
            {/* Avatar placeholders - in a real app, you'd fetch these from user data */}
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-6 border-2 border-white dark:border-background-dark"
              style={{
                backgroundImage: `url("https://ui-avatars.com/api/?name=${encodeURIComponent(
                  task.source
                )}&background=137fec&color=fff")`,
              }}
            ></div>
          </div>
        </div>
      </div>
    )
  }

  const Column = ({
    title,
    count,
    status,
    tasks,
  }: {
    title: string
    count: number
    status: TaskStatus
    tasks: Notification[]
  }) => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-gray-900 dark:text-gray-50 text-lg font-bold">
            {title} ({count})
          </h2>
          <button
            className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
            onClick={() => {
              // Could open a modal to create a new task
              console.log('Add new task to', status)
            }}
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {tasks.length === 0 ? (
            <div className="bg-white dark:bg-background-dark border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <p className="text-gray-400 dark:text-gray-500 text-sm">No tasks</p>
            </div>
          ) : (
            tasks.map((task) => <TaskCard key={task.id} task={task} />)
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <p className="text-gray-500 dark:text-gray-400">Loading tasks...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="text-sm font-medium">Back to Centralized Update Dashboard</span>
            </button>
          </div>
          <div className="flex flex-col gap-1 mb-8">
            <h1 className="text-gray-900 dark:text-gray-50 text-4xl font-black leading-tight tracking-[-0.033em]">
              Task Board
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">
              Organize and track your team's progress.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Column
              title="New Tasks"
              count={tasksByStatus.new.length}
              status="new"
              tasks={tasksByStatus.new}
            />
            <Column
              title="In Progress"
              count={tasksByStatus.in_progress.length}
              status="in_progress"
              tasks={tasksByStatus.in_progress}
            />
            <Column
              title="Completed Tasks"
              count={tasksByStatus.completed.length}
              status="completed"
              tasks={tasksByStatus.completed}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
