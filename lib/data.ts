import { getPhotos, getFilteredPhotosCount, PhotoGridItem } from '@/lib/services/photos';

// Export GridItem for UI components
export type Item = PhotoGridItem;

export interface PaginatedResult {
    photos: Item[];
    totalCount: number;
    page: number;
    totalPages: number;
    itemsPerPage: number;
}

export async function fetchLiveStreamData(offset: number, limit: number, delayMs: number): Promise<Item[]> {
    // Simulate network latency specific to this batch
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    // Fetch directly from the service layer (DB)
    // In a real "separated" backend, we might fetch from the HTTP API here:
    // const res = await fetch(\`http://localhost:3000/api/feed?offset=\${offset}&limit=\${limit}\`);
    // return res.json();

    // However, since we are Server Components (or server functions), we can
    // skip the HTTP network hop and call the controller directly for performance,
    // while still keeping the architecture "service-based".
    return getPhotos({ offset, limit });
}

export async function fetchPaginatedPhotos(page: number, itemsPerPage: number = 30): Promise<PaginatedResult> {
    const offset = (page - 1) * itemsPerPage;
    const totalCount = getFilteredPhotosCount();
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    const photos = getPhotos({ offset, limit: itemsPerPage });

    return {
        photos,
        totalCount,
        page,
        totalPages,
        itemsPerPage,
    };
}
