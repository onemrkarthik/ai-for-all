import { NextResponse } from 'next/server';
import { getLatestConversationByProfessionalId } from '@/lib/services/chat';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const professionalId = searchParams.get('professionalId');

        if (!professionalId) {
            return NextResponse.json({ error: 'Missing professionalId' }, { status: 400 });
        }

        const conversation = getLatestConversationByProfessionalId(parseInt(professionalId, 10));

        if (!conversation) {
            return NextResponse.json({ conversation: null });
        }

        return NextResponse.json({ conversation });
    } catch (error) {
        console.error('Failed to fetch latest conversation:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
