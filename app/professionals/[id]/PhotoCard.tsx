'use client';

import Image from 'next/image';
import { Item } from '@/lib/data';
import { usePhotoGallery } from '@/app/components/PhotoGallery';

interface PhotoCardProps {
    photo: Item;
    index: number;
}

export function PhotoCard({ photo, index }: PhotoCardProps) {
    const { openPhoto } = usePhotoGallery();

    return (
        <div
            key={photo.id}
            className="glass"
            style={{
                borderRadius: '3px',
                overflow: 'hidden',
                cursor: 'pointer',
            }}
            onClick={() => openPhoto(photo, index)}
        >
            <div className="card-image-container">
                <Image
                    src={photo.image}
                    alt={photo.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ objectFit: 'cover' }}
                />
            </div>
            <div style={{ padding: '1rem' }}>
                <h4 style={{
                    fontSize: '0.9375rem',
                    color: 'var(--foreground-dark)',
                    fontWeight: 600,
                }}>
                    {photo.title}
                </h4>
            </div>
        </div>
    );
}
