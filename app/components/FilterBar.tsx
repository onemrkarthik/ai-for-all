'use client';

import { useState, useCallback } from 'react';

export interface FilterOption {
    label: string;
    values: string[];
}

export interface FilterValues {
    [key: string]: string | null;
}

interface FilterBarProps {
    filters: FilterOption[];
    onFilterChange: (filters: FilterValues) => void;
    activeFilters: FilterValues;
    totalCount?: number;
}

const QUICK_FILTERS = [
    'Modern',
    'Farmhouse',
    'Transitional',
    'Traditional',
    'Contemporary',
    'White',
    'Mid-Century Modern',
    'Beige',
    'Green',
    'Blue',
];

export function FilterBar({ filters, onFilterChange, activeFilters, totalCount = 0 }: FilterBarProps) {
    const handleChange = useCallback((label: string, value: string) => {
        const newValue = value === '' ? null : value;
        onFilterChange({
            ...activeFilters,
            [label]: newValue
        });
    }, [activeFilters, onFilterChange]);

    const handleQuickFilter = useCallback((value: string) => {
        // Toggle quick filter - apply to Style filter
        const currentStyle = activeFilters['Style'];
        if (currentStyle === value) {
            onFilterChange({
                ...activeFilters,
                'Style': null
            });
        } else {
            onFilterChange({
                ...activeFilters,
                'Style': value
            });
        }
    }, [activeFilters, onFilterChange]);

    const clearAllFilters = useCallback(() => {
        const cleared: FilterValues = {};
        filters.forEach(f => {
            cleared[f.label] = null;
        });
        onFilterChange(cleared);
    }, [filters, onFilterChange]);

    const activeCount = Object.values(activeFilters).filter(v => v !== null).length;

    return (
        <div style={{
            background: 'white',
            borderBottom: '1px solid var(--border-light)',
            padding: '0.75rem 24px',
        }}>
            {/* Row 1: All Filters + Filter Dropdowns */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                overflowX: 'auto',
                paddingBottom: '0.75rem',
            }}>
                {/* All Filters Button */}
                <button
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        background: 'white',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'var(--foreground-dark)',
                        cursor: 'pointer',
                        flexShrink: 0,
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="4" y1="21" x2="4" y2="14" />
                        <line x1="4" y1="10" x2="4" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12" y2="3" />
                        <line x1="20" y1="21" x2="20" y2="16" />
                        <line x1="20" y1="12" x2="20" y2="3" />
                        <line x1="1" y1="14" x2="7" y2="14" />
                        <line x1="9" y1="8" x2="15" y2="8" />
                        <line x1="17" y1="16" x2="23" y2="16" />
                    </svg>
                    All Filters
                    {activeCount > 0 && (
                        <span style={{
                            background: 'var(--primary)',
                            color: 'white',
                            fontSize: '0.75rem',
                            padding: '0.125rem 0.375rem',
                            borderRadius: '10px',
                            marginLeft: '0.25rem',
                        }}>
                            {activeCount}
                        </span>
                    )}
                </button>

                {/* Filter Dropdowns */}
                {filters.slice(0, 8).map((filter) => (
                    <select
                        key={filter.label}
                        value={activeFilters[filter.label] || ''}
                        onChange={(e) => handleChange(filter.label, e.target.value)}
                        style={{
                            padding: '0.5rem 2rem 0.5rem 0.75rem',
                            border: activeFilters[filter.label]
                                ? '1px solid var(--foreground-dark)'
                                : '1px solid var(--border-color)',
                            borderRadius: '4px',
                            fontSize: '0.875rem',
                            background: 'white',
                            color: 'var(--foreground-dark)',
                            cursor: 'pointer',
                            fontWeight: activeFilters[filter.label] ? 500 : 400,
                            appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L2 4h8z'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 0.625rem center',
                            flexShrink: 0,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <option value="">{filter.label}</option>
                        {filter.values.map((value) => (
                            <option key={value} value={value}>
                                {value}
                            </option>
                        ))}
                    </select>
                ))}
            </div>

            {/* Row 2: Refine by + Sort by + Count */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid var(--border-light)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Refine by:</span>
                    <select
                        style={{
                            padding: '0.375rem 1.5rem 0.375rem 0.5rem',
                            border: 'none',
                            fontSize: '0.8125rem',
                            background: 'transparent',
                            color: 'var(--foreground-dark)',
                            cursor: 'pointer',
                            fontWeight: 500,
                            appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L2 4h8z'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 0 center',
                        }}
                    >
                        <option>Budget</option>
                        <option>$0 - $25k</option>
                        <option>$25k - $50k</option>
                        <option>$50k - $100k</option>
                        <option>$100k+</option>
                    </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Sort by:</span>
                        <select
                            style={{
                                padding: '0.375rem 1.5rem 0.375rem 0.5rem',
                                border: 'none',
                                fontSize: '0.8125rem',
                                background: 'transparent',
                                color: 'var(--foreground-dark)',
                                cursor: 'pointer',
                                fontWeight: 500,
                                appearance: 'none',
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L2 4h8z'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 0 center',
                            }}
                        >
                            <option>Popular Today</option>
                            <option>Latest Activity</option>
                            <option>All Time Popular</option>
                        </select>
                    </div>

                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        1 - 20 of {totalCount.toLocaleString()} photos
                    </span>
                </div>
            </div>

            {/* Row 3: Quick Filter Pills */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                paddingTop: '0.75rem',
                overflowX: 'auto',
            }}>
                {QUICK_FILTERS.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => handleQuickFilter(filter)}
                        style={{
                            padding: '0.5rem 1rem',
                            border: activeFilters['Style'] === filter
                                ? '1px solid var(--foreground-dark)'
                                : '1px solid var(--border-color)',
                            borderRadius: '20px',
                            background: activeFilters['Style'] === filter ? '#f5f5f5' : 'white',
                            fontSize: '0.8125rem',
                            color: 'var(--foreground-dark)',
                            cursor: 'pointer',
                            fontWeight: activeFilters['Style'] === filter ? 500 : 400,
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                            if (activeFilters['Style'] !== filter) {
                                e.currentTarget.style.background = '#f9f9f9';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (activeFilters['Style'] !== filter) {
                                e.currentTarget.style.background = 'white';
                            }
                        }}
                    >
                        {filter}
                    </button>
                ))}

                {activeCount > 0 && (
                    <button
                        onClick={clearAllFilters}
                        style={{
                            padding: '0.5rem 1rem',
                            border: 'none',
                            borderRadius: '20px',
                            background: 'transparent',
                            fontSize: '0.8125rem',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                        }}
                    >
                        Clear all
                    </button>
                )}
            </div>
        </div>
    );
}

// Default filter configuration for kitchen photos
export const KITCHEN_FILTERS: FilterOption[] = [
    {
        label: 'Style',
        values: ['Modern', 'Contemporary', 'Transitional', 'Farmhouse', 'Traditional', 'Scandinavian', 'Mid-Century Modern']
    },
    {
        label: 'Color',
        values: ['White', 'Gray', 'Black', 'Blue', 'Green', 'Beige', 'Brown', 'Navy']
    },
    {
        label: 'Size',
        values: ['Small', 'Medium', 'Large', 'Extra Large']
    },
    {
        label: 'Cabinet Finish',
        values: ['Flat Panel', 'Shaker', 'Glass Front', 'Raised Panel', 'Slab', 'Beadboard']
    },
    {
        label: 'Counter Color',
        values: ['White', 'Black', 'Gray', 'Brown', 'Beige', 'Multi']
    },
    {
        label: 'Counter Material',
        values: ['Quartz', 'Granite', 'Marble', 'Butcher Block', 'Concrete', 'Quartzite']
    },
    {
        label: 'Backsplash Color',
        values: ['White', 'Gray', 'Blue', 'Green', 'Multi', 'Black']
    },
    {
        label: 'Floor Material',
        values: ['Hardwood', 'Tile', 'Luxury Vinyl', 'Stone', 'Engineered Wood', 'Porcelain']
    },
    {
        label: 'Layout',
        values: ['L-Shaped', 'U-Shaped', 'Galley', 'Island', 'Peninsula', 'Open Concept']
    },
    {
        label: 'Island',
        values: ['Yes', 'No']
    },
];
