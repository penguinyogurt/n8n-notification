import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { source, messages } = body

    if (!source || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: source and messages array required' },
        { status: 400 }
      )
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      )
    }

    // Sort messages by created_at to ensure chronological order
    const sortedMessages = [...messages]
      .filter((msg: any) => msg.notification || msg.todo_text)
      .sort((a: any, b: any) => {
        const timeA = new Date(a.created_at || 0).getTime()
        const timeB = new Date(b.created_at || 0).getTime()
        return timeA - timeB
      })

    // Prepare messages for summarization - just the text content
    const messageTexts = sortedMessages
      .map((msg: any) => msg.notification || msg.todo_text || '')
      .join('\n\n')

    if (!messageTexts.trim()) {
      return NextResponse.json(
        { error: 'No message content to summarize' },
        { status: 400 }
      )
    }

    // Simple prompt - explicitly note chronological order
    const prompt = `Summarize these ${source} messages concisely in 2-3 sentences. The messages are listed in chronological order (oldest to newest):\n\n${messageTexts}`

    // Call Groq API directly
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 200,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Groq API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to generate summary', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    const summary = data.choices[0]?.message?.content || 'Unable to generate summary'

    return NextResponse.json({
      success: true,
      summary,
      source,
      messageCount: messages.length,
    })
  } catch (error: any) {
    console.error('Groq summarization error:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary', details: error.message },
      { status: 500 }
    )
  }
}

