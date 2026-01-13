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
}

export function FilterBar({ filters, onFilterChange, activeFilters }: FilterBarProps) {
    const handleChange = useCallback((label: string, value: string) => {
        const newValue = value === '' ? null : value;
        onFilterChange({
            ...activeFilters,
            [label]: newValue
        });
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
            padding: '1rem 0',
        }}>
            <div className="container">
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    overflowX: 'auto',
                    paddingBottom: '0.25rem',
                }}>
                    {filters.map((filter) => (
                        <div key={filter.label} style={{ flexShrink: 0 }}>
                            <select
                                value={activeFilters[filter.label] || ''}
                                onChange={(e) => handleChange(filter.label, e.target.value)}
                                style={{
                                    padding: '0.5rem 2rem 0.5rem 0.75rem',
                                    border: activeFilters[filter.label]
                                        ? '2px solid var(--primary)'
                                        : '1px solid var(--border-color)',
                                    borderRadius: '4px',
                                    fontSize: '0.875rem',
                                    background: activeFilters[filter.label]
                                        ? 'rgba(var(--primary-rgb), 0.05)'
                                        : 'white',
                                    color: 'var(--foreground-dark)',
                                    cursor: 'pointer',
                                    fontWeight: activeFilters[filter.label] ? 600 : 400,
                                    minWidth: '120px',
                                    appearance: 'none',
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L2 4h8z'/%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 0.5rem center',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                <option value="">{filter.label}</option>
                                {filter.values.map((value) => (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}

                    {activeCount > 0 && (
                        <button
                            onClick={clearAllFilters}
                            style={{
                                padding: '0.5rem 1rem',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '0.875rem',
                                background: 'transparent',
                                color: 'var(--primary)',
                                cursor: 'pointer',
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                transition: 'all 0.15s ease',
                                flexShrink: 0,
                            }}
                        >
                            Clear all ({activeCount})
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// Default filter configuration for kitchen photos
export const KITCHEN_FILTERS: FilterOption[] = [
    {
        label: 'Style',
        values: ['Modern', 'Contemporary', 'Transitional', 'Farmhouse', 'Traditional', 'Scandinavian']
    },
    {
        label: 'Layout',
        values: ['L-Shaped', 'U-Shaped', 'Galley', 'Island', 'Peninsula', 'Open Concept']
    },
    {
        label: 'Cabinet Finish',
        values: ['Flat Panel', 'Shaker', 'Glass Front', 'Raised Panel', 'Slab', 'Beadboard']
    },
    {
        label: 'Countertop Material',
        values: ['Quartz', 'Granite', 'Marble', 'Butcher Block', 'Concrete', 'Quartzite']
    },
    {
        label: 'Backsplash',
        values: ['Ceramic Tile', 'Subway Tile', 'Glass Tile', 'Stone', 'Marble Slab', 'Mosaic']
    },
    {
        label: 'Flooring',
        values: ['Hardwood', 'Tile', 'Luxury Vinyl', 'Stone', 'Engineered Wood', 'Porcelain']
    },
    {
        label: 'Appliances',
        values: ['Stainless Steel', 'Panel Ready', 'Black Stainless', 'White', 'Custom Panel']
    },
    {
        label: 'Island',
        values: ['Yes', 'No']
    },
    {
        label: 'Color Palette',
        values: ['White & Gray', 'Navy & White', 'Black & Wood', 'Beige & Cream', 'Green & Natural', 'Blue & White']
    },
    {
        label: 'Lighting',
        values: ['Pendant & Recessed', 'Chandelier & Under Cabinet', 'Track & Pendant', 'Recessed Only', 'Mixed Fixtures']
    },
];
