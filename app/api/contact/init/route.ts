import { NextResponse } from 'next/server';
import { createConversation, ChatMessage } from '@/lib/services/chat';
import { getPhotoById } from '@/lib/services/photos';
import { generateAIResponse } from '@/lib/ai';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { photoId, professionalId, message } = body;

        if (!photoId || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const photo = getPhotoById(photoId);
        if (!photo) {
            return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
        }

        // Fetch AI Response for the initial message
        const initialUserMsg: ChatMessage = {
            id: 0, // Placeholder
            role: 'user',
            content: message,
            created_at: new Date().toISOString()
        };

        const aiResponse = await generateAIResponse(photo, [initialUserMsg]);

        // Default professional ID if not provided (mock logic since we don't strictly enforce it in UI yet)
        const profId = professionalId || 1;

        const conversation = createConversation(photoId, profId, message, aiResponse.response, aiResponse.projectSummary);

        return NextResponse.json({
            ...conversation,
            suggestions: aiResponse.suggestions || [],
            projectSummary: aiResponse.projectSummary || null
        });
    } catch (error) {
        console.error('Failed to init conversation:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
