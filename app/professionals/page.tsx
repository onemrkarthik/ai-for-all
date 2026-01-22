import { Metadata } from 'next';
import Link from 'next/link';
import { getAllProfessionals } from '@/lib/services/professionals';
import ProfessionalsList from './ProfessionalsList';

export const metadata: Metadata = {
    title: 'Find Kitchen Design Professionals | AI for All',
    description:
        'Browse our directory of kitchen design professionals. Find experienced designers and contractors with verified reviews and project portfolios.',
    openGraph: {
        title: 'Find Kitchen Design Professionals | AI for All',
        description:
            'Connect with top-rated kitchen designers and contractors. View portfolios, read reviews, and find the perfect professional for your project.',
        type: 'website',
    },
};

export default function ProfessionalsPage() {
    const professionals = getAllProfessionals();

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
                        Kitchen Design Professionals
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
                        Connect with talented designers and contractors who can bring your
                        dream kitchen to life. Browse portfolios, read reviews, and find the
                        perfect match for your project.
                    </p>
                </div>
            </section>

            {/* Professionals List Section */}
            <section style={{ padding: '48px 24px', maxWidth: '900px', margin: '0 auto' }}>
                <ProfessionalsList professionals={professionals} />
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
                        Looking for kitchen inspiration?
                    </h2>
                    <p
                        style={{
                            color: 'var(--secondary)',
                            marginBottom: '24px',
                            lineHeight: 1.6,
                        }}
                    >
                        Browse thousands of kitchen photos to find ideas for your project,
                        then connect with a professional to make it happen.
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
                        Browse Kitchen Photos
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
                        name: 'Kitchen Design Professionals',
                        description: 'Directory of kitchen design professionals.',
                        url: 'https://ai-for-all.example.com/professionals',
                        mainEntity: {
                            '@type': 'ItemList',
                            itemListElement: professionals.map((professional, index) => ({
                                '@type': 'ListItem',
                                position: index + 1,
                                item: {
                                    '@type': 'LocalBusiness',
                                    name: professional.name,
                                    description: professional.company,
                                    url: `https://ai-for-all.example.com/professionals/${professional.id}`,
                                    aggregateRating: professional.averageRating
                                        ? {
                                              '@type': 'AggregateRating',
                                              ratingValue: professional.averageRating,
                                              reviewCount: professional.reviewCount,
                                          }
                                        : undefined,
                                },
                            })),
                        },
                    }),
                }}
            />
        </main>
    );
}
