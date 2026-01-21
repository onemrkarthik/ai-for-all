# API Routes

This directory contains all API endpoints for the application using Next.js Route Handlers.

## API Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/feed` | GET | List photos with pagination and filtering |
| `/api/photos/[id]` | GET | Get single photo by ID |
| `/api/professionals/[id]` | GET | Get professional details |
| `/api/contact/init` | POST | Initialize AI consultation |
| `/api/contact/chat` | POST | Send chat message |
| `/api/contact/latest` | GET | Get latest conversation |
| `/api/contact/by-professional` | GET | Get conversation by professional |
| `/api/contact/conversation/[id]` | GET | Get specific conversation |
| `/api/contact/mark-viewed` | POST | Mark messages as viewed |

## Directory Structure

```
api/
├── README.md                    # This file
├── feed/
│   ├── README.md
│   └── route.ts                 # Photo feed endpoint
├── photos/
│   ├── README.md
│   └── [id]/
│       └── route.ts             # Single photo endpoint
├── professionals/
│   ├── README.md
│   └── [id]/
│       └── route.ts             # Professional details
└── contact/
    ├── README.md
    ├── init/
    │   └── route.ts             # Initialize conversation
    ├── chat/
    │   └── route.ts             # Send message
    ├── latest/
    │   └── route.ts             # Get latest conversation
    ├── by-professional/
    │   └── route.ts             # Get by professional ID
    ├── conversation/
    │   └── [id]/
    │       └── route.ts         # Get conversation by ID
    └── mark-viewed/
        └── route.ts             # Mark as viewed
```

## Type-Safe API Client

Instead of using raw `fetch`, use the typed API client from `@/lib/api`:

```typescript
import { api } from '@/lib/api';

// Photos
const photo = await api.photos.get(123);
const feed = await api.feed.list({ offset: 0, limit: 20 });

// Professionals
const professional = await api.professionals.get(5);

// Contact/Chat
const conversation = await api.contact.init(professionalId, message);
const response = await api.contact.chat(conversationId, message);
```

## Common Response Patterns

### Success Response
```json
{
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message",
  "status": 400 | 404 | 500
}
```

## Authentication

Currently, the API does not require authentication. All endpoints are public.

## Related Documentation

- [Feed API](./feed/README.md)
- [Photos API](./photos/README.md)
- [Professionals API](./professionals/README.md)
- [Contact API](./contact/README.md)
