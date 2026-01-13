/**
 * Navigation Module Public Exports
 *
 * Provides type-safe route building utilities for client-side navigation.
 *
 * @example
 * ```ts
 * import { nav } from '@/lib/navigation';
 * import { useRouter } from 'next/navigation';
 *
 * const router = useRouter();
 *
 * // Navigate to professional page
 * router.push(nav.professionals.detail(5));
 *
 * // Navigate to home with photo modal
 * router.push(nav.home.index({ photo: 123 }));
 * ```
 */

// Primary exports - navigation helpers
export { nav, routes, buildRoute } from './routes';
export type { Nav, Routes, Route } from './routes';
