import { NextRequest, NextResponse } from 'next/server';
import { getLatestConversationByProfessionalId } from '@/lib/services/chat';

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

        const conversation = getLatestConversationByProfessionalId(parseInt(professionalId));

        if (!conversation) {
            return NextResponse.json({ conversation: null });
        }

        return NextResponse.json({
            conversation: {
                id: conversation.id,
                professional_id: conversation.professional_id,
                last_summary: conversation.last_summary,
                last_viewed_at: conversation.last_viewed_at,
                has_new_messages: conversation.has_new_messages,
                messages: conversation.messages.map(m => ({
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
