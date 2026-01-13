'use client';

/**
 * StyleCard Component
 *
 * Interactive card for displaying a kitchen style preview.
 */

import { useState } from 'react';
import Link from 'next/link';

interface StyleCardProps {
  name: string;
  slug: string;
  tagline: string;
  overview: string;
  imageUrl: string;
}

export default function StyleCard({
  name,
  slug,
  tagline,
  overview,
  imageUrl,
}: StyleCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href={`/styles/${slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <article
        style={{
          background: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: 'var(--card-shadow)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          cursor: 'pointer',
          transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image */}
        <div
          style={{
            position: 'relative',
            height: '240px',
            background: `url(${imageUrl}) center/cover`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
            }}
          />
          <h2
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '24px',
              right: '24px',
              fontFamily: 'Georgia, serif',
              fontSize: '1.75rem',
              fontWeight: 400,
              color: 'white',
              margin: 0,
            }}
          >
            {name}
          </h2>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          <p
            style={{
              fontSize: '1rem',
              color: 'var(--primary)',
              fontWeight: 500,
              marginBottom: '12px',
            }}
          >
            {tagline}
          </p>
          <p
            style={{
              fontSize: '0.95rem',
              color: 'var(--secondary)',
              lineHeight: 1.6,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {overview}
          </p>
          <div
            style={{
              marginTop: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--primary)',
              fontWeight: 500,
              fontSize: '0.95rem',
            }}
          >
            <span>Explore {name} Kitchens</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </article>
    </Link>
  );
}
