/**
 * API Module Public Exports
 *
 * Main entry point for the API client library.
 *
 * @example
 * ```ts
 * import { api, ApiError } from '@/lib/api';
 *
 * try {
 *   const photo = await api.photos.get(123);
 * } catch (error) {
 *   if (error instanceof ApiError) {
 *     console.error('API error:', error.status, error.body);
 *   }
 * }
 * ```
 */

// Primary exports - API client and error class
export { api, ApiError } from './client';
export type { Api } from './client';

// Route configuration for advanced usage
export { routes } from './config';
export type { Routes, RouteConfig } from './config';

// URL builders for custom use cases
export { buildUrl, createRouteBuilder, RouteBuilder } from './builder';

// All type definitions
export type * from './types';
