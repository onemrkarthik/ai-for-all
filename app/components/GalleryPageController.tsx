'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { usePhotoGalleryActions } from './PhotoGallery';
import { Item } from '@/lib/data';
import { api } from '@/lib/api';

interface GalleryPageControllerProps {
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
}

/**
 * GalleryPageController - Handles loading more photos in modal and updating page on close
 *
 * This component:
 * 1. Sets up a callback to load more photos when viewing the last photo in modal
 * 2. Updates the URL/page when the modal closes if more photos were loaded
 *
 * PERFORMANCE OPTIMIZATION: Removed useSearchParams() subscription.
 * Search params are read on-demand via window.location.search to prevent
 * unnecessary re-renders when other URL params change.
 * See docs/REACT_BEST_PRACTICES_REVIEW.md (rule: rerender-defer-reads)
 */
export function GalleryPageController({ currentPage, itemsPerPage, totalPages }: GalleryPageControllerProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { setOnLoadMore, setOnModalClose } = usePhotoGalleryActions();

    // Track the next page to load
    const nextPageRef = useRef(currentPage + 1);
    const loadedPagesRef = useRef<number[]>([currentPage]);

    // Update refs when props change
    useEffect(() => {
        nextPageRef.current = currentPage + 1;
        loadedPagesRef.current = [currentPage];
    }, [currentPage]);

    // Callback to load more photos
    const loadMorePhotos = useCallback(async (): Promise<Item[]> => {
        const pageToLoad = nextPageRef.current;

        // Don't load if we've reached the end or already loaded this page
        if (pageToLoad > totalPages || loadedPagesRef.current.includes(pageToLoad)) {
            return [];
        }

        try {
            const offset = (pageToLoad - 1) * itemsPerPage;
            const data = await api.feed.list({ offset, limit: itemsPerPage });

            // Mark this page as loaded and increment for next load
            loadedPagesRef.current.push(pageToLoad);
            nextPageRef.current = pageToLoad + 1;

            return data.photos || [];
        } catch (error) {
            console.error('[GalleryPageController] Failed to load more photos:', error);
            return [];
        }
    }, [itemsPerPage, totalPages]);

    // Callback when modal closes
    const handleModalClose = useCallback((hasLoadedMore: boolean) => {
        if (hasLoadedMore && loadedPagesRef.current.length > 1) {
            // Get the highest page loaded
            const highestPage = Math.max(...loadedPagesRef.current);

            // Read search params on-demand (avoids useSearchParams subscription)
            const params = new URLSearchParams(window.location.search);
            if (highestPage === 1) {
                params.delete('page');
            } else {
                params.set('page', highestPage.toString());
            }

            const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
            router.push(newUrl);
        }
    }, [pathname, router]);

    // Set up callbacks on mount
    useEffect(() => {
        setOnLoadMore(loadMorePhotos);
        setOnModalClose(handleModalClose);

        return () => {
            setOnLoadMore(null);
            setOnModalClose(null);
        };
    }, [setOnLoadMore, setOnModalClose, loadMorePhotos, handleModalClose]);

    // This component doesn't render anything visible
    return null;
}
