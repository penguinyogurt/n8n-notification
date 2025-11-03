'use client'

import { useEffect, useState } from 'react'
import DashboardHeader from '@/components/DashboardHeader'
import { Notification } from '@/lib/types'
import { supabaseClient } from '@/lib/supabase'

export default function TodosPage() {
  const [todos, setTodos] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/notifications?is_todo=true&limit=100')
      const data = await response.json()
      if (data.success) {
        setTodos(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching todos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTodo = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setTodos(todos.filter((todo) => todo.id !== id))
      }
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  useEffect(() => {
    fetchTodos()

    // Set up real-time subscription
    const channel = supabaseClient
      .channel('todos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: 'is_todo=eq.true',
        },
        (payload) => {
          console.log('Real-time todo update:', payload)
          fetchTodos()
        }
      )
      .subscribe()

    return () => {
      supabaseClient.removeChannel(channel)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          <p className="text-text-light-secondary dark:text-text-dark-secondary">Loading todos...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-tighter text-text-light-primary dark:text-text-dark-primary">
            To-Do List
          </h1>
          <p className="text-base text-text-light-secondary dark:text-text-dark-secondary">
            {todos.length} todo{todos.length !== 1 ? 's' : ''} remaining
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {todos.length === 0 ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <p className="text-text-light-secondary dark:text-text-dark-secondary">
                No todos yet. Create one in your n8n workflow!
              </p>
            </div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className="rounded-xl bg-card-light dark:bg-card-dark p-4 border border-border-light dark:border-border-dark"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="material-symbols-outlined text-primary">task_alt</span>
                    <span className="text-xs font-medium text-text-light-secondary dark:text-text-dark-secondary">
                      {todo.source}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="text-text-light-secondary dark:text-text-dark-secondary hover:text-red-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
                <p className="text-base font-medium text-text-light-primary dark:text-text-dark-primary mb-2">
                  {todo.todo_text}
                </p>
                {todo.notification && (
                  <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
                    {todo.notification}
                  </p>
                )}
                <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary mt-3">
                  {new Date(todo.created_at).toLocaleDateString()} at{' '}
                  {new Date(todo.created_at).toLocaleTimeString()}
                </p>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
