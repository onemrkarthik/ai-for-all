'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ProfessionalRowProps {
    id: number;
    name: string;
    company: string;
    averageRating?: number;
    reviewCount: number;
    projectCount: number;
    index: number;
}

export default function ProfessionalRow({
    id,
    name,
    company,
    averageRating,
    reviewCount,
    projectCount,
    index,
}: ProfessionalRowProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            style={{
                animation: 'fadeIn 0.5s ease-out',
                animationFillMode: 'both',
                animationDelay: `${index * 0.05}s`,
            }}
        >
            <Link
                href={`/professionals/${id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
            >
                <article
                    className="glass"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '1.25rem 1.5rem',
                        borderRadius: '4px',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        cursor: 'pointer',
                        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                        boxShadow: isHovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                        gap: '1.5rem',
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Avatar */}
                    <div
                        style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary) 0%, #2d6b0d 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '1.5rem',
                            flexShrink: 0,
                        }}
                    >
                        {name.charAt(0)}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h3
                            style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: '1.25rem',
                                fontWeight: 500,
                                color: 'var(--foreground-dark)',
                                margin: 0,
                                marginBottom: '0.25rem',
                            }}
                        >
                            {name}
                        </h3>
                        <p
                            style={{
                                fontSize: '0.9375rem',
                                color: 'var(--text-muted)',
                                margin: 0,
                                marginBottom: '0.5rem',
                            }}
                        >
                            {company}
                        </p>

                        {/* Rating and Stats Row */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                flexWrap: 'wrap',
                            }}
                        >
                            {/* Star Rating */}
                            {averageRating ? (
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.375rem',
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '0.125rem' }}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span
                                                key={star}
                                                style={{
                                                    color:
                                                        star <= Math.round(averageRating)
                                                            ? '#FFA500'
                                                            : '#E0E0E0',
                                                    fontSize: '0.875rem',
                                                }}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                    <span
                                        style={{
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            color: 'var(--foreground-dark)',
                                        }}
                                    >
                                        {averageRating.toFixed(1)}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: '0.8125rem',
                                            color: 'var(--text-muted)',
                                        }}
                                    >
                                        ({reviewCount})
                                    </span>
                                </div>
                            ) : (
                                <span
                                    style={{
                                        fontSize: '0.8125rem',
                                        color: 'var(--text-muted)',
                                    }}
                                >
                                    No reviews yet
                                </span>
                            )}

                            {/* Separator */}
                            <span
                                style={{
                                    color: 'var(--border-light)',
                                    fontSize: '0.75rem',
                                }}
                            >
                                |
                            </span>

                            {/* Projects Count */}
                            <span
                                style={{
                                    fontSize: '0.8125rem',
                                    color: 'var(--text-muted)',
                                }}
                            >
                                {projectCount} {projectCount === 1 ? 'project' : 'projects'}
                            </span>
                        </div>
                    </div>

                    {/* Contact Button */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            window.location.href = `/professionals/${id}#contact`;
                        }}
                        style={{
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            padding: '0.625rem 1.25rem',
                            borderRadius: '4px',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'background 0.2s ease',
                            flexShrink: 0,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#2d6b0d';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'var(--primary)';
                        }}
                    >
                        Contact
                    </button>
                </article>
            </Link>
        </div>
    );
}
