# Contact Professionals Feature Documentation

## Overview

The feature enables users to initiate AI-powered conversations with kitchen design professionals. When a user clicks "Contact Professional" from the photo modal, they enter a two-stage flow: initial inquiry → ongoing chat with AI-generated suggestions.

---

## 1. Frontend Components

### ContactPane.tsx
**Path:** `app/components/ContactPane.tsx`

Main chat interface component with:
- **Two phases**: Initial (large textarea with template) → Chat (message history + inline input)
- **State**: `view`, `conversationId`, `messages`, `activeSuggestions`, `projectSummary`, `isSufficient`
- **Features**: Auto-scroll, optimistic updates, quick-reply suggestions, expandable project brief

### PhotoModal.tsx
**Path:** `app/components/PhotoModal.tsx`

Integrates ContactPane and manages:
- `showContact` toggle between photo details and chat
- Fetches latest conversation on load via `api.contact.latest()`
- "Resume Conversation" UI with new message indicators
- Calls `api.contact.markViewed()` to clear notifications

---

## 2. API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/contact/init` | POST | Creates new conversation with first message |
| `/api/contact/chat` | POST | Continues conversation with new message |
| `/api/contact/latest` | GET | Gets most recent conversation with a professional |
| `/api/contact/by-professional` | GET | Same as latest + `has_new_messages` flag |
| `/api/contact/conversation/[id]` | GET | Gets specific conversation by ID |
| `/api/contact/mark-viewed` | POST | Updates `last_viewed_at` timestamp |

### Request/Response Examples

**POST /api/contact/init**
```typescript
// Request
{ professionalId: number, message: string }

// Response
{ id, professional_id, messages[], suggestions[], projectSummary?, isSufficient }
```

**POST /api/contact/chat**
```typescript
// Request
{ conversationId: number, message: string }

// Response
{ message: ChatMessage, suggestions[], projectSummary?, isSufficient }
```

---

## 3. Database Schema

**Location:** `lib/db/schema.ts`

### conversations
```sql
CREATE TABLE conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    professional_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_summary TEXT,                    -- HTML project brief
    last_viewed_at DATETIME,              -- For "new message" detection
    FOREIGN KEY (professional_id) REFERENCES professionals(id)
)
```

### messages
```sql
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
)
```

### Relationships
```
professionals (1) ─── (many) conversations (1) ─── (many) messages
```

---

## 4. Records Created Per Message

### On Initial Contact (`/api/contact/init`):
1. **1 conversation record** - with `professional_id`, `last_summary`
2. **2 message records** - user message (role='user') + AI response (role='assistant')

### On Follow-up (`/api/contact/chat`):
1. **1 user message** - role='user'
2. **1 assistant message** - role='assistant'
3. **conversation.last_summary updated** - if AI provides one

---

## 5. Services Layer

**Location:** `lib/services/chat.ts`

| Function | Purpose |
|----------|---------|
| `createConversation()` | Creates conversation + initial messages atomically |
| `addMessage()` | Adds single message to existing conversation |
| `getConversation()` | Retrieves conversation with all messages |
| `getLatestConversationByProfessionalId()` | Gets most recent conversation |
| `updateConversationSummary()` | Updates `last_summary` field |
| `markConversationAsViewed()` | Updates `last_viewed_at` timestamp |

---

## 6. Gemini AI Integration

**Location:** `lib/ai.ts`

**Model:** Google Gemini 2.0 Flash

### Function Signature
```typescript
generateAIResponse(
    photo: Photo | null,
    history: ChatMessage[],
    professional?: Professional
): Promise<{
    response: string;
    suggestions?: string[];
    isSufficient: boolean;
    projectSummary?: string;
}>
```

### Conversation Strategy
The AI follows **"Breadth → Iterative Depth"**:

1. **Phase 1 (Breadth)**: Briefly touch all aspects—Scope, Budget, Timeline
2. **Phase 2 (Depth)**: Deep-dive one facet at a time after understanding direction

### Response Format (JSON)
```typescript
{
    response: string;        // Max 3 sentences, one question
    suggestions: string[];   // 2-4 quick-reply options
    isSufficient: boolean;   // True when scope/budget/timeline are clear
    projectSummary: string;  // HTML summary (<h4>, <ul>, <li> tags)
}
```

### System Prompt Includes:
- Professional's name, company, rating, review count
- Full conversation history for context
- Instructions for concise, natural responses
- Project summary formatting requirements

### Error Handling:
- Fallback response if API key missing
- Retry message on rate limiting (429)
- Plain text fallback if JSON parsing fails

---

## 7. Complete Data Flow

### Flow 1: User Initiates Contact
```
User clicks "Contact Professional" in PhotoModal
    ↓
ContactPane renders with template message
    ↓
User clicks "Send Message"
    ↓
POST /api/contact/init { professionalId, message }
    ↓
Backend creates conversation + calls generateAIResponse()
    ↓
Frontend displays messages + suggestions + projectSummary
```

### Flow 2: User Continues Conversation
```
User types message and clicks send
    ↓
Message added to UI optimistically
    ↓
POST /api/contact/chat { conversationId, message }
    ↓
Backend adds message → fetches history → generateAIResponse()
    ↓
Frontend adds AI response, updates suggestions
```

### Flow 3: User Resumes Existing Conversation
```
PhotoModal loads → fetches latest conversation
    ↓
Shows "Resume Conversation" with summary
    ↓
User clicks resume → markViewed() called
    ↓
ContactPane loads with initialConversationId
    ↓
Fetches full history and continues chat
```

---

## 8. File Locations Summary

| Component | Path |
|-----------|------|
| Contact Pane UI | `app/components/ContactPane.tsx` |
| Photo Modal | `app/components/PhotoModal.tsx` |
| API Routes | `app/api/contact/*/route.ts` |
| Chat Service | `lib/services/chat.ts` |
| Professionals Service | `lib/services/professionals.ts` |
| AI Integration | `lib/ai.ts` |
| API Client | `lib/api/client.ts` |
| API Config | `lib/api/config.ts` |
| DB Schema | `lib/db/schema.ts` |
