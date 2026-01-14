'use client';

import { useState, useMemo } from 'react';
import ProfessionalRow from './ProfessionalRow';
import type { ProfessionalListItem } from '@/lib/services/professionals';

type SortOption = 'name-asc' | 'name-desc' | 'rating' | 'projects';

interface ProfessionalsListProps {
    professionals: ProfessionalListItem[];
}

export default function ProfessionalsList({ professionals }: ProfessionalsListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('rating');

    const filteredAndSorted = useMemo(() => {
        let result = [...professionals];

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (p) =>
                    p.name.toLowerCase().includes(query) ||
                    p.company.toLowerCase().includes(query)
            );
        }

        // Sort
        switch (sortBy) {
            case 'name-asc':
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                result.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'rating':
                result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
                break;
            case 'projects':
                result.sort((a, b) => b.projectCount - a.projectCount);
                break;
        }

        return result;
    }, [professionals, searchQuery, sortBy]);

    return (
        <div>
            {/* Search and Sort Controls */}
            <div
                style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                }}
            >
                {/* Search Input */}
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <input
                        type="text"
                        placeholder="Search professionals..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            fontSize: '0.9375rem',
                            border: '1px solid var(--border-light)',
                            borderRadius: '4px',
                            background: 'white',
                            outline: 'none',
                            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = 'var(--primary)';
                            e.target.style.boxShadow = '0 0 0 3px rgba(61, 143, 17, 0.1)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'var(--border-light)';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </div>

                {/* Sort Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label
                        htmlFor="sort-select"
                        style={{
                            fontSize: '0.875rem',
                            color: 'var(--text-muted)',
                            fontWeight: 500,
                        }}
                    >
                        Sort by:
                    </label>
                    <select
                        id="sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        style={{
                            padding: '0.625rem 2rem 0.625rem 0.75rem',
                            fontSize: '0.875rem',
                            border: '1px solid var(--border-light)',
                            borderRadius: '4px',
                            background: 'white',
                            cursor: 'pointer',
                            outline: 'none',
                            appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 0.75rem center',
                        }}
                    >
                        <option value="rating">Highest Rated</option>
                        <option value="projects">Most Projects</option>
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                    </select>
                </div>
            </div>

            {/* Results Count */}
            <p
                style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-muted)',
                    marginBottom: '1rem',
                }}
            >
                Showing {filteredAndSorted.length} of {professionals.length} professional
                {professionals.length !== 1 ? 's' : ''}
            </p>

            {/* Professionals List */}
            {filteredAndSorted.length > 0 ? (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                    }}
                >
                    {filteredAndSorted.map((professional, index) => (
                        <ProfessionalRow
                            key={professional.id}
                            id={professional.id}
                            name={professional.name}
                            company={professional.company}
                            averageRating={professional.averageRating}
                            reviewCount={professional.reviewCount}
                            projectCount={professional.projectCount}
                            index={index}
                        />
                    ))}
                </div>
            ) : (
                <div
                    style={{
                        textAlign: 'center',
                        padding: '3rem',
                        background: 'var(--background-warm)',
                        borderRadius: '4px',
                    }}
                >
                    <p
                        style={{
                            fontSize: '1rem',
                            color: 'var(--text-muted)',
                            margin: 0,
                        }}
                    >
                        No professionals found matching "{searchQuery}"
                    </p>
                </div>
            )}
        </div>
    );
}
