'use client';

import Image from 'next/image';
import { Item } from '@/lib/data';

interface PhotoCardProps {
    item: Item;
    index: number;
    priority?: boolean;
    onClick?: (item: Item) => void;
}

// Generate a consistent color based on the source name
function getColorForSource(source: string): string {
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#00BCD4', '#E91E63'];
    let hash = 0;
    for (let i = 0; i < source.length; i++) {
        hash = source.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

export function PhotoCard({ item, index, priority = false, onClick }: PhotoCardProps) {
    const handleClick = () => {
        if (onClick) {
            onClick(item);
        }
    };

    const dotColor = getColorForSource(item.source);

    return (
        <div
            data-local-index={index}
            data-photo-id={item.id}
            onClick={handleClick}
            style={{
                borderRadius: '3px',
                overflow: 'hidden',
                animation: 'fadeIn 0.5s ease-out',
                animationFillMode: 'both',
                animationDelay: `${index * 0.03}s`,
                cursor: 'pointer',
                background: 'white',
            }}
        >
            {/* Image container */}
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '4/3',
                    background: '#f5f5f5',
                    overflow: 'hidden',
                }}
            >
                <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    priority={priority}
                    sizes="(max-width: 600px) 50vw, (max-width: 950px) 100vw, (max-width: 1400px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                />
            </div>

            {/* Professional attribution */}
            <div style={{ padding: '0.75rem 0' }}>
                {/* Company name with dot */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.375rem',
                    }}
                >
                    <span
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: dotColor,
                            flexShrink: 0,
                        }}
                    />
                    <span
                        style={{
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                            color: 'var(--foreground-dark)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {item.source}
                    </span>
                </div>

                {/* Description */}
                <p
                    style={{
                        fontSize: '0.8125rem',
                        color: 'var(--text-muted)',
                        lineHeight: 1.4,
                        margin: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}
                >
                    {item.title}
                </p>
            </div>
        </div>
    );
}
