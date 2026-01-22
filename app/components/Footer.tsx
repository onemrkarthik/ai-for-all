import Link from 'next/link';
import { nav } from '@/lib/navigation';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer
            style={{
                background: 'var(--foreground-dark)',
                color: 'white',
                padding: '48px 24px 24px',
            }}
        >
            <div
                style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                }}
            >
                {/* Footer Links */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '2rem',
                        marginBottom: '2rem',
                    }}
                >
                    {/* Explore */}
                    <div>
                        <h4
                            style={{
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: '1rem',
                                color: 'rgba(255, 255, 255, 0.7)',
                            }}
                        >
                            Explore
                        </h4>
                        <ul
                            style={{
                                listStyle: 'none',
                                padding: 0,
                                margin: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem',
                            }}
                        >
                            <li>
                                <Link
                                    href={nav.photos.ideas()}
                                    style={{
                                        color: 'rgba(255, 255, 255, 0.85)',
                                        textDecoration: 'none',
                                        fontSize: '0.9375rem',
                                    }}
                                >
                                    Kitchen Photos
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={nav.styles.list()}
                                    style={{
                                        color: 'rgba(255, 255, 255, 0.85)',
                                        textDecoration: 'none',
                                        fontSize: '0.9375rem',
                                    }}
                                >
                                    Design Styles
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={nav.professionals.list()}
                                    style={{
                                        color: 'rgba(255, 255, 255, 0.85)',
                                        textDecoration: 'none',
                                        fontSize: '0.9375rem',
                                    }}
                                >
                                    Find Professionals
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Styles */}
                    <div>
                        <h4
                            style={{
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: '1rem',
                                color: 'rgba(255, 255, 255, 0.7)',
                            }}
                        >
                            Styles
                        </h4>
                        <ul
                            style={{
                                listStyle: 'none',
                                padding: 0,
                                margin: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem',
                            }}
                        >
                            <li>
                                <Link
                                    href={nav.styles.detail('modern')}
                                    style={{
                                        color: 'rgba(255, 255, 255, 0.85)',
                                        textDecoration: 'none',
                                        fontSize: '0.9375rem',
                                    }}
                                >
                                    Modern
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={nav.styles.detail('farmhouse')}
                                    style={{
                                        color: 'rgba(255, 255, 255, 0.85)',
                                        textDecoration: 'none',
                                        fontSize: '0.9375rem',
                                    }}
                                >
                                    Farmhouse
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={nav.styles.detail('contemporary')}
                                    style={{
                                        color: 'rgba(255, 255, 255, 0.85)',
                                        textDecoration: 'none',
                                        fontSize: '0.9375rem',
                                    }}
                                >
                                    Contemporary
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* About */}
                    <div>
                        <h4
                            style={{
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: '1rem',
                                color: 'rgba(255, 255, 255, 0.7)',
                            }}
                        >
                            About
                        </h4>
                        <ul
                            style={{
                                listStyle: 'none',
                                padding: 0,
                                margin: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem',
                            }}
                        >
                            <li>
                                <span
                                    style={{
                                        color: 'rgba(255, 255, 255, 0.85)',
                                        fontSize: '0.9375rem',
                                    }}
                                >
                                    About Us
                                </span>
                            </li>
                            <li>
                                <span
                                    style={{
                                        color: 'rgba(255, 255, 255, 0.85)',
                                        fontSize: '0.9375rem',
                                    }}
                                >
                                    Contact
                                </span>
                            </li>
                            <li>
                                <span
                                    style={{
                                        color: 'rgba(255, 255, 255, 0.85)',
                                        fontSize: '0.9375rem',
                                    }}
                                >
                                    Privacy
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div
                    style={{
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                        paddingTop: '1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1rem',
                    }}
                >
                    {/* Logo */}
                    <span
                        style={{
                            fontFamily: 'Georgia, serif',
                            fontSize: '1.25rem',
                            fontWeight: 500,
                            color: 'var(--primary)',
                        }}
                    >
                        houzz
                    </span>

                    {/* Copyright */}
                    <p
                        style={{
                            fontSize: '0.8125rem',
                            color: 'rgba(255, 255, 255, 0.5)',
                            margin: 0,
                        }}
                    >
                        © {currentYear} Houzz Inc. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
