'use client';

import Link from 'next/link';
import { useState } from 'react';

export function ProCTACard() {
    const [zipCode, setZipCode] = useState('');

    return (
        <div
            style={{
                background: '#2F3033',
                borderRadius: '3px',
                overflow: 'hidden',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minHeight: '280px',
            }}
        >
            {/* Houzz Logo */}
            <div style={{ marginBottom: '1.25rem' }}>
                <span
                    style={{
                        fontFamily: 'Georgia, serif',
                        fontSize: '1.25rem',
                        fontWeight: 500,
                        color: '#4CAF50',
                        letterSpacing: '-0.02em',
                    }}
                >
                    houzz
                </span>
            </div>

            {/* Title */}
            <h3
                style={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: 'white',
                    lineHeight: 1.3,
                    marginBottom: '1.25rem',
                }}
            >
                Find the right local pro for your project
            </h3>

            {/* ZIP Input + Button */}
            <div
                style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'white',
                        borderRadius: '4px',
                        padding: '0 0.75rem',
                        flex: 1,
                    }}
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#666"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                    </svg>
                    <input
                        type="text"
                        placeholder="ZIP"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        style={{
                            border: 'none',
                            outline: 'none',
                            padding: '0.625rem 0.5rem',
                            fontSize: '0.875rem',
                            width: '100%',
                            background: 'transparent',
                        }}
                    />
                </div>
                <Link
                    href="/professionals"
                    style={{
                        background: '#4CAF50',
                        color: 'white',
                        padding: '0.625rem 1rem',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#43A047';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#4CAF50';
                    }}
                >
                    Get Started
                </Link>
            </div>

            {/* Subtitle */}
            <p
                style={{
                    fontSize: '0.8125rem',
                    color: '#9E9E9E',
                    lineHeight: 1.5,
                    margin: 0,
                }}
            >
                Find top design and renovation professionals with ratings, reviews, and portfolios.
            </p>
        </div>
    );
}
