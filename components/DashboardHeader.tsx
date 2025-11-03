'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function DashboardHeader({ onSearchChange }: { onSearchChange?: (query: string) => void }) {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const pathname = usePathname()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearchChange?.(query)
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border-light dark:border-border-dark bg-card-light/80 dark:bg-card-dark/80 px-4 sm:px-6 lg:px-8 backdrop-blur-sm">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="size-8 text-primary">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary">Unify</h1>
        </div>
        <nav className="flex items-center gap-2 rounded-lg bg-background-light dark:bg-background-dark p-1">
          <button 
            onClick={() => router.push('/')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm ${
              pathname === '/' 
                ? 'bg-card-light dark:bg-card-dark font-semibold text-text-light-primary dark:text-text-dark-primary shadow-sm' 
                : 'font-medium text-text-light-secondary dark:text-text-dark-secondary hover:text-text-light-primary dark:hover:text-text-dark-primary'
            }`}
          >
            <span className="material-symbols-outlined text-base">dashboard</span>
            Dashboard
          </button>
          <button 
            onClick={() => router.push('/todos')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm ${
              pathname === '/todos' 
                ? 'bg-card-light dark:bg-card-dark font-semibold text-text-light-primary dark:text-text-dark-primary shadow-sm' 
                : 'font-medium text-text-light-secondary dark:text-text-dark-secondary hover:text-text-light-primary dark:hover:text-text-dark-primary'
            }`}
          >
            <span className="material-symbols-outlined text-base">task_alt</span>
            To-Do List
          </button>
          <button 
            onClick={() => router.push('/tasks')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm ${
              pathname === '/tasks' 
                ? 'bg-card-light dark:bg-card-dark font-semibold text-text-light-primary dark:text-text-dark-primary shadow-sm' 
                : 'font-medium text-text-light-secondary dark:text-text-dark-secondary hover:text-text-light-primary dark:hover:text-text-dark-primary'
            }`}
          >
            <span className="material-symbols-outlined text-base">view_kanban</span>
            Task Board
          </button>
        </nav>
      </div>
      <div className="flex flex-1 items-center justify-end gap-4">
        <label className="relative hidden h-10 w-full max-w-sm md:flex">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="material-symbols-outlined text-text-light-secondary dark:text-text-dark-secondary">search</span>
          </div>
          <input
            className="form-input h-full w-full rounded-lg border-none bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary placeholder:text-text-light-secondary dark:placeholder:text-text-dark-secondary pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Search updates..."
            type="search"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </label>
        <div className="flex gap-2">
          <button className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
        <div className="h-10 w-10 shrink-0 rounded-full bg-cover bg-center" data-alt="Alex's user profile picture" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCHfpyPqD7zXnj6TUu1O8I6p368jXCD2enfTNgfIpmciNcY6QCPFHix9ZadhUXfb9-VIAbKz-2rvG3kTDiipIXvhTs3LBfOBsUIL7hVOrf8oxu0KpqjklMFp_qzMK9Awv2oq1NpVJhf2r2krbLxy1LZW8fMZHLoPR4MKvH-KQL3QYUdKg_md4h1Ya2v306_FLmD3z7JWB3bVG0CWQSwNrKiEdjzfmyvlpQooOAxWxR8AD2M5I6MGmwEAsS9LTwGE_uDxhiuuqTAb37l")' }}></div>
      </div>
    </header>
  )
}
