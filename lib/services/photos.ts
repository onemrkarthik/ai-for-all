import { db } from '@/lib/db';
import { wrapUrl } from '@/lib/cdn';

export interface Photo {
    id: number;
    title: string;
    source: string;
    image: string; // mapped from image_url
    description?: string;
    professional?: {
        id: number;
        name: string;
        company: string;
        averageRating?: number;
        reviewCount?: number;
        reviews?: Array<{
            id: number;
            reviewerName: string;
            rating: number;
            comment: string;
            createdAt: string;
        }>;
    };
    attributes?: Array<{
        label: string;
        value: string;
    }>;
}

// Minimal data for grid display (LCP/TBT optimization)
export interface PhotoGridItem {
    id: number;
    title: string;
    source: string;
    image: string;
}

// Filter types
export interface PhotoFilters {
    [label: string]: string | null;
}

// Prepared statements for better performance
const selectPhotos = db.prepare(`
    SELECT id, title, source, image_url
    FROM photos
    LIMIT ? OFFSET ?
`);

const selectAttributesByPhotoId = db.prepare(`
    SELECT label, value FROM photo_attributes WHERE photo_id = ?
`);

const selectPhotoById = db.prepare(`
    SELECT p.*, prof.id as prof_id, prof.name as prof_name, prof.company as prof_company
    FROM photos p
    JOIN photos_professionals pp ON p.id = pp.photo_id
    JOIN professionals prof ON pp.professional_id = prof.id
    WHERE p.id = ?
`);

const selectReviewsByProfessionalId = db.prepare(`
    SELECT id, reviewer_name, rating, comment, created_at
    FROM reviews
    WHERE professional_id = ?
    ORDER BY created_at DESC
    LIMIT 5
`);

const getAverageRating = db.prepare(`
    SELECT AVG(rating) as avg_rating, COUNT(*) as review_count
    FROM reviews
    WHERE professional_id = ?
`);

export function getPhotos({ offset, limit }: { offset: number; limit: number }): PhotoGridItem[] {
    const rows = selectPhotos.all(limit, offset) as any[];

    // Return lightweight objects (no nested joins)
    return rows.map(row => ({
        id: row.id,
        title: row.title,
        source: row.source,
        image: wrapUrl(row.image_url)
    }));
}

export function getPhotoById(id: number): Photo | null {
    const row = selectPhotoById.get(id) as any;
    if (!row) return null;

    const attributes = selectAttributesByPhotoId.all(row.id) as any[];

    // Fetch reviews for this professional
    const reviews = selectReviewsByProfessionalId.all(row.prof_id) as any[];
    const ratingStats = getAverageRating.get(row.prof_id) as any;

    return {
        id: row.id,
        title: row.title,
        source: row.source,
        image: wrapUrl(row.image_url),
        description: row.description,
        professional: {
            id: row.prof_id,
            name: row.prof_name,
            company: row.prof_company,
            averageRating: ratingStats?.avg_rating ? Math.round(ratingStats.avg_rating * 10) / 10 : undefined,
            reviewCount: ratingStats?.review_count || 0,
            reviews: reviews.map(r => ({
                id: r.id,
                reviewerName: r.reviewer_name,
                rating: r.rating,
                comment: r.comment,
                createdAt: r.created_at
            }))
        },
        attributes: attributes.map(a => ({ label: a.label, value: a.value }))
    };
}

/**
 * Get photos with optional filtering by attributes
 */
export function getFilteredPhotos({
    offset,
    limit,
    filters
}: {
    offset: number;
    limit: number;
    filters?: PhotoFilters;
}): PhotoGridItem[] {
    // If no filters, use the optimized simple query
    if (!filters || Object.values(filters).every(v => v === null || v === undefined)) {
        return getPhotos({ offset, limit });
    }

    // Build dynamic query with filter joins
    const activeFilters = Object.entries(filters).filter(([, value]) => value !== null && value !== undefined);

    if (activeFilters.length === 0) {
        return getPhotos({ offset, limit });
    }

    // Build the query with subqueries for each filter
    // Each filter requires a matching attribute row
    const filterConditions = activeFilters.map((_, idx) =>
        `EXISTS (
            SELECT 1 FROM photo_attributes pa${idx}
            WHERE pa${idx}.photo_id = p.id
            AND pa${idx}.label = ?
            AND pa${idx}.value = ?
        )`
    ).join(' AND ');

    const query = `
        SELECT p.id, p.title, p.source, p.image_url
        FROM photos p
        WHERE ${filterConditions}
        LIMIT ? OFFSET ?
    `;

    // Flatten parameters: [label1, value1, label2, value2, ..., limit, offset]
    const params: (string | number)[] = [];
    activeFilters.forEach(([label, value]) => {
        params.push(label, value as string);
    });
    params.push(limit, offset);

    const rows = db.prepare(query).all(...params) as any[];

    return rows.map(row => ({
        id: row.id,
        title: row.title,
        source: row.source,
        image: wrapUrl(row.image_url)
    }));
}

/**
 * Get total count of photos matching filters
 */
export function getFilteredPhotosCount(filters?: PhotoFilters): number {
    // If no filters, return total count
    if (!filters || Object.values(filters).every(v => v === null || v === undefined)) {
        const result = db.prepare('SELECT COUNT(*) as count FROM photos').get() as any;
        return result.count;
    }

    const activeFilters = Object.entries(filters).filter(([, value]) => value !== null && value !== undefined);

    if (activeFilters.length === 0) {
        const result = db.prepare('SELECT COUNT(*) as count FROM photos').get() as any;
        return result.count;
    }

    const filterConditions = activeFilters.map((_, idx) =>
        `EXISTS (
            SELECT 1 FROM photo_attributes pa${idx}
            WHERE pa${idx}.photo_id = p.id
            AND pa${idx}.label = ?
            AND pa${idx}.value = ?
        )`
    ).join(' AND ');

    const query = `SELECT COUNT(*) as count FROM photos p WHERE ${filterConditions}`;

    const params: string[] = [];
    activeFilters.forEach(([label, value]) => {
        params.push(label, value as string);
    });

    const result = db.prepare(query).get(...params) as any;
    return result.count;
}
