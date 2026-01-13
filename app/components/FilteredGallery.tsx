'use client';

import { useState, useCallback, useEffect, ReactNode } from 'react';
import { FilterBar, FilterValues, KITCHEN_FILTERS } from './FilterBar';
import { PhotoCard } from './PhotoCard';
import { Item } from '@/lib/data';
import { usePhotoGalleryActions } from './PhotoGallery';

interface FilteredGalleryProps {
    children: ReactNode;
}

interface FeedResponse {
    photos: Item[];
    totalCount?: number;
    offset: number;
    limit: number;
}

export function FilteredGallery({ children }: FilteredGalleryProps) {
    const [activeFilters, setActiveFilters] = useState<FilterValues>({});
    const [filteredPhotos, setFilteredPhotos] = useState<Item[] | null>(null);
    const [totalCount, setTotalCount] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const { openPhoto, registerPhotos } = usePhotoGalleryActions();

    const hasActiveFilters = Object.values(activeFilters).some(v => v !== null);

    const fetchFilteredPhotos = useCallback(async (filters: FilterValues, offset = 0) => {
        setIsLoading(true);
        try {
            const filterParams = JSON.stringify(filters);
            const response = await fetch(
                `/api/feed?offset=${offset}&limit=40&filters=${encodeURIComponent(filterParams)}`
            );
            const data: FeedResponse = await response.json();

            if (offset === 0) {
                setFilteredPhotos(data.photos);
                // Register photos for modal navigation
                registerPhotos(data.photos, 0);
            } else {
                setFilteredPhotos(prev => {
                    const newPhotos = [...(prev || []), ...data.photos];
                    registerPhotos(data.photos, prev?.length || 0);
                    return newPhotos;
                });
            }

            setTotalCount(data.totalCount ?? null);
            setHasMore(data.photos.length === 40);
        } catch (error) {
            console.error('Failed to fetch filtered photos:', error);
        } finally {
            setIsLoading(false);
        }
    }, [registerPhotos]);

    const handleFilterChange = useCallback((newFilters: FilterValues) => {
        setActiveFilters(newFilters);

        const hasFilters = Object.values(newFilters).some(v => v !== null);
        if (hasFilters) {
            fetchFilteredPhotos(newFilters, 0);
        } else {
            // Clear filtered results to show original SSR content
            setFilteredPhotos(null);
            setTotalCount(null);
        }
    }, [fetchFilteredPhotos]);

    const loadMore = useCallback(() => {
        if (!isLoading && hasMore && filteredPhotos) {
            fetchFilteredPhotos(activeFilters, filteredPhotos.length);
        }
    }, [isLoading, hasMore, filteredPhotos, activeFilters, fetchFilteredPhotos]);

    const handlePhotoClick = useCallback((item: Item, index: number) => {
        openPhoto(item, index);
    }, [openPhoto]);

    // Infinite scroll for filtered results
    useEffect(() => {
        if (!hasActiveFilters) return;

        const handleScroll = () => {
            const scrolledToBottom =
                window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 500;

            if (scrolledToBottom && !isLoading && hasMore) {
                loadMore();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasActiveFilters, isLoading, hasMore, loadMore]);

    return (
        <>
            <FilterBar
                filters={KITCHEN_FILTERS}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
            />

            {/* Show filtered results or original SSR content */}
            {hasActiveFilters ? (
                <section style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
                    <div className="container" style={{
                        marginBottom: '2rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <div style={{
                            fontSize: '0.9375rem',
                            color: 'var(--secondary)',
                            fontWeight: 500,
                        }}>
                            {isLoading && !filteredPhotos ? (
                                'Loading filtered results...'
                            ) : totalCount !== null ? (
                                `${totalCount} photo${totalCount !== 1 ? 's' : ''} found`
                            ) : (
                                'Showing filtered results'
                            )}
                        </div>
                    </div>

                    <div className="container photo-grid">
                        {filteredPhotos?.map((photo, index) => (
                            <PhotoCard
                                key={photo.id}
                                item={photo}
                                index={index}
                                priority={index < 4}
                                onClick={(item) => handlePhotoClick(item, index)}
                            />
                        ))}
                    </div>

                    {isLoading && filteredPhotos && filteredPhotos.length > 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '2rem',
                            color: 'var(--text-muted)',
                        }}>
                            Loading more photos...
                        </div>
                    )}

                    {!isLoading && filteredPhotos && filteredPhotos.length === 0 && (
                        <div className="container" style={{
                            textAlign: 'center',
                            padding: '4rem 2rem',
                            color: 'var(--text-muted)',
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                                No photos found
                            </div>
                            <p style={{ fontSize: '1rem', maxWidth: '400px', margin: '0 auto' }}>
                                Try adjusting your filters to see more results.
                            </p>
                        </div>
                    )}

                    {!hasMore && filteredPhotos && filteredPhotos.length > 0 && (
                        <div className="container" style={{
                            textAlign: 'center',
                            margin: '3rem auto 0',
                            padding: '2.5rem 0',
                            borderTop: '1px solid var(--border-light)',
                            color: 'var(--text-subtle)',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                        }}>
                            End of filtered results
                        </div>
                    )}
                </section>
            ) : (
                children
            )}
        </>
    );
}
