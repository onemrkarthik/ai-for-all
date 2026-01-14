/**
 * Route Configuration
 *
 * Centralized route definitions with type safety.
 * All API routes are defined here with their HTTP methods and types.
 */

import type {
  PhotoGridItem,
  Photo,
  ProfessionalDetails,
  ConversationResponse,
  ContactInitRequest,
  ContactInitResponse,
  ContactChatRequest,
  ContactChatResponse,
  MarkViewedRequest,
  MarkViewedResponse,
} from './types';

/**
 * Route configuration interface with full type safety
 */
export interface RouteConfig<
  TPathParams = unknown,
  TQueryParams = unknown,
  TBody = unknown,
  TResponse = unknown
> {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  pathParams?: TPathParams;
  queryParams?: TQueryParams;
  body?: TBody;
  response?: TResponse;
}

/**
 * Centralized route configuration
 * Organized by domain for easy navigation
 */
export const routes = {
  /**
   * Feed/Photo List Routes
   */
  feed: {
    /**
     * Get paginated photo list
     * GET /api/feed?offset=0&limit=20
     */
    list: {
      path: '/api/feed',
      method: 'GET',
      queryParams: {} as { offset?: number; limit?: number },
      response: {} as PhotoGridItem[],
    } satisfies RouteConfig,
  },

  /**
   * Photo Routes
   */
  photos: {
    /**
     * Get photo details by ID
     * GET /api/photos/:id
     */
    get: {
      path: '/api/photos/:id',
      method: 'GET',
      pathParams: {} as { id: number },
      response: {} as Photo,
    } satisfies RouteConfig,
  },

  /**
   * Professional Routes
   */
  professionals: {
    /**
     * Get professional details by ID
     * GET /api/professionals/:id
     */
    get: {
      path: '/api/professionals/:id',
      method: 'GET',
      pathParams: {} as { id: number },
      response: {} as ProfessionalDetails,
    } satisfies RouteConfig,
  },

  /**
   * Contact/Conversation Routes
   */
  contact: {
    /**
     * Get latest conversation for a professional
     * GET /api/contact/latest?professionalId=X
     */
    latest: {
      path: '/api/contact/latest',
      method: 'GET',
      queryParams: {} as { professionalId: number },
      response: {} as ConversationResponse,
    } satisfies RouteConfig,

    /**
     * Get conversation by ID
     * GET /api/contact/conversation/:id
     */
    conversation: {
      path: '/api/contact/conversation/:id',
      method: 'GET',
      pathParams: {} as { id: number },
      response: {} as ConversationResponse,
    } satisfies RouteConfig,

    /**
     * Get conversation by professional ID
     * GET /api/contact/by-professional?professionalId=X
     */
    byProfessional: {
      path: '/api/contact/by-professional',
      method: 'GET',
      queryParams: {} as { professionalId: number },
      response: {} as ConversationResponse,
    } satisfies RouteConfig,

    /**
     * Initialize a new conversation
     * POST /api/contact/init
     */
    init: {
      path: '/api/contact/init',
      method: 'POST',
      body: {} as ContactInitRequest,
      response: {} as ContactInitResponse,
    } satisfies RouteConfig,

    /**
     * Send a message in an existing conversation
     * POST /api/contact/chat
     */
    chat: {
      path: '/api/contact/chat',
      method: 'POST',
      body: {} as ContactChatRequest,
      response: {} as ContactChatResponse,
    } satisfies RouteConfig,

    /**
     * Mark a conversation as viewed
     * POST /api/contact/mark-viewed
     */
    markViewed: {
      path: '/api/contact/mark-viewed',
      method: 'POST',
      body: {} as MarkViewedRequest,
      response: {} as MarkViewedResponse,
    } satisfies RouteConfig,
  },
} as const;

export type Routes = typeof routes;
