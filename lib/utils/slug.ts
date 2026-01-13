/**
 * Slug Utilities for Houzz-style URL formatting
 *
 * Handles parsing and generation of URLs in the format:
 * /photos/:topicName-phbr0-bp~t_:topicId
 *
 * Example: /photos/kitchen-ideas-and-designs-phbr0-bp~t_709
 */

export interface TopicInfo {
    name: string;
    id: number;
    slug: string;
}

/**
 * Parse a Houzz-style slug to extract topic information
 *
 * @param slug - The slug string (e.g., "kitchen-ideas-and-designs-phbr0-bp~t_709")
 * @returns TopicInfo object with name, id, and original slug
 */
export function parseTopicSlug(slug: string): TopicInfo | null {
    // Match pattern: anything-phbr0-bp~t_number
    const match = slug.match(/^(.+)-phbr0-bp~t_(\d+)$/);

    if (!match) {
        return null;
    }

    const [, name, idStr] = match;
    const id = parseInt(idStr, 10);

    return {
        name,
        id,
        slug,
    };
}

/**
 * Generate a Houzz-style slug from topic information
 *
 * @param name - Topic name (will be slugified if needed)
 * @param id - Topic ID
 * @returns Formatted slug string
 */
export function generateTopicSlug(name: string, id: number): string {
    // Slugify the name (convert to lowercase, replace spaces with hyphens)
    const slugifiedName = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    return `${slugifiedName}-phbr0-bp~t_${id}`;
}

/**
 * Get display name from topic name (convert slug to readable format)
 *
 * @param name - Slugified topic name (e.g., "kitchen-ideas-and-designs")
 * @returns Human-readable name (e.g., "Kitchen Ideas and Designs")
 */
export function getTopicDisplayName(name: string): string {
    return name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Default topic configuration
 */
export const DEFAULT_TOPIC: TopicInfo = {
    name: 'kitchen-ideas-and-designs',
    id: 709,
    slug: 'kitchen-ideas-and-designs-phbr0-bp~t_709',
};

/**
 * Get the full URL path for a topic
 *
 * @param topicInfo - Topic information
 * @returns Full path (e.g., "/photos/kitchen-ideas-and-designs-phbr0-bp~t_709")
 */
export function getTopicPath(topicInfo: TopicInfo): string {
    return `/photos/${topicInfo.slug}`;
}
