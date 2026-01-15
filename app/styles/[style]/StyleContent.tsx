/**
 * StyleContent Component
 *
 * Server component displaying educational content sections
 * for each kitchen design facet.
 */

import React from 'react';
import { StyleGuide, StyleFacet } from '@/lib/data/style-guides';

interface StyleContentProps {
  guide: StyleGuide;
}

const FACET_ICONS: Record<string, React.ReactNode> = {
  layout: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  ),
  cabinetFinish: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="4" width="8" height="16" rx="1" />
      <rect x="14" y="4" width="8" height="16" rx="1" />
      <path d="M6 10v4M18 10v4" />
    </svg>
  ),
  countertop: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 8h20v2H2zM4 10v10M20 10v10M8 10v10M16 10v10" />
    </svg>
  ),
  backsplash: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="6" height="6" />
      <rect x="9" y="3" width="6" height="6" />
      <rect x="15" y="3" width="6" height="6" />
      <rect x="3" y="9" width="6" height="6" />
      <rect x="9" y="9" width="6" height="6" />
      <rect x="15" y="9" width="6" height="6" />
    </svg>
  ),
  flooring: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 22L12 2l10 20H2z" />
      <path d="M6 18h12M8 14h8M10 10h4" />
    </svg>
  ),
  appliances: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M4 10h16M10 6h4" />
      <circle cx="12" cy="16" r="2" />
    </svg>
  ),
  colorPalette: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="8" r="2" />
      <circle cx="8" cy="14" r="2" />
      <circle cx="16" cy="14" r="2" />
    </svg>
  ),
  lighting: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 18h6M10 22h4" />
      <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z" />
    </svg>
  ),
};

const FACET_ORDER = [
  'layout',
  'cabinetFinish',
  'countertop',
  'backsplash',
  'flooring',
  'appliances',
  'colorPalette',
  'lighting',
] as const;

function FacetSection({
  facetKey,
  facet,
  index,
}: {
  facetKey: string;
  facet: StyleFacet;
  index: number;
}) {
  const isEven = index % 2 === 0;

  return (
    <section
      style={{
        padding: '48px 0',
        borderBottom: '1px solid var(--border-color)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px',
          alignItems: 'start',
        }}
      >
        {/* Header */}
        <div style={{ order: isEven ? 1 : 2 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
              }}
            >
              {FACET_ICONS[facetKey]}
            </div>
            <h3
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: '1.5rem',
                fontWeight: 400,
                color: 'var(--foreground)',
                margin: 0,
              }}
            >
              {facet.title}
            </h3>
          </div>
          <p
            style={{
              fontSize: '1.05rem',
              lineHeight: 1.7,
              color: 'var(--secondary)',
            }}
          >
            {facet.description}
          </p>
        </div>

        {/* Tips */}
        <div style={{ order: isEven ? 2 : 1 }}>
          <h4
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'var(--primary)',
              marginBottom: '16px',
            }}
          >
            Expert Tips
          </h4>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {facet.tips.map((tip, tipIndex) => (
              <li
                key={tipIndex}
                style={{
                  display: 'flex',
                  gap: '12px',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  color: 'var(--foreground)',
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  {tipIndex + 1}
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default function StyleContent({ guide }: StyleContentProps) {
  return (
    <article style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Section Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '2rem',
            fontWeight: 400,
            marginBottom: '12px',
            color: 'var(--foreground)',
          }}
        >
          Planning Your {guide.name} Kitchen
        </h2>
        <p
          style={{
            color: 'var(--secondary)',
            fontSize: '1.1rem',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          A comprehensive guide to every element of {guide.name.toLowerCase()} kitchen design
        </p>
      </div>

      {/* Facet Sections */}
      {FACET_ORDER.map((facetKey, index) => (
        <FacetSection
          key={facetKey}
          facetKey={facetKey}
          facet={guide.facets[facetKey]}
          index={index}
        />
      ))}
    </article>
  );
}
