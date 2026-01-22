'use client';

import Image from 'next/image';
import { Item } from '@/lib/data';

interface PhotoCardProps {
    item: Item;
    index: number;
    priority?: boolean;
    /** Skip animation for LCP optimization (first image should render immediately) */
    skipAnimation?: boolean;
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

export function PhotoCard({ item, index, priority = false, skipAnimation = false, onClick }: PhotoCardProps) {
    const handleClick = () => {
        if (onClick) {
            onClick(item);
        }
    };

    const dotColor = getColorForSource(item.source);

    // LCP optimization: First image should render immediately without animation delay
    const animationStyle = skipAnimation
        ? {}
        : {
            animation: 'fadeIn 0.5s ease-out',
            animationFillMode: 'both' as const,
            animationDelay: `${index * 0.03}s`,
        };

    return (
        <div
            data-local-index={index}
            data-photo-id={item.id}
            onClick={handleClick}
            style={{
                borderRadius: '3px',
                overflow: 'hidden',
                cursor: 'pointer',
                background: 'white',
                ...animationStyle,
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
                    // Mobile-first sizes: on mobile (<=600px) images are ~50vw
                    // This helps browser choose optimal image size for LCP
                    sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, (max-width: 1200px) 25vw, 20vw"
                    style={{ objectFit: 'cover' }}
                    // Blur placeholder for perceived performance
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDBAMBAAAAAAAAAAAAAQIDAAQRBRIhMQYTQVH/xAAVAQEBAAAAAAAAAAAAAAAAAAADBP/EABkRAAIDAQAAAAAAAAAAAAAAAAECAAMRIf/aAAwDAQACEQMRAD8AzPT9YvbeBIYLiWOJBtVFYgAdhRRWlViKvJk5LGy7n//Z"
                    // Reduce loading attribute impact by using eager for priority images
                    loading={priority ? 'eager' : 'lazy'}
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
