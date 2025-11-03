import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Add CORS headers
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.source || typeof body.is_todo !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields: source and is_todo' },
        { 
          status: 400,
          headers: corsHeaders()
        }
      )
    }

    // If is_todo is true, todo_text should be present
    if (body.is_todo && !body.todo_text) {
      return NextResponse.json(
        { error: 'todo_text is required when is_todo is true' },
        { 
          status: 400,
          headers: corsHeaders()
        }
      )
    }

    // Prepare data for Supabase
    const notificationData = {
      source: body.source,
      is_todo: body.is_todo,
      todo_text: body.is_todo ? body.todo_text : null,
      notification: body.notification || null,
      status: body.is_todo ? (body.status || 'new') : null,
      due_date: body.due_date || null,
      created_at: new Date().toISOString(),
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save notification', details: error.message },
        { 
          status: 500,
          headers: corsHeaders()
        }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Notification saved successfully',
        data 
      },
      { 
        status: 201,
        headers: corsHeaders()
      }
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Invalid request body or server error' },
      { 
        status: 400,
        headers: corsHeaders()
      }
    )
  }
}

// Allow GET for health checks
export async function GET() {
  return NextResponse.json(
    { status: 'ok', service: 'n8n webhook endpoint' },
    { headers: corsHeaders() }
  )
}
