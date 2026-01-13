/**
 * Route Builder Utilities
 *
 * Type-safe URL construction with parameter substitution and query string handling.
 */

import type { RouteConfig } from './config';

/**
 * Build URL from route config with optional parameters
 *
 * @param config - Route configuration object
 * @param params - Optional path and query parameters
 * @returns Complete URL string
 *
 * @example
 * ```ts
 * buildUrl(routes.photos.get, { pathParams: { id: 123 } })
 * // Returns: "/api/photos/123"
 *
 * buildUrl(routes.feed.list, { queryParams: { offset: 20, limit: 10 } })
 * // Returns: "/api/feed?offset=20&limit=10"
 * ```
 */
export function buildUrl<
  TPathParams = Record<string, never>,
  TQueryParams = Record<string, never>,
  TBody = never,
  TResponse = unknown
>(
  config: RouteConfig<TPathParams, TQueryParams, TBody, TResponse>,
  params?: {
    pathParams?: TPathParams;
    queryParams?: TQueryParams;
  }
): string {
  let url = config.path;

  // Substitute path parameters (:id → actual value)
  if (params?.pathParams) {
    Object.entries(params.pathParams).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }

  // Add query parameters
  if (params?.queryParams) {
    const queryEntries = Object.entries(params.queryParams).filter(
      ([_, value]) => value !== undefined && value !== null
    );

    if (queryEntries.length > 0) {
      const queryString = new URLSearchParams(
        queryEntries.map(([key, value]) => [key, String(value)])
      ).toString();

      url += `?${queryString}`;
    }
  }

  return url;
}

/**
 * Type-safe route builder class
 *
 * Provides a fluent interface for building URLs from route configurations.
 *
 * @example
 * ```ts
 * const builder = new RouteBuilder(routes.photos.get);
 * const url = builder.url({ pathParams: { id: 123 } });
 * // Returns: "/api/photos/123"
 * ```
 */
export class RouteBuilder<
  TPathParams = Record<string, never>,
  TQueryParams = Record<string, never>,
  TBody = never,
  TResponse = unknown
> {
  constructor(
    private config: RouteConfig<TPathParams, TQueryParams, TBody, TResponse>
  ) {}

  /**
   * Build URL with type-safe parameters
   */
  url(params?: { pathParams?: TPathParams; queryParams?: TQueryParams }): string {
    return buildUrl(this.config, params);
  }

  /**
   * Get HTTP method for this route
   */
  get method(): string {
    return this.config.method;
  }

  /**
   * Get the path template (with :params)
   */
  get path(): string {
    return this.config.path;
  }
}

/**
 * Create a typed route builder instance
 *
 * @param config - Route configuration object
 * @returns RouteBuilder instance
 *
 * @example
 * ```ts
 * const photoRoute = createRouteBuilder(routes.photos.get);
 * photoRoute.url({ pathParams: { id: 123 } });
 * ```
 */
export function createRouteBuilder<
  TPathParams = Record<string, never>,
  TQueryParams = Record<string, never>,
  TBody = never,
  TResponse = unknown
>(
  config: RouteConfig<TPathParams, TQueryParams, TBody, TResponse>
): RouteBuilder<TPathParams, TQueryParams, TBody, TResponse> {
  return new RouteBuilder(config);
}
