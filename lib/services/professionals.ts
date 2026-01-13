import { db } from '@/lib/db';

export interface ProfessionalDetails {
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
    photos?: Array<{
        id: number;
        title: string;
        image: string;
    }>;
    totalProjects?: number;
}

const selectProfessionalById = db.prepare(`
    SELECT id, name, company
    FROM professionals
    WHERE id = ?
`);

const selectReviewsByProfessionalId = db.prepare(`
    SELECT id, reviewer_name, rating, comment, created_at
    FROM reviews
    WHERE professional_id = ?
    ORDER BY created_at DESC
`);

const getAverageRating = db.prepare(`
    SELECT AVG(rating) as avg_rating, COUNT(*) as review_count
    FROM reviews
    WHERE professional_id = ?
`);

const selectPhotosByProfessionalId = db.prepare(`
    SELECT p.id, p.title, p.image_url
    FROM photos p
    JOIN photos_professionals pp ON p.id = pp.photo_id
    WHERE pp.professional_id = ?
    ORDER BY p.id DESC
`);

export function getProfessionalById(id: number): ProfessionalDetails | null {
    const professional = selectProfessionalById.get(id) as any;
    if (!professional) return null;

    // Fetch reviews
    const reviews = selectReviewsByProfessionalId.all(id) as any[];
    const ratingStats = getAverageRating.get(id) as any;

    // Fetch photos
    const photos = selectPhotosByProfessionalId.all(id) as any[];

    return {
        id: professional.id,
        name: professional.name,
        company: professional.company,
        averageRating: ratingStats?.avg_rating ? Math.round(ratingStats.avg_rating * 10) / 10 : undefined,
        reviewCount: ratingStats?.review_count || 0,
        reviews: reviews.map(r => ({
            id: r.id,
            reviewerName: r.reviewer_name,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.created_at
        })),
        photos: photos.map(p => ({
            id: p.id,
            title: p.title,
            image: p.image_url
        })),
        totalProjects: photos.length
    };
}
