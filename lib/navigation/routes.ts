/**
 * Navigation Routes Configuration
 *
 * Centralized route definitions with type-safe path and query parameter builders.
 * All client-side navigation routes are defined here.
 */

/**
 * Route definition interface
 */
export interface Route<TPathParams = unknown, TQueryParams = unknown> {
  path: string;
  pathParams?: TPathParams;
  queryParams?: TQueryParams;
}

/**
 * Build URL from route with path and query parameters
 *
 * @param path - Route path template (e.g., "/professionals/:id")
 * @param params - Optional path and query parameters
 * @returns Complete URL string
 *
 * @example
 * ```ts
 * buildRoute("/professionals/:id", { pathParams: { id: 5 } })
 * // Returns: "/professionals/5"
 *
 * buildRoute("/", { queryParams: { photo: 123 } })
 * // Returns: "/?photo=123"
 * ```
 */
export function buildRoute<TPathParams = unknown, TQueryParams = unknown>(
  path: string,
  params?: {
    pathParams?: TPathParams;
    queryParams?: TQueryParams;
  }
): string {
  let url = path;

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
 * Centralized route definitions
 * Organized by feature area
 */
export const routes = {
  /**
   * Home/Gallery Routes
   */
  home: {
    /**
     * Main gallery page
     * GET /
     */
    index: {
      path: '/',
      queryParams: {} as { photo?: number },
    } satisfies Route,
  },

  /**
   * Professional Routes
   */
  professionals: {
    /**
     * Professionals list page
     * GET /professionals
     */
    list: {
      path: '/professionals',
    } satisfies Route,

    /**
     * Professional detail page
     * GET /professionals/:id
     */
    detail: {
      path: '/professionals/:id',
      pathParams: {} as { id: number },
    } satisfies Route,
  },

  /**
   * Photo Routes
   */
  photos: {
    /**
     * Kitchen ideas landing page
     * GET /photos/kitchen-ideas-and-designs-phbr0-bp~t_709
     */
    ideas: {
      path: '/photos/kitchen-ideas-and-designs-phbr0-bp~t_709',
    } satisfies Route,
  },

  /**
   * Style Routes
   */
  styles: {
    /**
     * Styles list page
     * GET /styles
     */
    list: {
      path: '/styles',
    } satisfies Route,

    /**
     * Style landing page
     * GET /styles/:style
     */
    detail: {
      path: '/styles/:style',
      pathParams: {} as { style: string },
    } satisfies Route,
  },
} as const;

export type Routes = typeof routes;

/**
 * Type-safe route builder helpers
 *
 * Provides convenient methods for building routes with proper typing.
 *
 * @example
 * ```ts
 * import { nav } from '@/lib/navigation';
 *
 * // Navigate to professional page
 * router.push(nav.professionals.detail(5));
 * // Returns: "/professionals/5"
 *
 * // Navigate to home with photo modal open
 * router.push(nav.home.index({ photo: 123 }));
 * // Returns: "/?photo=123"
 * ```
 */
export const nav = {
  /**
   * Home/Gallery navigation
   */
  home: {
    /**
     * Navigate to home page
     *
     * @param queryParams - Optional query parameters
     * @param queryParams.photo - Photo ID to open in modal
     * @returns URL string
     *
     * @example
     * ```ts
     * nav.home.index()           // "/"
     * nav.home.index({ photo: 123 })  // "/?photo=123"
     * ```
     */
    index: (queryParams?: { photo?: number }): string => {
      return buildRoute(routes.home.index.path, { queryParams });
    },
  },

  /**
   * Professional navigation
   */
  professionals: {
    /**
     * Navigate to professionals list page
     *
     * @returns URL string
     *
     * @example
     * ```ts
     * nav.professionals.list()  // "/professionals"
     * ```
     */
    list: (): string => {
      return routes.professionals.list.path;
    },

    /**
     * Navigate to professional detail page
     *
     * @param id - Professional ID
     * @returns URL string
     *
     * @example
     * ```ts
     * nav.professionals.detail(5)  // "/professionals/5"
     * ```
     */
    detail: (id: number): string => {
      return buildRoute(routes.professionals.detail.path, {
        pathParams: { id },
      });
    },
  },

  /**
   * Photo navigation
   */
  photos: {
    /**
     * Navigate to kitchen ideas page
     *
     * @returns URL string
     *
     * @example
     * ```ts
     * nav.photos.ideas()  // "/photos/kitchen-ideas-and-designs-phbr0-bp~t_709"
     * ```
     */
    ideas: (): string => {
      return routes.photos.ideas.path;
    },
  },

  /**
   * Style navigation
   */
  styles: {
    /**
     * Navigate to styles list page
     *
     * @returns URL string
     *
     * @example
     * ```ts
     * nav.styles.list()  // "/styles"
     * ```
     */
    list: (): string => {
      return routes.styles.list.path;
    },

    /**
     * Navigate to style detail page
     *
     * @param style - Style name (e.g., "modern", "farmhouse")
     * @returns URL string
     *
     * @example
     * ```ts
     * nav.styles.detail("modern")  // "/styles/modern"
     * ```
     */
    detail: (style: string): string => {
      return buildRoute(routes.styles.detail.path, {
        pathParams: { style },
      });
    },
  },
} as const;

export type Nav = typeof nav;
