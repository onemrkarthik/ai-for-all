/**
 * CDN Utility
 * 
 * Provides functions to wrap resource URLs (images, fonts, etc.) with a CDN prefix.
 */

/**
 * Wraps a given URL with the CDN base URL if configured.
 * 
 * @param url - The original resource URL (absolute or relative)
 * @returns The CDN-wrapped URL or the original URL if no CDN is configured
 */
export function wrapUrl(url: string | undefined): string {
    if (!url) return '';

    const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;
    if (!cdnUrl) return url;

    // Remove trailing slash from cdnUrl if present
    const cleanCdnUrl = cdnUrl.endsWith('/') ? cdnUrl.slice(0, -1) : cdnUrl;

    // If the URL is already absolute (starts with http or //), we might want to 
    // decide if we still wrap it (CDN as proxy) or leave it. 
    // For many CDNs (like CloudFront or Cloudinary as a proxy), you prefix the full URL.
    if (url.startsWith('http') || url.startsWith('//')) {
        return `${cleanCdnUrl}/${url}`;
    }

    // For relative URLs, ensure it starts with a slash
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${cleanCdnUrl}${cleanPath}`;
}
