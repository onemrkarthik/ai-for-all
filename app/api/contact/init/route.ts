import { NextResponse } from 'next/server';
import { createConversation, ChatMessage } from '@/lib/services/chat';
import { generateAIResponse } from '@/lib/ai';
import { getProfessionalById } from '@/lib/services/professionals';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { professionalId, message } = body;

        if (!professionalId || !message) {
            return NextResponse.json({ error: 'Missing required fields (professionalId, message)' }, { status: 400 });
        }

        // Verify professional exists
        const professional = getProfessionalById(professionalId);
        if (!professional) {
            return NextResponse.json({ error: 'Professional not found' }, { status: 404 });
        }

        // Fetch AI Response for the initial message
        const initialUserMsg: ChatMessage = {
            id: 0, // Placeholder
            role: 'user',
            content: message,
            created_at: new Date().toISOString()
        };

        // Pass professional context to AI instead of photo context
        const aiResponse = await generateAIResponse(null, [initialUserMsg], professional);

        const conversation = createConversation(professionalId, message, aiResponse.response, aiResponse.projectSummary);

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
