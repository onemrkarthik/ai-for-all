/**
 * PhotoGallery - Global Photo Gallery Context Provider
 *
 * This file implements a React Context-based photo gallery system that manages
 * a global collection of photos and provides modal viewing functionality with
 * navigation capabilities across all loaded photos.
 *
 * Key Features:
 * - Centralized photo collection management across multiple batches
 * - Modal view with keyboard navigation (Arrow keys and Escape)
 * - Prevents duplicate registration of photos using a ref-based tracking system
 * - Supports progressive photo loading as new batches stream in
 * - Auto-loads next page when viewing the last photo
 *
 * Architecture:
 * Uses React Context API to provide gallery state and actions to all child components.
 * Photos from different batches register themselves into a global array, maintaining
 * their correct index positions for seamless navigation.
 *
 * Usage:
 * Wrap your application or page in PhotoGalleryProvider, then use the usePhotoGallery
 * hook in child components to access gallery functionality.
 */

'use client';

import { useState, ReactNode, createContext, useContext, useCallback, useRef, useMemo, useEffect } from 'react';
import { Item } from '@/lib/data';
import { PhotoModal } from './PhotoModal';

/**
 * State Context - Contains volatile data that changes frequently
 */
interface PhotoGalleryState {
    photos: Item[];
    currentIndex: number | null;
    currentPhoto: Item | null;
    totalPhotos: number;
    isLoadingMore: boolean;
    hasLoadedMore: boolean;
}

/**
 * Actions Context - Contains stable functions that do not change (referentially stable)
 */
interface PhotoGalleryActions {
    registerPhotos: (photos: Item[], startIndex: number) => void;
    openPhotoAtIndex: (index: number) => void;
    openPhoto: (photo: Item, index: number) => void;
    goToNext: () => void;
    goToPrevious: () => void;
    closeModal: () => void;
    setOnLoadMore: (callback: (() => Promise<Item[]>) | null) => void;
    setOnModalClose: (callback: ((hasLoadedMore: boolean) => void) | null) => void;
}

// Split contexts
const PhotoGalleryStateContext = createContext<PhotoGalleryState>({
    photos: [],
    currentIndex: null,
    currentPhoto: null,
    totalPhotos: 0,
    isLoadingMore: false,
    hasLoadedMore: false,
});

const PhotoGalleryActionsContext = createContext<PhotoGalleryActions>({
    registerPhotos: () => { },
    openPhotoAtIndex: () => { },
    openPhoto: () => { },
    goToNext: () => { },
    goToPrevious: () => { },
    closeModal: () => { },
    setOnLoadMore: () => { },
    setOnModalClose: () => { },
});

/**
 * PhotoGalleryProvider Component
 *
 * Implements context splitting to prevent re-render storms. The critical optimization
 * is separating the `registerPhotos` action (used by every PhotoBatch) from the `photos` state.
 *
 * This ensures that when new photos are registered, only the components consuming the STATE
 * (like the modal) update, while the components consuming only ACTIONS (like PhotoBatchClient)
 * do NOT re-render.
 */
export function PhotoGalleryProvider({ children }: { children: ReactNode }) {
    const [photos, setPhotos] = useState<Item[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number | null>(null);
    // Explicitly opened photo - used to guarantee correct photo on initial click
    const [explicitPhoto, setExplicitPhoto] = useState<Item | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasLoadedMore, setHasLoadedMore] = useState(false);

    // Refs for callbacks (to avoid re-renders when callbacks change)
    const onLoadMoreRef = useRef<(() => Promise<Item[]>) | null>(null);
    const onModalCloseRef = useRef<((hasLoadedMore: boolean) => void) | null>(null);
    const loadingMoreRef = useRef(false);

    // Derived state - use explicit photo if available, otherwise lookup from array
    const currentPhoto = currentIndex !== null
        ? (explicitPhoto || photos[currentIndex])
        : null;
    const totalPhotos = photos.length;

    // Effect to load more photos when viewing the last photo
    useEffect(() => {
        const checkAndLoadMore = async () => {
            // Check if we're at the last photo and have a callback
            if (
                currentIndex !== null &&
                currentIndex >= photos.length - 1 &&
                photos.length > 0 &&
                onLoadMoreRef.current &&
                !loadingMoreRef.current
            ) {
                loadingMoreRef.current = true;
                setIsLoadingMore(true);

                try {
                    const newPhotos = await onLoadMoreRef.current();
                    if (newPhotos && newPhotos.length > 0) {
                        // Register the new photos at the end
                        setPhotos(prevPhotos => {
                            const updatedPhotos = [...prevPhotos];
                            newPhotos.forEach((photo, idx) => {
                                const globalIndex = prevPhotos.length + idx;
                                updatedPhotos[globalIndex] = photo;
                            });
                            return updatedPhotos;
                        });
                        setHasLoadedMore(true);
                    }
                } catch (error) {
                    console.error('[PhotoGallery] Failed to load more photos:', error);
                } finally {
                    setIsLoadingMore(false);
                    loadingMoreRef.current = false;
                }
            }
        };

        checkAndLoadMore();
    }, [currentIndex, photos.length]);

    // Actions - Wrapped in useCallback
    const registerPhotos = useCallback((newPhotos: Item[], startIndex: number) => {
        setPhotos(prevPhotos => {
            let hasChanges = false;
            // Optimistic check to avoid cloning array if possible
            const updatedPhotos = [...prevPhotos];

            newPhotos.forEach((photo, localIndex) => {
                const globalIndex = startIndex + localIndex;

                // Check ownership via ID or existence to prevent duplicates.
                // We simply check if the slot is empty or if the ID is different.
                const existing = updatedPhotos[globalIndex];
                if (!existing || existing.id !== photo.id) {
                    updatedPhotos[globalIndex] = photo;
                    hasChanges = true;
                }
            });

            if (hasChanges) {
                return updatedPhotos;
            }
            return prevPhotos;
        });
    }, []);

    const openPhotoAtIndex = useCallback((index: number) => {
        setExplicitPhoto(null); // Clear explicit photo, rely on array lookup
        setCurrentIndex(index);
    }, []);

    /**
     * Open a specific photo with its data - guarantees correct photo display
     * regardless of registration timing
     */
    const openPhoto = useCallback((photo: Item, index: number) => {
        setExplicitPhoto(photo); // Store the explicit photo
        setCurrentIndex(index);
    }, []);

    const goToNext = useCallback(() => {
        setExplicitPhoto(null); // Clear explicit photo for navigation
        setCurrentIndex(prev => {
            if (prev === null) return null;
            if (prev >= photos.length - 1) return prev;
            return prev + 1;
        });
    }, [photos.length]); // Dependency ok - modal needs to know length anyway

    const goToPrevious = useCallback(() => {
        setExplicitPhoto(null); // Clear explicit photo for navigation
        setCurrentIndex(prev => {
            if (prev === null) return null;
            if (prev <= 0) return prev;
            return prev - 1;
        });
    }, []);

    const closeModal = useCallback(() => {
        // Call the onModalClose callback with whether more photos were loaded
        if (onModalCloseRef.current) {
            onModalCloseRef.current(hasLoadedMore);
        }

        setExplicitPhoto(null); // Clear explicit photo
        setCurrentIndex(null);
        setHasLoadedMore(false); // Reset for next modal open
    }, [hasLoadedMore]);

    const setOnLoadMore = useCallback((callback: (() => Promise<Item[]>) | null) => {
        onLoadMoreRef.current = callback;
    }, []);

    const setOnModalClose = useCallback((callback: ((hasLoadedMore: boolean) => void) | null) => {
        onModalCloseRef.current = callback;
    }, []);

    // Stable actions object (never changes unless callbacks change)
    // Note: goToNext changes when photos.length changes, but other actions are stable.
    // For PhotoBatchClient, registerPhotos is the most critical one.
    const actions = useMemo(() => ({
        registerPhotos,
        openPhotoAtIndex,
        openPhoto,
        goToNext,
        goToPrevious,
        closeModal,
        setOnLoadMore,
        setOnModalClose,
    }), [registerPhotos, openPhotoAtIndex, openPhoto, goToNext, goToPrevious, closeModal, setOnLoadMore, setOnModalClose]);

    // State object (changes whenever photos or index changes)
    const state = useMemo(() => ({
        photos,
        currentIndex,
        currentPhoto,
        totalPhotos,
        isLoadingMore,
        hasLoadedMore,
    }), [photos, currentIndex, currentPhoto, totalPhotos, isLoadingMore, hasLoadedMore]);

    return (
        <PhotoGalleryActionsContext.Provider value={actions}>
            <PhotoGalleryStateContext.Provider value={state}>
                {children}
                <PhotoModal
                    photo={currentPhoto}
                    currentIndex={currentIndex}
                    totalPhotos={totalPhotos}
                    onClose={closeModal}
                    onNext={goToNext}
                    onPrevious={goToPrevious}
                    isLoadingMore={isLoadingMore}
                />
            </PhotoGalleryStateContext.Provider>
        </PhotoGalleryActionsContext.Provider>
    );
}

/**
 * Hook for components that need full access (State + Actions)
 * e.g., Custom/Complex components
 */
export function usePhotoGallery() {
    const state = useContext(PhotoGalleryStateContext);
    const actions = useContext(PhotoGalleryActionsContext);
    return { ...state, ...actions };
}

/**
 * OPTIMIZED Hook for components that only need ACTIONS.
 * Using this hook will NOT cause a re-render when the photo list changes.
 * Use this in `PhotoBatchClient` to avoid layout thrashing.
 */
export function usePhotoGalleryActions() {
    return useContext(PhotoGalleryActionsContext);
}
