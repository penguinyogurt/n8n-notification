import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET statistics about notifications
export async function GET() {
  try {
    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      throw countError
    }

    // Get todo count
    const { count: todoCount, error: todoError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_todo', true)

    if (todoError) {
      throw todoError
    }

    // Get notifications count (non-todo)
    const { count: notificationCount, error: notifError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_todo', false)

    if (notifError) {
      throw notifError
    }

    // Get counts by source
    const { data: sourceData, error: sourceError } = await supabase
      .from('notifications')
      .select('source')

    if (sourceError) {
      throw sourceError
    }

    const sourceCounts: Record<string, number> = {}
    sourceData?.forEach((item) => {
      sourceCounts[item.source] = (sourceCounts[item.source] || 0) + 1
    })

    return NextResponse.json({
      success: true,
      data: {
        total: totalCount || 0,
        todos: todoCount || 0,
        notifications: notificationCount || 0,
        bySource: sourceCounts,
      },
    })
  } catch (error: any) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats', details: error.message },
      { status: 500 }
    )
  }
}
