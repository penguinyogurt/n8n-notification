# N8N Dashboard App

Full-stack dashboard application for n8n agent notifications with Supabase integration. Built with Next.js (App Router) for both frontend and backend API routes.

## Features

### Backend
- Receive webhooks from n8n workflows
- Store notifications in Supabase database
- RESTful API endpoints for frontend integration
- Support for conditional `todo_text` field (only when `is_todo` is true)
- Real-time Supabase subscriptions

### Frontend
- Beautiful, modern dashboard UI
- Real-time updates from Supabase
- Group notifications by source (Email, GitHub, Slack, etc.)
- Search and filter functionality
- Separate To-Do List page
- Kanban-style Task Board with drag-and-click functionality
- Responsive design with dark mode support

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env.local`
3. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Create Database Table

Run this SQL in your Supabase SQL Editor:

```sql
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  is_todo BOOLEAN NOT NULL,
  todo_text TEXT,
  notification TEXT,
  status TEXT CHECK (status IN ('new', 'in_progress', 'completed')),
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to insert/read/delete
-- Note: Service role bypasses RLS, so this is mainly for future frontend use
CREATE POLICY "Allow all operations for service role" 
ON notifications 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create index for better query performance
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_source ON notifications(source);
CREATE INDEX idx_notifications_is_todo ON notifications(is_todo);
CREATE INDEX idx_notifications_status ON notifications(status);
```

**Note:** If you already have the table created, run this migration to add the new columns:

```sql
-- Add status column (for task board)
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('new', 'in_progress', 'completed'));

-- Add due_date column
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ;

-- Create index for status
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
```

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

- **Dashboard**: `http://localhost:3000/` - Main notifications dashboard
- **To-Do List**: `http://localhost:3000/todos` - View all todos
- **Task Board**: `http://localhost:3000/tasks` - Kanban-style task board

## API Endpoints

### POST `/api/webhook`
Receive webhook data from n8n workflows.

**Request Body:**
```json
{
  "source": "Slack",
  "is_todo": true,
  "todo_text": "Send email to boss.",
  "notification": "henriyan28 (henriyan28@gmail.com) says: A new email needs to be sent to the boss"
}
```

**Note:** When `is_todo` is `false`, `todo_text` should not be included (or will be ignored).

**Response:**
```json
{
  "success": true,
  "message": "Notification saved successfully",
  "data": { ... }
}
```

### GET `/api/notifications`
Get all notifications with optional filtering and pagination.

**Query Parameters:**
- `limit` - Number of results (default: all)
- `offset` - Pagination offset
- `source` - Filter by source (e.g., "Slack")
- `is_todo` - Filter by todo status (true/false)

**Example:**
```
GET /api/notifications?limit=10&offset=0&source=Slack&is_todo=true
```

### GET `/api/notifications/[id]`
Get a single notification by ID.

### PATCH `/api/notifications/[id]`
Update a notification by ID.

**Request Body:**
```json
{
  "status": "in_progress",
  "due_date": "2024-12-31T23:59:59Z"
}
```

**Note:** Only `status` and `due_date` can be updated. Status must be one of: `new`, `in_progress`, `completed`.

### DELETE `/api/notifications/[id]`
Delete a notification by ID.

### GET `/api/stats`
Get statistics about notifications (total count, todo count, by source, etc.).

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 100,
    "todos": 45,
    "notifications": 55,
    "bySource": {
      "Slack": 60,
      "Email": 40
    }
  }
}
```

## Real-time Updates (Future Integration)

The backend is set up to work with Supabase real-time subscriptions. To enable real-time in your frontend:

```javascript
import { supabaseClient } from '@/lib/supabase'

const channel = supabaseClient
  .channel('notifications')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'notifications' },
    (payload) => {
      console.log('Change received!', payload)
      // Update your UI
    }
  )
  .subscribe()
```

## N8N Webhook Setup

In your n8n workflow, add an HTTP Request node that sends a POST request to:
```
http://your-domain.com/api/webhook
```

**For local development:**
- If n8n is on the same machine: `http://localhost:3000/api/webhook`
- If n8n is in Docker or remote: Use your machine's IP address or ngrok (see TROUBLESHOOTING.md)

Make sure the request body matches the expected JSON format.

**Having connection issues?** See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common solutions.

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

For deployment platforms like Vercel, the build and deployment process is automatic.
