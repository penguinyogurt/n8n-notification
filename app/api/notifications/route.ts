import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET all notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')
    const source = searchParams.get('source')
    const isTodo = searchParams.get('is_todo')

    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (source) {
      query = query.eq('source', source)
    }

    if (isTodo !== null) {
      query = query.eq('is_todo', isTodo === 'true')
    }

    // Apply pagination
    if (limit) {
      query = query.limit(parseInt(limit))
    }

    if (offset) {
      query = query.range(parseInt(offset), parseInt(offset) + (limit ? parseInt(limit) - 1 : 9))
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch notifications', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      count: data?.length || 0,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
