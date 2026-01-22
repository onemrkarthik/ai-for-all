'use client';

import React, { useState, useCallback, ReactNode } from 'react';
import { FilterBar, FilterValues, KITCHEN_FILTERS } from './FilterBar';
import { PhotoCard } from './PhotoCard';
import { ProCTACard } from './ProCTACard';
import { Item } from '@/lib/data';
import { usePhotoGalleryActions } from './PhotoGallery';
import { api } from '@/lib/api';

const ITEMS_PER_PAGE = 100;

interface FilteredGalleryProps {
    children: ReactNode;
    totalCount?: number;
    currentPage?: number;
}

export function FilteredGallery({ children, totalCount: initialTotalCount = 100, currentPage: _currentPage = 1 }: FilteredGalleryProps) {
    const [activeFilters, setActiveFilters] = useState<FilterValues>({});
    const [filteredPhotos, setFilteredPhotos] = useState<Item[] | null>(null);
    const [filteredTotalCount, setFilteredTotalCount] = useState<number | null>(null);
    const [filteredPage, setFilteredPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const { openPhoto, registerPhotos } = usePhotoGalleryActions();

    const hasActiveFilters = Object.values(activeFilters).some(v => v !== null);
    const filteredTotalPages = filteredTotalCount ? Math.ceil(filteredTotalCount / ITEMS_PER_PAGE) : 0;

    const fetchFilteredPhotos = useCallback(async (filters: FilterValues, page: number) => {
        setIsLoading(true);
        try {
            const offset = (page - 1) * ITEMS_PER_PAGE;
            const data = await api.feed.list({
                offset,
                limit: ITEMS_PER_PAGE,
                filters
            });

            setFilteredPhotos(data.photos);
            setFilteredTotalCount(data.totalCount ?? null);
            setFilteredPage(page);
            // Register photos for modal navigation
            registerPhotos(data.photos, 0);
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
            fetchFilteredPhotos(newFilters, 1);
        } else {
            // Clear filtered results to show original SSR content
            setFilteredPhotos(null);
            setFilteredTotalCount(null);
            setFilteredPage(1);
        }
    }, [fetchFilteredPhotos]);

    const handlePageChange = useCallback((page: number) => {
        fetchFilteredPhotos(activeFilters, page);
        // Scroll to top of results
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeFilters, fetchFilteredPhotos]);

    const handlePhotoClick = useCallback((item: Item, index: number) => {
        openPhoto(item, index);
    }, [openPhoto]);

    // Calculate display range for filtered results
    const startItem = (filteredPage - 1) * ITEMS_PER_PAGE + 1;
    const endItem = Math.min(filteredPage * ITEMS_PER_PAGE, filteredTotalCount || 0);

    return (
        <>
            <FilterBar
                filters={KITCHEN_FILTERS}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                totalCount={hasActiveFilters ? (filteredTotalCount ?? 0) : initialTotalCount}
            />

            {/* Show filtered results or original SSR content */}
            {hasActiveFilters ? (
                <section style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
                    {/* Photo Grid */}
                    <div className="container photo-grid">
                        {isLoading ? (
                            // Loading skeleton
                            Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    style={{
                                        aspectRatio: '4/3',
                                        background: '#f5f5f5',
                                        borderRadius: '3px',
                                        animation: 'pulse 1.5s ease-in-out infinite',
                                    }}
                                />
                            ))
                        ) : filteredPhotos && filteredPhotos.length > 0 ? (
                            filteredPhotos.map((photo, index) => (
                                <React.Fragment key={photo.id}>
                                    {/* Insert CTA card after 3rd photo on first page */}
                                    {filteredPage === 1 && index === 3 && <ProCTACard />}
                                    <PhotoCard
                                        item={photo}
                                        index={index}
                                        priority={index < 4}
                                        onClick={(item) => handlePhotoClick(item, index)}
                                    />
                                </React.Fragment>
                            ))
                        ) : (
                            <div style={{
                                gridColumn: '1 / -1',
                                textAlign: 'center',
                                padding: '4rem 2rem',
                                color: 'var(--text-muted)',
                            }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                                    No photos found
                                </div>
                                <p style={{ fontSize: '1rem', maxWidth: '400px', margin: '0 auto' }}>
                                    Try adjusting your filters to see more results.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Pagination for filtered results */}
                    {filteredTotalPages > 1 && !isLoading && (
                        <div className="container">
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '2rem 0',
                                borderTop: '1px solid var(--border-light)',
                                marginTop: '2rem',
                            }}>
                                {/* Photo count */}
                                <div style={{
                                    fontSize: '0.875rem',
                                    color: 'var(--text-muted)',
                                }}>
                                    Showing {startItem} - {endItem} of {filteredTotalCount?.toLocaleString()} photos
                                </div>

                                {/* Pagination controls */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                }}>
                                    {/* Previous button */}
                                    <button
                                        onClick={() => handlePageChange(filteredPage - 1)}
                                        disabled={filteredPage <= 1}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '4px',
                                            border: '1px solid var(--border-color)',
                                            background: filteredPage <= 1 ? '#f9f9f9' : 'white',
                                            color: filteredPage <= 1 ? '#ccc' : 'var(--foreground-dark)',
                                            cursor: filteredPage <= 1 ? 'not-allowed' : 'pointer',
                                        }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M15 18l-6-6 6-6" />
                                        </svg>
                                    </button>

                                    {/* Page numbers */}
                                    {Array.from({ length: Math.min(5, filteredTotalPages) }, (_, i) => {
                                        let pageNum: number;
                                        if (filteredTotalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (filteredPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (filteredPage >= filteredTotalPages - 2) {
                                            pageNum = filteredTotalPages - 4 + i;
                                        } else {
                                            pageNum = filteredPage - 2 + i;
                                        }
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    minWidth: '36px',
                                                    height: '36px',
                                                    padding: '0 0.5rem',
                                                    borderRadius: '4px',
                                                    border: filteredPage === pageNum
                                                        ? '1px solid var(--foreground-dark)'
                                                        : '1px solid transparent',
                                                    background: filteredPage === pageNum ? '#f5f5f5' : 'transparent',
                                                    color: 'var(--foreground-dark)',
                                                    fontSize: '0.875rem',
                                                    fontWeight: filteredPage === pageNum ? 600 : 400,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    {/* Next button */}
                                    <button
                                        onClick={() => handlePageChange(filteredPage + 1)}
                                        disabled={filteredPage >= filteredTotalPages}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '4px',
                                            border: '1px solid var(--border-color)',
                                            background: filteredPage >= filteredTotalPages ? '#f9f9f9' : 'white',
                                            color: filteredPage >= filteredTotalPages ? '#ccc' : 'var(--foreground-dark)',
                                            cursor: filteredPage >= filteredTotalPages ? 'not-allowed' : 'pointer',
                                        }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 18l6-6-6-6" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            ) : (
                children
            )}

            {/* Loading animation style */}
            <style jsx global>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </>
    );
}
