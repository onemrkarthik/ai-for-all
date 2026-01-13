import { NextRequest, NextResponse } from 'next/server';
import { getPhotos, getFilteredPhotos, getFilteredPhotosCount, PhotoFilters } from '@/lib/services/photos';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const filtersParam = searchParams.get('filters');

    // Parse filters from query string
    let filters: PhotoFilters | undefined;
    if (filtersParam) {
        try {
            filters = JSON.parse(filtersParam);
        } catch {
            // Invalid JSON, ignore filters
        }
    }

    const photos = filters
        ? getFilteredPhotos({ offset, limit, filters })
        : getPhotos({ offset, limit });

    // Include total count for filtered results
    const totalCount = filters ? getFilteredPhotosCount(filters) : undefined;

    return NextResponse.json({
        photos,
        totalCount,
        offset,
        limit
    });
}
