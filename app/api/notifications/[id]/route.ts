import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET single notification by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        )
      }
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch notification', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}

// PATCH update notification by ID
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const updates: Record<string, any> = {}

    // Allow updating status for todos
    if (body.status !== undefined) {
      if (!['new', 'in_progress', 'completed'].includes(body.status)) {
        return NextResponse.json(
          { error: 'Invalid status. Must be: new, in_progress, or completed' },
          { status: 400 }
        )
      }
      updates.status = body.status
    }

    // Allow updating due_date
    if (body.due_date !== undefined) {
      updates.due_date = body.due_date
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('notifications')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to update notification', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Notification updated successfully',
      data,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}

// DELETE notification by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to delete notification', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully',
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
