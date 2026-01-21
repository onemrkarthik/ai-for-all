# Contact API

AI-powered consultation chat endpoints for connecting users with kitchen design professionals.

## Overview

The Contact API provides endpoints for:
- Initializing AI-powered consultations
- Sending and receiving chat messages
- Managing conversation state
- Tracking message read status

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/contact/init` | POST | Initialize new consultation |
| `/api/contact/chat` | POST | Send chat message |
| `/api/contact/latest` | GET | Get latest conversation for professional |
| `/api/contact/by-professional` | GET | Get conversation with messages |
| `/api/contact/conversation/[id]` | GET | Get specific conversation |
| `/api/contact/mark-viewed` | POST | Mark messages as viewed |

---

## POST /api/contact/init

Initialize a new AI consultation conversation with a professional.

### Request Body

```json
{
  "professionalId": 5,
  "message": "I'm interested in a modern kitchen remodel for my 200 sq ft kitchen."
}
```

### Response (200 OK)

```json
{
  "id": 123,
  "professional_id": 5,
  "messages": [
    {
      "id": 1,
      "role": "user",
      "content": "I'm interested in a modern kitchen remodel...",
      "created_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "role": "assistant",
      "content": "I'd be happy to help you with your kitchen remodel...",
      "created_at": "2024-01-15T10:30:01Z"
    }
  ],
  "suggestions": [
    "What's your budget range?",
    "Do you prefer an open or closed layout?",
    "What appliances are you looking to include?"
  ],
  "projectSummary": "Modern kitchen remodel, 200 sq ft"
}
```

### Error Responses

| Status | Error |
|--------|-------|
| 400 | Missing required fields (professionalId, message) |
| 404 | Professional not found |
| 500 | Internal Server Error |

### Implementation

```typescript
export async function POST(request: Request) {
  const { professionalId, message } = await request.json();

  // Verify professional exists
  const professional = getProfessionalById(professionalId);

  // Generate AI response
  const aiResponse = await generateAIResponse(null, [initialUserMsg], professional);

  // Create conversation in database
  const conversation = createConversation(
    professionalId,
    message,
    aiResponse.response,
    aiResponse.projectSummary
  );

  return NextResponse.json({
    ...conversation,
    suggestions: aiResponse.suggestions,
    projectSummary: aiResponse.projectSummary
  });
}
```

---

## POST /api/contact/chat

Send a message in an existing conversation and receive an AI response.

### Request Body

```json
{
  "conversationId": 123,
  "message": "My budget is around $50,000."
}
```

### Response (200 OK)

```json
{
  "message": {
    "id": 5,
    "role": "assistant",
    "content": "A $50,000 budget gives you great options...",
    "created_at": "2024-01-15T10:35:00Z"
  },
  "suggestions": [
    "Would you like to see some cabinet options?",
    "What countertop materials interest you?"
  ],
  "isSufficient": false,
  "projectSummary": "Modern kitchen remodel, 200 sq ft, $50k budget"
}
```

### Error Responses

| Status | Error |
|--------|-------|
| 400 | Missing required fields |
| 404 | Conversation not found / Professional not found |
| 500 | Internal Server Error |

### Implementation Flow

1. Get conversation history
2. Get professional context
3. Add user message to database
4. Generate AI response with context
5. Save AI message
6. Update project summary if provided
7. Return response with suggestions

---

## GET /api/contact/latest

Get the latest conversation for a professional (without full messages).

### Query Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `professionalId` | Yes | Professional's numeric ID |

### Request

```
GET /api/contact/latest?professionalId=5
```

### Response (200 OK)

```json
{
  "conversation": {
    "id": 123,
    "professional_id": 5,
    "last_summary": "Modern kitchen remodel, 200 sq ft, $50k budget",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### No Conversation

```json
{
  "conversation": null
}
```

---

## GET /api/contact/by-professional

Get the latest conversation with full messages and new message indicator.

### Query Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `professionalId` | Yes | Professional's numeric ID |

### Request

```
GET /api/contact/by-professional?professionalId=5
```

### Response (200 OK)

```json
{
  "conversation": {
    "id": 123,
    "professional_id": 5,
    "last_summary": "Modern kitchen remodel discussion",
    "last_viewed_at": "2024-01-15T10:30:00Z",
    "has_new_messages": true,
    "messages": [
      {
        "id": 1,
        "role": "user",
        "content": "I'm interested in a modern kitchen...",
        "created_at": "2024-01-15T10:30:00Z"
      },
      {
        "id": 2,
        "role": "assistant",
        "content": "I'd be happy to help...",
        "created_at": "2024-01-15T10:30:01Z"
      }
    ]
  }
}
```

### SQL Query

```sql
SELECT c.*,
       (SELECT COUNT(*)
        FROM messages
        WHERE conversation_id = c.id
        AND role = 'assistant'
        AND created_at > COALESCE(c.last_viewed_at, '1900-01-01')) as new_message_count
FROM conversations c
WHERE c.professional_id = ?
ORDER BY c.created_at DESC
LIMIT 1
```

---

## GET /api/contact/conversation/[id]

Get a specific conversation by ID with all messages.

### URL Parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Conversation's numeric ID |

### Request

```
GET /api/contact/conversation/123
```

### Response (200 OK)

```json
{
  "conversation": {
    "id": 123,
    "professional_id": 5,
    "last_summary": "Modern kitchen remodel",
    "messages": [...]
  }
}
```

### Error Responses

| Status | Error |
|--------|-------|
| 400 | Invalid conversation ID |
| 404 | Conversation not found |
| 500 | Failed to fetch conversation |

---

## POST /api/contact/mark-viewed

Mark a conversation as viewed to reset the "new messages" indicator.

### Request Body

```json
{
  "conversationId": 123
}
```

### Response (200 OK)

```json
{
  "success": true
}
```

### Error Responses

| Status | Error |
|--------|-------|
| 400 | Conversation ID is required |
| 500 | Failed to mark conversation as viewed |

---

## AI Integration

The contact endpoints use Google Gemini AI via `@/lib/ai`:

```typescript
import { generateAIResponse } from '@/lib/ai';

const aiResult = await generateAIResponse(
  photoContext,      // Photo being discussed (optional)
  messageHistory,    // Array of previous messages
  professional       // Professional context
);

// Returns:
// {
//   response: string,         // AI message content
//   suggestions: string[],    // Follow-up suggestions
//   isSufficient: boolean,    // Has enough info?
//   projectSummary: string    // Updated project summary
// }
```

## Database Schema

### conversations table
```sql
CREATE TABLE conversations (
  id INTEGER PRIMARY KEY,
  professional_id INTEGER,
  last_summary TEXT,
  last_viewed_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (professional_id) REFERENCES professionals(id)
);
```

### messages table
```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY,
  conversation_id INTEGER,
  role TEXT CHECK(role IN ('user', 'assistant')),
  content TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);
```

## Type-Safe Client Usage

```typescript
import { api } from '@/lib/api';

// Initialize conversation
const conversation = await api.contact.init(professionalId, message);

// Send message
const response = await api.contact.chat(conversationId, message);

// Get conversation
const conv = await api.contact.getByProfessional(professionalId);

// Mark as viewed
await api.contact.markViewed(conversationId);
```
