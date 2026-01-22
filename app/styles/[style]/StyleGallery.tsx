'use client';

/**
 * StyleGallery Component
 *
 * Client component that fetches and displays photos filtered by style.
 */

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import { nav } from '@/lib/navigation';

interface Photo {
  id: number;
  image_url: string;
  title: string;
  description?: string;
  professional_name?: string;
  professional_id?: number;
}

interface StyleGalleryProps {
  style: string;
}

function SkeletonCard() {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      <div
        style={{
          aspectRatio: '4/3',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }}
      />
      <div style={{ padding: '16px' }}>
        <div
          style={{
            height: '16px',
            width: '80%',
            background: '#f0f0f0',
            borderRadius: '4px',
            marginBottom: '8px',
          }}
        />
        <div
          style={{
            height: '12px',
            width: '50%',
            background: '#f0f0f0',
            borderRadius: '4px',
          }}
        />
      </div>
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}

function PhotoCard({ photo }: { photo: Photo }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <article
      style={{
        background: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: 'var(--card-shadow)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ position: 'relative', aspectRatio: '4/3' }}>
        <Image
          src={photo.image_url}
          alt={photo.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div style={{ padding: '16px' }}>
        <h3
          style={{
            fontSize: '0.95rem',
            fontWeight: 500,
            color: 'var(--foreground)',
            marginBottom: '4px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {photo.title}
        </h3>
        {photo.professional_name && photo.professional_id && (
          <Link
            href={nav.professionals.detail(photo.professional_id)}
            style={{
              fontSize: '0.85rem',
              color: 'var(--primary)',
              textDecoration: 'none',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            by {photo.professional_name}
          </Link>
        )}
      </div>
    </article>
  );
}

export default function StyleGallery({ style }: StyleGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPhotos() {
      try {
        setLoading(true);
        setError(null);

        const data = await api.feed.list({
          filters: { Style: style },
          limit: 12
        });

        // Map the response to match expected Photo interface
        const mappedPhotos = data.photos.map(photo => ({
          id: photo.id,
          image_url: photo.image,
          title: photo.title,
        }));
        setPhotos(mappedPhotos);
      } catch (err) {
        console.error('Error fetching photos:', err);
        setError('Unable to load photos. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchPhotos();
  }, [style]);

  if (error) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '40px',
          color: 'var(--secondary)',
        }}
      >
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '24px',
      }}
    >
      {loading
        ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        : photos.length > 0
        ? photos.map((photo) => <PhotoCard key={photo.id} photo={photo} />)
        : (
          <div
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '40px',
              color: 'var(--secondary)',
            }}
          >
            <p>No photos found for {style} style kitchens.</p>
            <Link
              href={nav.photos.ideas()}
              style={{
                color: 'var(--primary)',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Browse all kitchen photos
            </Link>
          </div>
        )}
    </div>
  );
}
