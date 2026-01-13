import { NextResponse } from 'next/server';
import { getLatestConversationByPhotoId } from '@/lib/services/chat';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const photoId = searchParams.get('photoId');

        if (!photoId) {
            return NextResponse.json({ error: 'Missing photoId' }, { status: 400 });
        }

        const conversation = getLatestConversationByPhotoId(parseInt(photoId, 10));

        if (!conversation) {
            return NextResponse.json({ conversation: null });
        }

        return NextResponse.json({ conversation });
    } catch (error) {
        console.error('Failed to fetch latest conversation:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
