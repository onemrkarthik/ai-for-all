import { db } from '@/lib/db';

export interface ChatMessage {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
}

export interface Conversation {
    id: number;
    photo_id: number;
    professional_id: number;
    last_summary?: string;
    last_viewed_at?: string;
    has_new_messages?: boolean;
    messages: ChatMessage[];
}

const createConversationStmt = db.prepare(`
    INSERT INTO conversations (photo_id, professional_id, last_summary)
    VALUES (?, ?, ?)
`);

const insertMessageStmt = db.prepare(`
    INSERT INTO messages (conversation_id, role, content)
    VALUES (?, ?, ?)
`);

const getConversationStmt = db.prepare(`
    SELECT * FROM conversations WHERE id = ?
`);

const getLatestConversationByPhotoStmt = db.prepare(`
    SELECT * FROM conversations 
    WHERE photo_id = ? 
    ORDER BY created_at DESC 
    LIMIT 1
`);

const updateSummaryStmt = db.prepare(`
    UPDATE conversations SET last_summary = ? WHERE id = ?
`);

const getMessagesStmt = db.prepare(`
    SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC
`);

const checkNewMessagesStmt = db.prepare(`
    SELECT COUNT(*) as count
    FROM messages
    WHERE conversation_id = ?
    AND role = 'assistant'
    AND created_at > COALESCE((SELECT last_viewed_at FROM conversations WHERE id = ?), '1900-01-01')
`);

const markConversationViewedStmt = db.prepare(`
    UPDATE conversations
    SET last_viewed_at = CURRENT_TIMESTAMP
    WHERE id = ?
`);

export function createConversation(photoId: number, professionalId: number, userMessage: string, aiResponse: string, summary?: string): Conversation {
    // Transaction to ensure atomicity
    const convoId = db.transaction(() => {
        const info = createConversationStmt.run(photoId, professionalId, summary || null);
        const conversationId = info.lastInsertRowid as number;

        insertMessageStmt.run(conversationId, 'user', userMessage);
        insertMessageStmt.run(conversationId, 'assistant', aiResponse);

        return conversationId;
    })();

    return getConversation(convoId)!;
}

export function updateConversationSummary(conversationId: number, summary: string) {
    updateSummaryStmt.run(summary, conversationId);
}

export function getLatestConversationByPhotoId(photoId: number): Conversation | null {
    const convo = getLatestConversationByPhotoStmt.get(photoId) as any;
    if (!convo) return null;

    const messages = getMessagesStmt.all(convo.id) as ChatMessage[];

    // Check if there are new messages from the professional
    const newMessagesResult = checkNewMessagesStmt.get(convo.id, convo.id) as any;
    const hasNewMessages = newMessagesResult?.count > 0;

    return {
        id: convo.id,
        photo_id: convo.photo_id,
        professional_id: convo.professional_id,
        last_summary: convo.last_summary,
        last_viewed_at: convo.last_viewed_at,
        has_new_messages: hasNewMessages,
        messages
    };
}

export function addMessage(conversationId: number, content: string, role: 'user' | 'assistant' = 'user'): ChatMessage {
    const info = insertMessageStmt.run(conversationId, role, content);
    return {
        id: info.lastInsertRowid as number,
        role,
        content,
        created_at: new Date().toISOString() // Approximate
    };
}

export function getConversation(conversationId: number): Conversation | null {
    const convo = getConversationStmt.get(conversationId) as any;
    if (!convo) return null;

    const messages = getMessagesStmt.all(conversationId) as ChatMessage[];

    // Check if there are new messages from the professional
    const newMessagesResult = checkNewMessagesStmt.get(conversationId, conversationId) as any;
    const hasNewMessages = newMessagesResult?.count > 0;

    return {
        id: convo.id,
        photo_id: convo.photo_id,
        professional_id: convo.professional_id,
        last_summary: convo.last_summary,
        last_viewed_at: convo.last_viewed_at,
        has_new_messages: hasNewMessages,
        messages
    };
}

export function markConversationAsViewed(conversationId: number): void {
    markConversationViewedStmt.run(conversationId);
}
