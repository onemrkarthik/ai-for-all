'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    itemsPerPage: number;
}

export function Pagination({ currentPage, totalPages, totalCount, itemsPerPage }: PaginationProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const createPageUrl = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        if (page === 1) {
            params.delete('page');
        } else {
            params.set('page', page.toString());
        }
        const queryString = params.toString();
        return queryString ? `${pathname}?${queryString}` : pathname;
    };

    // Calculate display range
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalCount);

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 7;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage > 3) {
                pages.push('...');
            }

            // Show pages around current
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push('...');
            }

            // Always show last page
            pages.push(totalPages);
        }

        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            padding: '2rem 0',
            borderTop: '1px solid var(--border-light)',
            marginTop: '2rem',
        }}>
            {/* Photo count */}
            <div style={{
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
            }}>
                Showing {startItem} - {endItem} of {totalCount.toLocaleString()} photos
            </div>

            {/* Pagination controls */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
            }}>
                {/* Previous button */}
                {currentPage > 1 ? (
                    <Link
                        href={createPageUrl(currentPage - 1)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '36px',
                            height: '36px',
                            borderRadius: '4px',
                            border: '1px solid var(--border-color)',
                            background: 'white',
                            color: 'var(--foreground-dark)',
                            textDecoration: 'none',
                            transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f5f5f5';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </Link>
                ) : (
                    <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '36px',
                        height: '36px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-light)',
                        background: '#f9f9f9',
                        color: '#ccc',
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </span>
                )}

                {/* Page numbers */}
                {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                        <span
                            key={`ellipsis-${index}`}
                            style={{
                                padding: '0 0.5rem',
                                color: 'var(--text-muted)',
                            }}
                        >
                            ...
                        </span>
                    ) : (
                        <Link
                            key={page}
                            href={createPageUrl(page as number)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: '36px',
                                height: '36px',
                                padding: '0 0.5rem',
                                borderRadius: '4px',
                                border: currentPage === page
                                    ? '1px solid var(--foreground-dark)'
                                    : '1px solid transparent',
                                background: currentPage === page ? '#f5f5f5' : 'transparent',
                                color: 'var(--foreground-dark)',
                                textDecoration: 'none',
                                fontSize: '0.875rem',
                                fontWeight: currentPage === page ? 600 : 400,
                                transition: 'background 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                                if (currentPage !== page) {
                                    e.currentTarget.style.background = '#f9f9f9';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (currentPage !== page) {
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            {page}
                        </Link>
                    )
                ))}

                {/* Next button */}
                {currentPage < totalPages ? (
                    <Link
                        href={createPageUrl(currentPage + 1)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '36px',
                            height: '36px',
                            borderRadius: '4px',
                            border: '1px solid var(--border-color)',
                            background: 'white',
                            color: 'var(--foreground-dark)',
                            textDecoration: 'none',
                            transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f5f5f5';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </Link>
                ) : (
                    <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '36px',
                        height: '36px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-light)',
                        background: '#f9f9f9',
                        color: '#ccc',
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </span>
                )}
            </div>
        </div>
    );
}
