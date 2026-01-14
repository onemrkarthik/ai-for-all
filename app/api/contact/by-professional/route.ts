import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const getLatestConversationByProfessionalStmt = db.prepare(`
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
`);

const getMessagesStmt = db.prepare(`
    SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC
`);

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const professionalId = searchParams.get('professionalId');

        if (!professionalId) {
            return NextResponse.json(
                { error: 'Professional ID is required' },
                { status: 400 }
            );
        }

        const conversation = getLatestConversationByProfessionalStmt.get(parseInt(professionalId)) as any;

        if (!conversation) {
            return NextResponse.json({ conversation: null });
        }

        const messages = getMessagesStmt.all(conversation.id) as any[];

        return NextResponse.json({
            conversation: {
                id: conversation.id,
                professional_id: conversation.professional_id,
                last_summary: conversation.last_summary,
                last_viewed_at: conversation.last_viewed_at,
                has_new_messages: conversation.new_message_count > 0,
                messages: messages.map(m => ({
                    id: m.id,
                    role: m.role,
                    content: m.content,
                    created_at: m.created_at
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching conversation:', error);
        return NextResponse.json(
            { error: 'Failed to fetch conversation' },
            { status: 500 }
        );
    }
}
