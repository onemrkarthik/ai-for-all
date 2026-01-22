import { db } from '@/lib/db';
import type {
  ProfessionalRow,
  ReviewRow,
  RatingStatsRow,
  CountRow,
  ProfessionalPhotoRow
} from '@/lib/db/types';

export interface ProfessionalListItem {
    id: number;
    name: string;
    company: string;
    averageRating?: number;
    reviewCount: number;
    projectCount: number;
}

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

const selectAllProfessionals = db.prepare(`
    SELECT id, name, company
    FROM professionals
    ORDER BY name ASC
`);

const getProjectCount = db.prepare(`
    SELECT COUNT(*) as count
    FROM photos_professionals
    WHERE professional_id = ?
`);

export function getProfessionalById(id: number): ProfessionalDetails | null {
    const professional = selectProfessionalById.get(id) as ProfessionalRow | undefined;
    if (!professional) return null;

    // Fetch reviews
    const reviews = selectReviewsByProfessionalId.all(id) as ReviewRow[];
    const ratingStats = getAverageRating.get(id) as RatingStatsRow | undefined;

    // Fetch photos
    const photos = selectPhotosByProfessionalId.all(id) as ProfessionalPhotoRow[];

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

export function getAllProfessionals(): ProfessionalListItem[] {
    const professionals = selectAllProfessionals.all() as ProfessionalRow[];

    return professionals.map(professional => {
        const ratingStats = getAverageRating.get(professional.id) as RatingStatsRow | undefined;
        const projectStats = getProjectCount.get(professional.id) as CountRow | undefined;

        return {
            id: professional.id,
            name: professional.name,
            company: professional.company,
            averageRating: ratingStats?.avg_rating
                ? Math.round(ratingStats.avg_rating * 10) / 10
                : undefined,
            reviewCount: ratingStats?.review_count || 0,
            projectCount: projectStats?.count || 0,
        };
    });
}
