'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { nav } from '@/lib/navigation';

const NAV_ITEMS = [
    { label: 'Find Pros', href: '/professionals', hasDropdown: true },
    { label: 'Ideas', href: nav.photos.ideas(), hasDropdown: true },
    { label: 'Shop', href: '#', hasDropdown: true },
];

export default function Header() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (href: string) => {
        if (href.startsWith('/photos')) {
            return pathname.startsWith('/photos');
        }
        if (href.startsWith('/professionals')) {
            return pathname.startsWith('/professionals');
        }
        return pathname === href;
    };

    return (
        <header
            style={{
                background: 'white',
                borderBottom: '1px solid var(--border-light)',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                width: '100%',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 24px',
                    width: '100%',
                    boxSizing: 'border-box',
                    gap: '1.5rem',
                }}
            >
                {/* Left side: Logo + Navigation */}
                <div
                    className="header-left"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem',
                        flexShrink: 0,
                    }}
                >
                    {/* Logo */}
                    <Link
                        href="/"
                        style={{
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <span
                            style={{
                                fontFamily: 'Georgia, serif',
                                fontSize: '1.5rem',
                                fontWeight: 500,
                                color: 'var(--primary)',
                                letterSpacing: '-0.02em',
                            }}
                        >
                            houzz
                        </span>
                    </Link>

                    {/* Desktop Navigation with Dropdowns */}
                    <nav
                        className="desktop-nav"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                        }}
                    >
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{
                                    textDecoration: 'none',
                                    fontSize: '0.9375rem',
                                    fontWeight: 500,
                                    color: isActive(item.href)
                                        ? 'var(--foreground-dark)'
                                        : 'var(--foreground)',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    transition: 'background 0.15s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#f5f5f5';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                {item.label}
                                {item.hasDropdown && (
                                    <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                )}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Center: Search Bar */}
                <div
                    className="search-container"
                    style={{
                        flex: 1,
                        maxWidth: '400px',
                        display: 'flex',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            background: '#f5f5f5',
                            borderRadius: '4px',
                            padding: '0.5rem 0.75rem',
                            gap: '0.5rem',
                            border: '1px solid transparent',
                            transition: 'border-color 0.15s ease, background 0.15s ease',
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-light)';
                            e.currentTarget.style.background = 'white';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'transparent';
                            e.currentTarget.style.background = '#f5f5f5';
                        }}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#999"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search Houzz"
                            style={{
                                flex: 1,
                                border: 'none',
                                background: 'transparent',
                                fontSize: '0.875rem',
                                outline: 'none',
                                color: 'var(--foreground)',
                            }}
                        />
                    </div>
                </div>

                {/* Right side: Auth Buttons */}
                <div
                    className="header-right"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        flexShrink: 0,
                    }}
                >
                    <button
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: 'var(--foreground)',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                        }}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        Sign In
                    </button>
                    <button
                        style={{
                            background: 'white',
                            border: '1px solid var(--foreground-dark)',
                            borderRadius: '4px',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: 'var(--foreground-dark)',
                            cursor: 'pointer',
                            padding: '0.5rem 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f5f5f5';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                        }}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        Join as a Pro
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="mobile-menu-btn"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                    style={{
                        display: 'none',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem',
                    }}
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--foreground)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        {mobileMenuOpen ? (
                            <>
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </>
                        ) : (
                            <>
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </>
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Navigation Menu */}
            <nav
                className="mobile-nav"
                style={{
                    display: mobileMenuOpen ? 'flex' : 'none',
                    flexDirection: 'column',
                    padding: '0 24px 1rem',
                    gap: '0.5rem',
                    borderTop: '1px solid var(--border-light)',
                }}
            >
                {/* Mobile Search */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: '#f5f5f5',
                        borderRadius: '4px',
                        padding: '0.75rem',
                        gap: '0.5rem',
                        marginTop: '0.75rem',
                    }}
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#999"
                        strokeWidth="2"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search Houzz"
                        style={{
                            flex: 1,
                            border: 'none',
                            background: 'transparent',
                            fontSize: '1rem',
                            outline: 'none',
                        }}
                    />
                </div>

                {NAV_ITEMS.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                            textDecoration: 'none',
                            fontSize: '1rem',
                            fontWeight: 500,
                            color: isActive(item.href)
                                ? 'var(--primary)'
                                : 'var(--foreground)',
                            padding: '0.75rem 0',
                            borderBottom: '1px solid var(--border-light)',
                        }}
                    >
                        {item.label}
                    </Link>
                ))}

                {/* Mobile Auth */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                        style={{
                            flex: 1,
                            background: 'none',
                            border: '1px solid var(--border-light)',
                            borderRadius: '4px',
                            padding: '0.75rem',
                            fontSize: '0.9375rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                        }}
                    >
                        Sign In
                    </button>
                    <button
                        style={{
                            flex: 1,
                            background: 'var(--foreground-dark)',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '0.75rem',
                            fontSize: '0.9375rem',
                            fontWeight: 500,
                            color: 'white',
                            cursor: 'pointer',
                        }}
                    >
                        Join as Pro
                    </button>
                </div>
            </nav>

            {/* Responsive Styles */}
            <style jsx global>{`
                @media (max-width: 768px) {
                    .desktop-nav,
                    .header-right,
                    .search-container {
                        display: none !important;
                    }
                    .mobile-menu-btn {
                        display: block !important;
                    }
                }
                @media (min-width: 769px) {
                    .mobile-nav {
                        display: none !important;
                    }
                }
            `}</style>
        </header>
    );
}
