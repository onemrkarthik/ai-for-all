import { NextRequest, NextResponse } from 'next/server';
import { getPhotoById } from '@/lib/services/photos';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // In Next.js 15+, params is a Promise
    const id = parseInt((await params).id, 10);

    if (isNaN(id)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const photo = getPhotoById(id);

    if (!photo) {
        return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    return NextResponse.json(photo);
}
