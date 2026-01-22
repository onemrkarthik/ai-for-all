/**
 * LCPImagePreload - Preload LCP Image for Faster Rendering
 *
 * This component adds a preload link for the Largest Contentful Paint (LCP) image
 * to improve page load performance. The LCP image is typically the first visible
 * image in the photo gallery on mobile devices.
 *
 * Performance Impact:
 * - Reduces LCP by starting image download earlier in the page load
 * - Uses fetchpriority="high" to prioritize the image over other resources
 * - Works with Next.js Image optimization
 */

interface LCPImagePreloadProps {
  /** URL of the image to preload */
  src: string;
  /** Image type (default: image/jpeg) */
  type?: string;
}

/**
 * LCPImagePreload Component
 *
 * Renders a preload link tag in the document head for the LCP image.
 * This tells the browser to start downloading the image immediately,
 * before the React component tree renders.
 *
 * @param props - Image URL and optional type
 * @returns A link element for preloading
 *
 * @example
 * <LCPImagePreload src="https://example.com/hero.jpg" />
 */
export function LCPImagePreload({ src, type = 'image/jpeg' }: LCPImagePreloadProps) {
  // For external images, we need to preload the original URL
  // Next.js Image optimization will handle the actual serving
  return (
    <link
      rel="preload"
      as="image"
      href={src}
      type={type}
      fetchPriority="high"
    />
  );
}
