import { NextRequest, NextResponse } from 'next/server';
import { markConversationAsViewed } from '@/lib/services/chat';

export async function POST(request: NextRequest) {
    try {
        const { conversationId } = await request.json();

        if (!conversationId) {
            return NextResponse.json(
                { error: 'Conversation ID is required' },
                { status: 400 }
            );
        }

        markConversationAsViewed(conversationId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error marking conversation as viewed:', error);
        return NextResponse.json(
            { error: 'Failed to mark conversation as viewed' },
            { status: 500 }
        );
    }
}
