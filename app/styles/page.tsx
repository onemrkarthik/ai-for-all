/**
 * Kitchen Styles Index Page
 *
 * Landing page showcasing all available kitchen design styles.
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { STYLE_GUIDES } from '@/lib/data/style-guides';
import StyleCard from './StyleCard';

export const metadata: Metadata = {
  title: 'Kitchen Design Styles | Houzz',
  description: 'Explore popular kitchen design styles including Modern, Contemporary, Transitional, Farmhouse, Traditional, and Scandinavian. Find inspiration and guidance for your kitchen remodel.',
  openGraph: {
    title: 'Kitchen Design Styles | Houzz',
    description: 'Discover the perfect kitchen style for your home. Expert guides for Modern, Contemporary, Transitional, Farmhouse, Traditional, and Scandinavian kitchens.',
    type: 'website',
  },
};

const STYLE_IMAGES: Record<string, string> = {
  modern: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
  contemporary: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  transitional: 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=800&q=80',
  farmhouse: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
  traditional: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
  scandinavian: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80',
};

export default function StylesIndexPage() {
  const styles = Object.values(STYLE_GUIDES);

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, #2d6b0d 100%)',
          color: 'white',
          padding: '80px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 400,
              marginBottom: '24px',
              lineHeight: 1.2,
            }}
          >
            Kitchen Design Styles
          </h1>
          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              opacity: 0.9,
              lineHeight: 1.6,
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            Discover the perfect style for your kitchen remodel. Each guide covers
            layouts, materials, colors, and expert tips to help you create your
            dream kitchen.
          </p>
        </div>
      </section>

      {/* Styles Grid */}
      <section style={{ padding: '60px 24px', maxWidth: '1400px', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: '32px',
          }}
        >
          {styles.map((style) => (
            <StyleCard
              key={style.slug}
              name={style.name}
              slug={style.slug}
              tagline={style.tagline}
              overview={style.overview}
              imageUrl={STYLE_IMAGES[style.slug]}
            />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          background: 'var(--background-warm)',
          padding: '60px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '1.75rem',
              fontWeight: 400,
              marginBottom: '16px',
              color: 'var(--foreground)',
            }}
          >
            Not sure which style is right for you?
          </h2>
          <p
            style={{
              color: 'var(--secondary)',
              marginBottom: '24px',
              lineHeight: 1.6,
            }}
          >
            Browse our photo gallery to see thousands of real kitchen designs and
            find inspiration for your project.
          </p>
          <Link
            href="/photos/kitchen-ideas-and-designs-phbr0-bp~t_709"
            style={{
              display: 'inline-block',
              background: 'var(--primary)',
              color: 'white',
              padding: '14px 32px',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: 500,
              transition: 'background 0.2s ease',
            }}
          >
            Browse All Kitchen Photos
          </Link>
        </div>
      </section>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Kitchen Design Styles',
            description: 'Explore popular kitchen design styles for your remodel.',
            url: 'https://houzz.com/styles',
            mainEntity: {
              '@type': 'ItemList',
              itemListElement: styles.map((style, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                  '@type': 'Article',
                  name: `${style.name} Kitchen Design Guide`,
                  description: style.tagline,
                  url: `https://houzz.com/styles/${style.slug}`,
                },
              })),
            },
          }),
        }}
      />
    </main>
  );
}
