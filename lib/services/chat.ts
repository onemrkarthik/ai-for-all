import { db } from '@/lib/db';
import type { ConversationRow, MessageRow, NewMessagesCountRow } from '@/lib/db/types';

export interface ChatMessage {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
}

export interface Conversation {
    id: number;
    professional_id: number;
    last_summary?: string;
    last_viewed_at?: string;
    has_new_messages?: boolean;
    messages: ChatMessage[];
}

const createConversationStmt = db.prepare(`
    INSERT INTO conversations (professional_id, last_summary)
    VALUES (?, ?)
`);

const insertMessageStmt = db.prepare(`
    INSERT INTO messages (conversation_id, role, content)
    VALUES (?, ?, ?)
`);

const getConversationStmt = db.prepare(`
    SELECT * FROM conversations WHERE id = ?
`);

const getLatestConversationByProfessionalStmt = db.prepare(`
    SELECT * FROM conversations
    WHERE professional_id = ?
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

export function createConversation(professionalId: number, userMessage: string, aiResponse: string, summary?: string): Conversation {
    // Transaction to ensure atomicity
    const convoId = db.transaction(() => {
        const info = createConversationStmt.run(professionalId, summary || null);
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

export function getLatestConversationByProfessionalId(professionalId: number): Conversation | null {
    const convo = getLatestConversationByProfessionalStmt.get(professionalId) as ConversationRow | undefined;
    if (!convo) return null;

    const messages = getMessagesStmt.all(convo.id) as MessageRow[];

    // Check if there are new messages from the professional
    const newMessagesResult = checkNewMessagesStmt.get(convo.id, convo.id) as NewMessagesCountRow | undefined;
    const hasNewMessages = (newMessagesResult?.count ?? 0) > 0;

    return {
        id: convo.id,
        professional_id: convo.professional_id,
        last_summary: convo.last_summary ?? undefined,
        last_viewed_at: convo.last_viewed_at ?? undefined,
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
    const convo = getConversationStmt.get(conversationId) as ConversationRow | undefined;
    if (!convo) return null;

    const messages = getMessagesStmt.all(conversationId) as MessageRow[];

    // Check if there are new messages from the professional
    const newMessagesResult = checkNewMessagesStmt.get(conversationId, conversationId) as NewMessagesCountRow | undefined;
    const hasNewMessages = (newMessagesResult?.count ?? 0) > 0;

    return {
        id: convo.id,
        professional_id: convo.professional_id,
        last_summary: convo.last_summary ?? undefined,
        last_viewed_at: convo.last_viewed_at ?? undefined,
        has_new_messages: hasNewMessages,
        messages
    };
}

export function markConversationAsViewed(conversationId: number): void {
    markConversationViewedStmt.run(conversationId);
}
