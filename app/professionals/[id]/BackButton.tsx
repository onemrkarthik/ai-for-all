'use client';

import { useRouter } from 'next/navigation';

export function BackButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '0.25rem 0.5rem',
                lineHeight: 1,
                transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--foreground-dark)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
            ←
        </button>
    );
}
