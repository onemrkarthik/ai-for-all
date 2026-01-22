/**
 * PhotoModal - Full-Screen Photo Viewer Component
 *
 * This file implements a modal interface for viewing photos in full screen with
 * navigation controls and detailed information. The modal overlays the entire
 * viewport and provides keyboard and mouse navigation.
 *
 * Key Features:
 * - Full-screen photo display with contain sizing
 * - Keyboard navigation (Arrow keys for next/prev, Escape to close)
 * - On-demand data fetching for full photo details (Lazy Loading)
 * - Skeleton loading state for sidebar while fetching
 *
 * Layout:
 * - Left side: Full-screen image with navigation buttons
 * - Right side: 380px fixed-width rail with photo metadata
 */

'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Item } from '@/lib/data';
import { marked } from 'marked';
import { api } from '@/lib/api';
import type { Conversation } from '@/lib/api/types';
import { nav } from '@/lib/navigation';

/**
 * Props for the PhotoModal component
 */
interface PhotoModalProps {
    /** The photo to display (initially just grid data) */
    photo: Item | null;

    /** Current photo index in the gallery (null when modal is closed) */
    currentIndex: number | null;

    /** Total number of photos in the gallery */
    totalPhotos: number;

    /** Callback to close the modal */
    onClose: () => void;

    /** Callback to navigate to the next photo */
    onNext: () => void;

    /** Callback to navigate to the previous photo */
    onPrevious: () => void;

    /** Whether more photos are being loaded */
    isLoadingMore?: boolean;
}

/**
 * Extended photo details interface
 *
 * Extends the base Item type with additional data fetched from the API.
 * This is duplicated from services/photos to avoid importing server types in client code.
 *
 * @property description - Detailed description of the photo
 * @property professional - Information about the design professional
 * @property professional.name - Full name of the professional
 * @property professional.company - Company or studio name
 * @property attributes - Array of key-value pairs for photo metadata (style, room type, etc.)
 */
interface FullPhotoDetails extends Item {
    description?: string;
    professional?: {
        id: number;
        name: string;
        company: string;
        averageRating?: number;
        reviewCount?: number;
        reviews?: Array<{
            id: number;
            reviewerName: string;
            rating: number;
            comment: string;
            createdAt: string;
        }>;
    };
    attributes?: Array<{
        label: string;
        value: string;
    }>;
}

/**
 * PERFORMANCE OPTIMIZATION: Hoisted Static Styles
 *
 * These style objects are defined outside the component to prevent
 * recreation on every render, following Vercel's best practices.
 * See docs/REACT_BEST_PRACTICES_REVIEW.md
 */
const modalContainerStyles = {
    position: 'fixed',
    inset: 0,
    background: '#000',
    zIndex: 1000,
    display: 'flex',
} as const;

const imageContainerStyles = {
    flex: 1,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
} as const;

const sidebarStyles = {
    width: '420px',
    background: 'var(--background)',
    height: '100vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-8px 0 24px rgba(0, 0, 0, 0.15)',
    zIndex: 20,
    position: 'relative',
} as const;

const navButtonBaseStyles = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '48px',
    height: '48px',
    borderRadius: '2px',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    color: 'var(--foreground-dark)',
    boxShadow: 'var(--shadow-md)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 10,
} as const;

/**
 * PhotoModal Component
 *
 * Full-screen modal for viewing photos with navigation controls and detailed information.
 * Supports keyboard navigation and lazy-loads full photo details on demand.
 *
 * State Management:
 * - fullDetails: Extended photo data fetched from API
 * - isLoadingDetails: Loading state for sidebar content
 * - isImageLoading: Loading state for main image
 * - showContact: Toggle between standard view and contact form
 *
 * Keyboard Controls:
 * - Left Arrow: Previous photo
 * - Right Arrow: Next photo
 * - Escape: Close modal
 *
 * Performance Optimizations:
 * - Lazy loads full photo details only when modal opens
 * - Image loading state prevents flash of unstyled content
 * - Priority loading for above-the-fold content
 * - Key prop on Image forces reload when photo changes
 *
 * Layout Structure:
 * - Left: Full-screen image viewer with navigation buttons
 * - Right: 380px sidebar with photo details and actions
 *
 * @param props - Photo data, navigation controls, and callbacks
 * @returns Full-screen modal with image viewer and sidebar, or null if no photo selected
 *
 * @example
 * <PhotoModal
 *   photo={currentPhoto}
 *   currentIndex={5}
 *   totalPhotos={100}
 *   onClose={() => setCurrentPhoto(null)}
 *   onNext={handleNext}
 *   onPrevious={handlePrev}
 * />
 */
// ... imports
import { ContactPane } from './ContactPane';

export function PhotoModal({ photo, currentIndex, totalPhotos, onClose, onNext, onPrevious, isLoadingMore = false }: PhotoModalProps) {
    /**
     * State: Full photo details
     * Starts with grid data (optimistic), then enriched with API data
     */
    const [fullDetails, setFullDetails] = useState<FullPhotoDetails | null>(null);

    /**
     * State: Loading indicator for sidebar details
     */
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    /**
     * State: High-res image loading indicator
     * Low-res image shows immediately, high-res fades in when loaded
     */
    const [isHighResLoaded, setIsHighResLoaded] = useState(false);

    /**
     * State: Toggle for contact form view
     * When true, shows ContactPane instead of photo details
     */
    const [showContact, setShowContact] = useState(false);
    const [resumeConversation, setResumeConversation] = useState<Conversation | null>(null);
    const [resumingConversationId, setResumingConversationId] = useState<number | null>(null);

    /**
     * Effect: Reset and fetch photo details when photo changes
     *
     * Behavior:
     * 1. Clear previous details and reset to standard view
     * 2. Optimistically set grid data for immediate display
     * 3. Fetch full details from API endpoint
     * 4. Update state when fetch completes or fails
     */
    useEffect(() => {
        if (!photo) {
            setFullDetails(null);
            setShowContact(false); // Reset to Standard View
            return;
        }

        setShowContact(false); // Reset to Standard View
        setIsHighResLoaded(false); // Reset high-res loading state for new photo

        // Optimistically set what we have (grid data)
        setFullDetails(photo);
        setIsLoadingDetails(true);

        /**
         * Fetch full photo details from API
         *
         * The API endpoint returns extended photo data including:
         * - Professional information (name, company)
         * - Detailed description
         * - Photo attributes (style, room type, etc.)
         *
         * OPTIMIZATION: Conversation fetch runs in parallel (non-blocking)
         * to avoid sequential API waterfall. Photo details display immediately
         * while conversation data loads in background.
         */
        const fetchDetails = async () => {
            try {
                // Fetch photo details first (required for UI)
                const photoDetails = await api.photos.get(photo.id);
                setFullDetails(photoDetails);

                // Fetch conversation in parallel - doesn't block photo details display
                // This eliminates the API waterfall pattern
                if (photoDetails.professional?.id) {
                    api.contact.latest(photoDetails.professional.id)
                        .then(conversationData => setResumeConversation(conversationData.conversation))
                        .catch(err => console.error("Failed to load conversation:", err));
                }
            } catch (error) {
                console.error("Failed to load photo details", error);
            } finally {
                setIsLoadingDetails(false);
            }
        };

        fetchDetails();
    }, [photo]);

    /**
     * Effect: Keyboard navigation handler
     *
     * Supports:
     * - ArrowLeft: Navigate to previous photo
     * - ArrowRight: Navigate to next photo
     * - Escape: Close modal
     *
     * Cleanup: Removes event listener when modal closes or dependencies change
     */
    useEffect(() => {
        if (!photo) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowLeft') {
                onPrevious();
            } else if (e.key === 'ArrowRight') {
                onNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [photo, onClose, onNext, onPrevious]);

    // Don't render modal if no photo is selected
    if (!photo || currentIndex === null) return null;

    /**
     * Get high-resolution version of the image URL for modal view.
     * For Unsplash images, we scale up proportionally to maintain the same aspect ratio.
     * This ensures seamless transition between low-res and high-res.
     */
    const getHighResImageUrl = (imageUrl: string): string => {
        if (imageUrl.includes('images.unsplash.com')) {
            // Parse existing URL to maintain aspect ratio
            const baseUrl = imageUrl.split('?')[0];
            // Scale up 2.4x from 800x600 to 1920x1440 (same 4:3 aspect ratio)
            return `${baseUrl}?w=1920&h=1440&q=90&fit=crop`;
        }
        return imageUrl;
    };
    
    const highResImage = getHighResImageUrl(photo.image);

    /**
     * Derived values for navigation and display
     */
    const isFirst = currentIndex === 0; // Disable previous button on first photo
    const isLast = currentIndex >= totalPhotos - 1 && !isLoadingMore; // Disable next button on last photo (unless loading more)

    return (
        <div style={modalContainerStyles}>
            {/* Image Display Area - Left side, flexes to fill remaining space after sidebar */}
            <div style={imageContainerStyles}>
                {/* 
                  Progressive Image Loading (Seamless):
                  1. Low-res image shows immediately and stays visible
                  2. High-res loads in background and fades in ON TOP
                  3. No opacity dip - low-res is always at 100% until covered
                */}
                
                {/* Low-res image - always fully visible as the base layer */}
                <Image
                    key={`lowres-${photo.id}`}
                    src={photo.image}
                    alt={photo.title}
                    fill
                    sizes="100vw"
                    style={{
                        objectFit: 'contain',
                        zIndex: 1,
                    }}
                    priority
                />
                
                {/* High-res image - fades in seamlessly on top of low-res */}
                <Image
                    key={`highres-${photo.id}`}
                    src={highResImage}
                    alt={photo.title}
                    fill
                    sizes="100vw"
                    quality={90}
                    style={{
                        objectFit: 'contain',
                        opacity: isHighResLoaded ? 1 : 0,
                        transition: 'opacity 0.2s ease-out',
                        zIndex: 2,
                    }}
                    onLoad={() => setIsHighResLoaded(true)}
                />

                {/* Previous Button - Refined Houzz Style */}
                {!isFirst && (
                    <button
                        onClick={onPrevious}
                        aria-label="Previous photo"
                        style={{
                            position: 'absolute',
                            left: '1.5rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '48px',
                            height: '48px',
                            borderRadius: '2px',
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(0, 0, 0, 0.08)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem',
                            color: 'var(--foreground-dark)',
                            boxShadow: 'var(--shadow-md)',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            zIndex: 10,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                            e.currentTarget.style.transform = 'translateY(-50%) translateX(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                            e.currentTarget.style.transform = 'translateY(-50%)';
                        }}
                    >
                        ‹
                    </button>
                )}

                {/* Next Button - Refined Houzz Style */}
                {!isLast && (
                    <button
                        onClick={onNext}
                        aria-label="Next photo"
                        disabled={isLoadingMore}
                        style={{
                            position: 'absolute',
                            right: '1.5rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '48px',
                            height: '48px',
                            borderRadius: '2px',
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(0, 0, 0, 0.08)',
                            cursor: isLoadingMore ? 'wait' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem',
                            color: 'var(--foreground-dark)',
                            boxShadow: 'var(--shadow-md)',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            zIndex: 10,
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoadingMore) {
                                e.currentTarget.style.background = 'white';
                                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                                e.currentTarget.style.transform = 'translateY(-50%) translateX(2px)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                            e.currentTarget.style.transform = 'translateY(-50%)';
                        }}
                    >
                        {isLoadingMore ? (
                            <span style={{
                                width: '20px',
                                height: '20px',
                                border: '2px solid #e0e0e0',
                                borderTopColor: 'var(--primary)',
                                borderRadius: '50%',
                                animation: 'spin 0.8s linear infinite',
                            }} />
                        ) : '›'}
                    </button>
                )}

                {/* Loading indicator when at last photo */}
                {isLoadingMore && currentIndex === totalPhotos - 1 && (
                    <div style={{
                        position: 'absolute',
                        bottom: '2rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        zIndex: 10,
                    }}>
                        <span style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid rgba(255,255,255,0.3)',
                            borderTopColor: 'white',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                        }} />
                        Loading more photos...
                    </div>
                )}

                {/* Spinner animation */}
                <style jsx global>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>

            {/* Right Sidebar - Photo Details and Actions */}
            <div
                style={sidebarStyles}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button - positioned absolutely */}
                <button
                    onClick={onClose}
                    aria-label="Close modal"
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        fontSize: '1.75rem',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        padding: '0.25rem 0.5rem',
                        lineHeight: 1,
                        transition: 'color 0.2s ease',
                        zIndex: 10,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--foreground-dark)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                    ×
                </button>

                {/* Conditional Rendering: Contact Pane or Details */}
                {showContact && fullDetails?.professional ? (
                    // Contact form view - shown when user clicks "Contact Professional"
                    <ContactPane
                        professional={fullDetails.professional}
                        onBack={() => {
                            setShowContact(false);
                            setResumingConversationId(null);
                        }}
                        initialConversationId={resumingConversationId || undefined}
                    />
                ) : (
                    <>
                        {/* Loading State Logic - Show skeleton while fetching details */}
                        {isLoadingDetails && !fullDetails?.professional ? (
                            // Skeleton loading state for sidebar content
                            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {/* Avatar + name skeleton */}
                                <div style={{ height: '40px', background: '#f0f0f0', borderRadius: '4px' }}></div>
                                {/* Title skeleton */}
                                <div style={{ height: '20px', width: '60%', background: '#f0f0f0', borderRadius: '4px' }}></div>
                                {/* Description skeleton */}
                                <div style={{ height: '100px', background: '#f0f0f0', borderRadius: '4px' }}></div>
                            </div>
                        ) : (
                            <>
                                {/* Professional Information Section */}
                                <div
                                    style={{
                                        padding: '1.75rem 1.75rem 1.5rem',
                                        borderBottom: '1px solid var(--border-light)',
                                        background: 'white',
                                    }}
                                >
                                    {/* Professional avatar and name - Now at top */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.875rem',
                                        marginBottom: '1.5rem',
                                    }}>
                                        {/* Avatar circle with initial */}
                                        <div
                                            style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontWeight: 600,
                                                fontSize: '1.125rem',
                                                boxShadow: '0 2px 8px rgba(var(--primary-rgb), 0.25)',
                                            }}
                                        >
                                            {fullDetails?.professional?.name?.charAt(0) || 'D'}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <Link
                                                href={nav.professionals.detail(fullDetails?.professional?.id || 0)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    textDecoration: 'none',
                                                }}
                                            >
                                                <h4 style={{
                                                    fontSize: '1rem',
                                                    fontWeight: 600,
                                                    marginBottom: '0.25rem',
                                                    color: 'var(--foreground-dark)',
                                                    cursor: 'pointer',
                                                    transition: 'color 0.2s ease',
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--foreground-dark)'}
                                                >
                                                    {fullDetails?.professional?.name || 'Design Professional'}
                                                </h4>
                                            </Link>
                                            <p style={{
                                                fontSize: '0.875rem',
                                                color: 'var(--text-muted)',
                                                marginBottom: '0.25rem',
                                            }}>
                                                {fullDetails?.professional?.company || 'Design Studio'}
                                            </p>
                                            {/* Star rating */}
                                            {fullDetails?.professional?.averageRating && (
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.375rem',
                                                }}>
                                                    <div style={{ display: 'flex', gap: '0.125rem' }}>
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <span key={star} style={{
                                                                color: star <= Math.round(fullDetails.professional!.averageRating!) ? '#FFA500' : '#E0E0E0',
                                                                fontSize: '0.875rem',
                                                            }}>★</span>
                                                        ))}
                                                    </div>
                                                    <span style={{
                                                        fontSize: '0.8125rem',
                                                        fontWeight: 600,
                                                        color: 'var(--foreground-dark)',
                                                    }}>
                                                        {fullDetails.professional.averageRating.toFixed(1)}
                                                    </span>
                                                    <span style={{
                                                        fontSize: '0.8125rem',
                                                        color: 'var(--text-muted)',
                                                    }}>
                                                        ({fullDetails.professional.reviewCount} {fullDetails.professional.reviewCount === 1 ? 'review' : 'reviews'})
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Photo title */}
                                    <h2 style={{
                                        fontFamily: 'var(--font-serif)',
                                        fontSize: '1.5rem',
                                        fontWeight: 500,
                                        marginBottom: '1rem',
                                        color: 'var(--foreground-dark)',
                                        lineHeight: 1.3,
                                        letterSpacing: '-0.01em',
                                    }}>
                                        {fullDetails?.title}
                                    </h2>

                                    {/* Photo description with fallback */}
                                    <p style={{
                                        fontSize: '0.9375rem',
                                        lineHeight: 1.7,
                                        color: 'var(--foreground)',
                                        marginBottom: '1rem',
                                    }}>
                                        {fullDetails?.description || 'A beautifully designed modern kitchen featuring clean lines, high-quality materials, and thoughtful details that create a warm and inviting space for cooking and gathering.'}
                                    </p>

                                    {/* Resume Chat Module */}
                                    {!showContact && resumeConversation && resumeConversation.last_summary && (
                                        <div style={{
                                            margin: '1rem 0',
                                            padding: '1rem',
                                            background: 'var(--primary-light)',
                                            borderRadius: '4px',
                                            border: '1px solid var(--border-light)',
                                            borderLeft: '3px solid var(--primary)'
                                        }}>
                                            <h4 style={{
                                                fontSize: '0.8125rem',
                                                fontWeight: 700,
                                                color: 'var(--primary-dark)',
                                                textTransform: 'uppercase',
                                                marginBottom: '0.625rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                letterSpacing: '0.03em',
                                                position: 'relative',
                                            }}>
                                                <span style={{ fontSize: '1rem' }}>📋</span>
                                                Your conversation with the pro
                                                {/* New message indicator */}
                                                {resumeConversation.has_new_messages && (
                                                    <span style={{
                                                        width: '8px',
                                                        height: '8px',
                                                        background: '#FF4444',
                                                        borderRadius: '50%',
                                                        boxShadow: '0 0 6px rgba(255, 68, 68, 0.6)',
                                                        animation: 'pulse 2s ease-in-out infinite',
                                                    }} />
                                                )}
                                            </h4>
                                            <style jsx>{`
                                                @keyframes pulse {
                                                    0%, 100% { opacity: 1; }
                                                    50% { opacity: 0.5; }
                                                }
                                            `}</style>
                                            <div
                                                className="conversation-summary"
                                                style={{
                                                    fontSize: '0.875rem',
                                                    color: 'var(--foreground)',
                                                    marginBottom: '0.875rem',
                                                    lineHeight: 1.5,
                                                    maxHeight: '80px',
                                                    overflow: 'auto',
                                                }}
                                                dangerouslySetInnerHTML={{
                                                    __html: resumeConversation.last_summary
                                                        ? marked.parse(resumeConversation.last_summary) as string
                                                        : ''
                                                }}
                                            />
                                            <style jsx>{`
                                                .conversation-summary h3 {
                                                    font-size: 0.9375rem;
                                                    font-weight: 600;
                                                    margin: 0 0 0.5rem 0;
                                                    color: var(--foreground-dark);
                                                }
                                                .conversation-summary ul {
                                                    margin: 0.5rem 0;
                                                    padding-left: 1.25rem;
                                                }
                                                .conversation-summary li {
                                                    margin: 0.25rem 0;
                                                }
                                                .conversation-summary p {
                                                    margin: 0.5rem 0;
                                                }
                                                .conversation-summary strong {
                                                    font-weight: 600;
                                                    color: var(--foreground-dark);
                                                }
                                            `}</style>
                                            <div style={{
                                                display: 'flex',
                                                gap: '0.75rem',
                                            }}>
                                                <button
                                                    onClick={async () => {
                                                        setResumingConversationId(resumeConversation.id);
                                                        setShowContact(true);

                                                        // Mark conversation as viewed to clear notification
                                                        try {
                                                            await api.contact.markViewed({ conversationId: resumeConversation.id });
                                                        } catch (error) {
                                                            console.error('Failed to mark conversation as viewed:', error);
                                                        }
                                                    }}
                                                    className="btn btn-primary"
                                                    style={{
                                                        flex: 1,
                                                        fontSize: '0.9375rem',
                                                        padding: '0.75rem 1.5rem',
                                                        position: 'relative',
                                                    }}
                                                >
                                                    Resume Conversation
                                                    {/* Notification badge for new messages */}
                                                    {resumeConversation.has_new_messages && (
                                                        <span style={{
                                                            position: 'absolute',
                                                            top: '-6px',
                                                            right: '-6px',
                                                            width: '18px',
                                                            height: '18px',
                                                            background: '#FF4444',
                                                            borderRadius: '50%',
                                                            border: '2px solid white',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '0.625rem',
                                                            fontWeight: 700,
                                                            color: 'white',
                                                            boxShadow: '0 2px 4px rgba(255, 68, 68, 0.4)',
                                                        }}>
                                                            !
                                                        </span>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => setShowContact(true)}
                                                    className="btn"
                                                    style={{
                                                        flex: 1,
                                                        fontSize: '0.9375rem',
                                                        padding: '0.75rem 1.5rem',
                                                    }}
                                                >
                                                    Start New
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Contact professional CTA - Show if no conversation OR no summary */}
                                    {(!resumeConversation || !resumeConversation.last_summary) && (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => setShowContact(true)}
                                            style={{ width: '100%', marginTop: '0.25rem', fontSize: '0.9375rem', padding: '0.75rem 1.5rem' }}
                                        >
                                            Contact Professional
                                        </button>
                                    )}

                                    {/* Save button - Always shown as secondary CTA */}
                                    <button
                                        className="btn"
                                        style={{
                                            width: '100%',
                                            marginTop: '0.75rem',
                                            fontSize: '0.9375rem',
                                            padding: '0.75rem 1.5rem',
                                        }}
                                    >
                                        <span style={{ marginRight: '0.5rem' }}>♡</span>
                                        Save Photo
                                    </button>
                                </div>

                                {/* Photo Attributes Section - Refined Design */}
                                <div
                                    style={{
                                        padding: '1rem 1.75rem',
                                        background: 'var(--cream)',
                                    }}
                                >
                                    <h3 style={{
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        marginBottom: '0.75rem',
                                        color: 'var(--text-subtle)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                    }}>
                                        Photo Details
                                    </h3>

                                    {/* Grid of attribute items */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(2, 1fr)',
                                        gap: '0.5rem',
                                    }}>
                                        {(fullDetails?.attributes || []).map((attr, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    background: 'white',
                                                    borderRadius: '3px',
                                                    padding: '0.625rem 0.75rem',
                                                    border: '1px solid var(--border-light)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '0.125rem',
                                                    transition: 'all 0.2s ease',
                                                }}
                                            >
                                                {/* Attribute label */}
                                                <div style={{
                                                    fontSize: '0.6875rem',
                                                    color: 'var(--text-subtle)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                    fontWeight: 600,
                                                }}>
                                                    {attr.label}
                                                </div>
                                                {/* Attribute value */}
                                                <div style={{
                                                    fontSize: '0.875rem',
                                                    color: 'var(--foreground-dark)',
                                                    fontWeight: 600,
                                                    lineHeight: 1.3,
                                                }}>
                                                    {attr.value}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>


                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
