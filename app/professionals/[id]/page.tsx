import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { ContactSection } from './ContactSection';
import { PhotoCard } from './PhotoCard';
import { PhotoGalleryProvider } from '@/app/components/PhotoGallery';
import { PhotoGalleryRegistrar } from './PhotoGalleryRegistrar';
import { Item } from '@/lib/data';
import { getProfessionalById, ProfessionalDetails } from '@/lib/services/professionals';
import { getLatestConversationByProfessionalId } from '@/lib/services/chat';

interface ConversationData {
    conversation?: {
        id: number;
        last_summary?: string;
        has_new_messages: boolean;
    };
}

// Fetch professional data directly from service layer (server component)
function getProfessional(id: string): ProfessionalDetails | null {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) return null;
    return getProfessionalById(numericId);
}

// Fetch conversation data directly from service layer (server component)
function getConversation(professionalId: string): ConversationData {
    const numericId = parseInt(professionalId, 10);
    if (isNaN(numericId)) return {};

    const conversation = getLatestConversationByProfessionalId(numericId);
    if (!conversation) return {};

    return {
        conversation: {
            id: conversation.id,
            last_summary: conversation.last_summary,
            has_new_messages: conversation.has_new_messages ?? false,
        }
    };
}

// Loading component for contact section
function ContactSectionSkeleton() {
    return (
        <div style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
            <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '4px',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)',
                minHeight: '200px',
            }}>
                <div style={{
                    background: 'var(--background-warm)',
                    height: '24px',
                    width: '60%',
                    borderRadius: '4px',
                    marginBottom: '1rem',
                }}></div>
                <div style={{
                    background: 'var(--background-warm)',
                    height: '60px',
                    width: '100%',
                    borderRadius: '4px',
                }}></div>
            </div>
        </div>
    );
}

// Server Component: Contact section with data fetching
function ContactSectionWithData({ professionalId, professional }: {
    professionalId: string;
    professional: { id: number; name: string; company: string };
}) {
    const conversationData = getConversation(professionalId);

    return (
        <ContactSection
            professional={professional}
            existingConversationId={conversationData.conversation?.id}
            conversationSummary={conversationData.conversation?.last_summary}
            hasNewMessages={conversationData.conversation?.has_new_messages}
        />
    );
}

export default async function ProfessionalPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const professional = getProfessional(id);

    if (!professional) {
        notFound();
    }

    // Convert professional photos to Item format for PhotoGallery
    const galleryPhotos: Item[] = professional.photos?.map(photo => ({
        id: photo.id,
        title: photo.title,
        source: 'Professional Portfolio',
        image: photo.image,
    })) || [];

    return (
        <PhotoGalleryProvider>
            <PhotoGalleryRegistrar photos={galleryPhotos} />
            <div style={{ minHeight: '100vh', background: 'var(--background-warm)' }}>
            <div className="container" style={{
                paddingTop: '2rem',
                paddingBottom: '4rem',
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr',
                    gap: '3rem',
                }}>
                    {/* Left Column - Professional Info & Gallery */}
                    <div>
                        {/* Professional Header */}
                        <div style={{
                            background: 'white',
                            padding: '2.5rem',
                            borderRadius: '4px',
                            border: '1px solid var(--border-light)',
                            boxShadow: 'var(--shadow-sm)',
                            marginBottom: '2rem',
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1.5rem',
                                marginBottom: '1.5rem',
                            }}>
                                <div
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 600,
                                        fontSize: '2rem',
                                        boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.3)',
                                    }}
                                >
                                    {professional.name.charAt(0)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h1 style={{
                                        fontFamily: 'var(--font-serif)',
                                        fontSize: '2.25rem',
                                        fontWeight: 500,
                                        marginBottom: '0.5rem',
                                        color: 'var(--foreground-dark)',
                                        letterSpacing: '-0.02em',
                                    }}>
                                        {professional.name}
                                    </h1>
                                    <p style={{
                                        fontSize: '1.125rem',
                                        color: 'var(--text-muted)',
                                        marginBottom: '0.75rem',
                                    }}>
                                        {professional.company}
                                    </p>
                                    {/* Star rating */}
                                    {professional.averageRating && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                        }}>
                                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <span key={star} style={{
                                                        color: star <= Math.round(professional.averageRating!) ? '#FFA500' : '#E0E0E0',
                                                        fontSize: '1.25rem',
                                                    }}>★</span>
                                                ))}
                                            </div>
                                            <span style={{
                                                fontSize: '1rem',
                                                fontWeight: 600,
                                                color: 'var(--foreground-dark)',
                                            }}>
                                                {professional.averageRating.toFixed(1)}
                                            </span>
                                            <span style={{
                                                fontSize: '1rem',
                                                color: 'var(--text-muted)',
                                            }}>
                                                ({professional.reviewCount} {professional.reviewCount === 1 ? 'review' : 'reviews'})
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '1rem',
                                padding: '1.5rem 0',
                                borderTop: '1px solid var(--border-light)',
                            }}>
                                <div style={{
                                    textAlign: 'center',
                                }}>
                                    <div style={{
                                        fontSize: '2rem',
                                        fontWeight: 600,
                                        color: 'var(--primary)',
                                        marginBottom: '0.25rem',
                                    }}>
                                        {professional.totalProjects || 0}
                                    </div>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        color: 'var(--text-muted)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        fontWeight: 600,
                                    }}>
                                        Projects
                                    </div>
                                </div>
                                <div style={{
                                    textAlign: 'center',
                                }}>
                                    <div style={{
                                        fontSize: '2rem',
                                        fontWeight: 600,
                                        color: 'var(--primary)',
                                        marginBottom: '0.25rem',
                                    }}>
                                        {professional.reviewCount || 0}
                                    </div>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        color: 'var(--text-muted)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        fontWeight: 600,
                                    }}>
                                        Reviews
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Projects Gallery */}
                        <div style={{
                            background: 'white',
                            padding: '2rem',
                            borderRadius: '4px',
                            border: '1px solid var(--border-light)',
                            boxShadow: 'var(--shadow-sm)',
                            marginBottom: '2rem',
                        }}>
                            <h2 style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: '1.75rem',
                                fontWeight: 500,
                                marginBottom: '1.5rem',
                                color: 'var(--foreground-dark)',
                            }}>
                                Projects
                            </h2>

                            <div className="photo-grid" style={{ gap: '1rem' }}>
                                {galleryPhotos.map((photo, index) => (
                                    <PhotoCard key={photo.id} photo={photo} index={index} />
                                ))}
                            </div>
                        </div>

                        {/* Reviews Section */}
                        {professional.reviews && professional.reviews.length > 0 && (
                            <div style={{
                                background: 'white',
                                padding: '2rem',
                                borderRadius: '4px',
                                border: '1px solid var(--border-light)',
                                boxShadow: 'var(--shadow-sm)',
                            }}>
                                <h2 style={{
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: '1.75rem',
                                    fontWeight: 500,
                                    marginBottom: '1.5rem',
                                    color: 'var(--foreground-dark)',
                                }}>
                                    Reviews
                                </h2>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1.25rem',
                                }}>
                                    {professional.reviews.map((review) => (
                                        <div
                                            key={review.id}
                                            style={{
                                                padding: '1.25rem',
                                                background: 'var(--accent)',
                                                borderRadius: '4px',
                                                border: '1px solid var(--border-light)',
                                            }}
                                        >
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '0.75rem',
                                            }}>
                                                <span style={{
                                                    fontSize: '1rem',
                                                    fontWeight: 600,
                                                    color: 'var(--foreground-dark)',
                                                }}>
                                                    {review.reviewerName}
                                                </span>
                                                <div style={{ display: 'flex', gap: '0.125rem' }}>
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <span key={star} style={{
                                                            color: star <= review.rating ? '#FFA500' : '#E0E0E0',
                                                            fontSize: '1rem',
                                                        }}>★</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <p style={{
                                                fontSize: '0.9375rem',
                                                lineHeight: 1.6,
                                                color: 'var(--foreground)',
                                                margin: 0,
                                            }}>
                                                {review.comment}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Contact Module with Streaming */}
                    <Suspense fallback={<ContactSectionSkeleton />}>
                        <ContactSectionWithData
                            professionalId={id}
                            professional={{
                                id: professional.id,
                                name: professional.name,
                                company: professional.company,
                            }}
                        />
                    </Suspense>
                </div>
            </div>
        </div>
        </PhotoGalleryProvider>
    );
}
