'use client';

import { useEffect } from 'react';
import { Item } from '@/lib/data';
import { usePhotoGallery } from '@/app/components/PhotoGallery';

interface PhotoGalleryRegistrarProps {
    photos: Item[];
}

/**
 * Client component that registers photos with the global photo gallery
 * This allows photos from the professional page to open in the modal
 */
export function PhotoGalleryRegistrar({ photos }: PhotoGalleryRegistrarProps) {
    const { registerPhotos } = usePhotoGallery();

    useEffect(() => {
        if (photos && photos.length > 0) {
            // Register photos starting at index 0
            registerPhotos(photos, 0);
        }
    }, [photos, registerPhotos]);

    return null; // This component doesn't render anything
}
