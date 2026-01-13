import { NextResponse } from 'next/server';
import { addMessage, getConversation, updateConversationSummary } from '@/lib/services/chat';
import { getPhotoById } from '@/lib/services/photos';
import { generateAIResponse } from '@/lib/ai';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { conversationId, message } = body;

        if (!conversationId || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Get History
        const conversation = getConversation(conversationId);
        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        const photo = getPhotoById(conversation.photo_id);
        if (!photo) {
            return NextResponse.json({ error: 'Contextual photo not found' }, { status: 404 });
        }

        // 2. Add User Message
        addMessage(conversationId, message, 'user');

        // 3. Prepare Updated History for AI
        const updatedConversation = getConversation(conversationId);
        if (!updatedConversation) throw new Error("Database sync error");

        // 4. Generate AI Response
        const aiResult = await generateAIResponse(photo, updatedConversation.messages);

        // 5. Save AI Message & Update Summary
        const aiMessage = addMessage(conversationId, aiResult.response, 'assistant');
        if (aiResult.projectSummary) {
            updateConversationSummary(conversationId, aiResult.projectSummary);
        }

        return NextResponse.json({
            message: aiMessage,
            suggestions: aiResult.suggestions || [],
            isSufficient: aiResult.isSufficient,
            projectSummary: aiResult.projectSummary || null
        });

    } catch (error) {
        console.error('Failed to process chat:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
