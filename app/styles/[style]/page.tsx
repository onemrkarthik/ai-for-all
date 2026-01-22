/**
 * Kitchen Style Detail Page
 *
 * Individual landing page for each kitchen design style with
 * educational content and filtered photo gallery.
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getStyleGuide, isValidStyle, STYLE_SLUGS } from '@/lib/data/style-guides';
import StyleContent from './StyleContent';
import StyleGallery from './StyleGallery';
import { nav } from '@/lib/navigation';

interface PageProps {
  params: Promise<{ style: string }>;
}

/**
 * Generate static params for all style pages
 */
export async function generateStaticParams() {
  return STYLE_SLUGS.map((style) => ({ style }));
}

/**
 * Generate dynamic metadata for SEO
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { style } = await params;
  const guide = getStyleGuide(style);

  if (!guide) {
    return {
      title: 'Style Not Found | AI for All',
    };
  }

  return {
    title: `${guide.name} Kitchen Design Guide | AI for All`,
    description: `${guide.tagline}. Expert tips on layout, cabinets, countertops, backsplash, flooring, appliances, colors, and lighting for ${guide.name.toLowerCase()} kitchens.`,
    openGraph: {
      title: `${guide.name} Kitchen Design Guide`,
      description: guide.overview.substring(0, 160) + '...',
      type: 'article',
    },
    keywords: [
      `${guide.name.toLowerCase()} kitchen`,
      `${guide.name.toLowerCase()} kitchen design`,
      `${guide.name.toLowerCase()} kitchen remodel`,
      'kitchen design guide',
      'kitchen remodel tips',
    ],
  };
}

export default async function StylePage({ params }: PageProps) {
  const { style } = await params;

  // Validate style parameter
  if (!isValidStyle(style)) {
    notFound();
  }

  const guide = getStyleGuide(style)!;

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      {/* Breadcrumb */}
      <nav
        style={{
          padding: '16px 24px',
          background: 'white',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.875rem',
              color: 'var(--secondary)',
            }}
          >
            <Link
              href={nav.styles.list()}
              style={{
                color: 'var(--primary)',
                textDecoration: 'none',
              }}
            >
              Kitchen Styles
            </Link>
            <span>/</span>
            <span>{guide.name}</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header
        style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, #2d6b0d 100%)',
          color: 'white',
          padding: '60px 24px 80px',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <p
            style={{
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              opacity: 0.8,
              marginBottom: '16px',
            }}
          >
            Kitchen Design Guide
          </p>
          <h1
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: 400,
              marginBottom: '20px',
              lineHeight: 1.1,
            }}
          >
            {guide.name} Kitchen
          </h1>
          <p
            style={{
              fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
              opacity: 0.9,
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: 1.5,
            }}
          >
            {guide.tagline}
          </p>
        </div>
      </header>

      {/* Overview Section */}
      <section
        style={{
          maxWidth: '800px',
          margin: '-40px auto 0',
          padding: '0 24px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '40px',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <h2
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 400,
              marginBottom: '20px',
              color: 'var(--foreground)',
            }}
          >
            What is {guide.name} Style?
          </h2>
          <p
            style={{
              fontSize: '1.05rem',
              lineHeight: 1.8,
              color: 'var(--secondary)',
            }}
          >
            {guide.overview}
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <StyleContent guide={guide} />

      {/* Photo Gallery Section */}
      <section
        style={{
          background: 'var(--background-warm)',
          padding: '60px 24px',
          marginTop: '60px',
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '32px',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '1.75rem',
                  fontWeight: 400,
                  color: 'var(--foreground)',
                  marginBottom: '8px',
                }}
              >
                {guide.name} Kitchen Photos
              </h2>
              <p style={{ color: 'var(--secondary)' }}>
                Browse real {guide.name.toLowerCase()} kitchen designs for inspiration
              </p>
            </div>
            <Link
              href={`/photos/kitchen-ideas-and-designs-phbr0-bp~t_709?style=${guide.name}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--primary)',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              View All Photos
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <StyleGallery style={guide.name} />
        </div>
      </section>

      {/* Related Styles CTA */}
      <section style={{ padding: '60px 24px', textAlign: 'center' }}>
        <h2
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '1.5rem',
            fontWeight: 400,
            marginBottom: '16px',
            color: 'var(--foreground)',
          }}
        >
          Explore Other Kitchen Styles
        </h2>
        <p
          style={{
            color: 'var(--secondary)',
            marginBottom: '24px',
          }}
        >
          Not sure if {guide.name.toLowerCase()} is right for you? Compare with other popular styles.
        </p>
        <Link
          href={nav.styles.list()}
          style={{
            display: 'inline-block',
            background: 'var(--primary)',
            color: 'white',
            padding: '14px 32px',
            borderRadius: '4px',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          View All Styles
        </Link>
      </section>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: `${guide.name} Kitchen Design Guide`,
            description: guide.overview,
            author: {
              '@type': 'Organization',
              name: 'AI for All',
            },
            publisher: {
              '@type': 'Organization',
              name: 'AI for All',
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `https://ai-for-all.example.com/styles/${guide.slug}`,
            },
            articleSection: 'Kitchen Design',
            keywords: [
              guide.name,
              'kitchen design',
              'kitchen remodel',
              'interior design',
            ],
          }),
        }}
      />
    </main>
  );
}
