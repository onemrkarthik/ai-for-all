/**
 * API Client
 *
 * Type-safe fetch wrappers for all API endpoints.
 * Provides a clean, namespace-organized interface for making API calls.
 */

import { routes } from './config';
import { buildUrl } from './builder';
import type { ErrorResponse } from './types';

/**
 * Custom error class for API errors
 *
 * Provides structured error information including HTTP status codes and response bodies.
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body: ErrorResponse | unknown
  ) {
    super(`API Error ${status}: ${statusText}`);
    this.name = 'ApiError';
  }

  /**
   * Check if this is a specific HTTP error code
   */
  is(statusCode: number): boolean {
    return this.status === statusCode;
  }

  /**
   * Check if this is a 4xx client error
   */
  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if this is a 5xx server error
   */
  isServerError(): boolean {
    return this.status >= 500;
  }
}

/**
 * Base fetch wrapper with automatic JSON parsing and error handling
 *
 * @param url - URL to fetch
 * @param options - Fetch options
 * @returns Parsed JSON response
 * @throws {ApiError} On HTTP errors
 */
async function apiFetch<TResponse>(
  url: string,
  options?: RequestInit
): Promise<TResponse> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorBody: ErrorResponse | unknown;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = { error: response.statusText };
    }
    throw new ApiError(response.status, response.statusText, errorBody);
  }

  return response.json();
}

/**
 * Typed API client with methods for all endpoints
 *
 * Organized by domain for easy discoverability.
 *
 * @example
 * ```ts
 * import { api } from '@/lib/api';
 *
 * // Get photos
 * const photos = await api.feed.list({ offset: 0, limit: 20 });
 *
 * // Get photo details
 * const photo = await api.photos.get(123);
 *
 * // Start conversation
 * const conversation = await api.contact.init({
 *   photoId: 123,
 *   professionalId: 5,
 *   message: "I love this design!"
 * });
 * ```
 */
export const api = {
  /**
   * Feed API
   *
   * Photo list and feed operations
   */
  feed: {
    /**
     * Get paginated photo feed
     *
     * @param params - Optional pagination parameters
     * @param params.offset - Starting index (default: 0)
     * @param params.limit - Number of items (default: 20)
     * @returns Array of photo grid items
     *
     * @example
     * ```ts
     * const photos = await api.feed.list({ offset: 0, limit: 20 });
     * ```
     */
    list: async (params?: { offset?: number; limit?: number }) => {
      const url = buildUrl(routes.feed.list, { queryParams: params });
      return apiFetch<typeof routes.feed.list.response>(url);
    },
  },

  /**
   * Photos API
   *
   * Photo details and metadata
   */
  photos: {
    /**
     * Get photo by ID with full details
     *
     * Includes description, professional info, and attributes.
     *
     * @param id - Photo ID
     * @returns Full photo details
     * @throws {ApiError} 404 if photo not found
     *
     * @example
     * ```ts
     * const photo = await api.photos.get(123);
     * console.log(photo.title, photo.professional?.name);
     * ```
     */
    get: async (id: number) => {
      const url = buildUrl(routes.photos.get, { pathParams: { id } });
      return apiFetch<typeof routes.photos.get.response>(url);
    },
  },

  /**
   * Professionals API
   *
   * Designer and contractor profiles
   */
  professionals: {
    /**
     * Get professional by ID
     *
     * Includes ratings, reviews, and project portfolio.
     *
     * @param id - Professional ID
     * @returns Professional details
     * @throws {ApiError} 404 if professional not found
     *
     * @example
     * ```ts
     * const pro = await api.professionals.get(5);
     * console.log(pro.averageRating, pro.reviewCount);
     * ```
     */
    get: async (id: number) => {
      const url = buildUrl(routes.professionals.get, { pathParams: { id } });
      return apiFetch<typeof routes.professionals.get.response>(url);
    },
  },

  /**
   * Contact API
   *
   * Conversation and messaging operations
   */
  contact: {
    /**
     * Get latest conversation for a photo
     *
     * Returns the most recent conversation related to a specific photo.
     *
     * @param photoId - Photo ID
     * @returns Conversation or null if none exists
     *
     * @example
     * ```ts
     * const { conversation } = await api.contact.latest(123);
     * if (conversation) {
     *   console.log('Found existing conversation:', conversation.messages);
     * }
     * ```
     */
    latest: async (photoId: number) => {
      const url = buildUrl(routes.contact.latest, {
        queryParams: { photoId },
      });
      return apiFetch<typeof routes.contact.latest.response>(url);
    },

    /**
     * Get conversation by ID
     *
     * Fetches a specific conversation with full message history.
     *
     * @param id - Conversation ID
     * @returns Conversation or null if not found
     *
     * @example
     * ```ts
     * const { conversation } = await api.contact.conversation(1);
     * ```
     */
    conversation: async (id: number) => {
      const url = buildUrl(routes.contact.conversation, {
        pathParams: { id },
      });
      return apiFetch<typeof routes.contact.conversation.response>(url);
    },

    /**
     * Get latest conversation by professional ID
     *
     * Finds the most recent conversation with a specific professional.
     *
     * @param professionalId - Professional ID
     * @returns Conversation or null if none exists
     *
     * @example
     * ```ts
     * const { conversation } = await api.contact.byProfessional(5);
     * ```
     */
    byProfessional: async (professionalId: number) => {
      const url = buildUrl(routes.contact.byProfessional, {
        queryParams: { professionalId },
      });
      return apiFetch<typeof routes.contact.byProfessional.response>(url);
    },

    /**
     * Initialize a new conversation
     *
     * Starts a new conversation with a professional about a photo.
     * The AI will respond automatically based on the initial message.
     *
     * @param body - Request payload
     * @param body.photoId - Photo being discussed
     * @param body.professionalId - Professional to contact
     * @param body.message - Initial message from user
     * @returns New conversation with AI response
     *
     * @example
     * ```ts
     * const conversation = await api.contact.init({
     *   photoId: 123,
     *   professionalId: 5,
     *   message: "I'm interested in remodeling my kitchen like this!"
     * });
     * console.log('AI said:', conversation.messages[1].content);
     * ```
     */
    init: async (body: typeof routes.contact.init.body) => {
      const url = buildUrl(routes.contact.init);
      return apiFetch<typeof routes.contact.init.response>(url, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },

    /**
     * Send a chat message in existing conversation
     *
     * Continues an ongoing conversation by sending a new message.
     * The AI will respond automatically.
     *
     * @param body - Request payload
     * @param body.conversationId - Existing conversation ID
     * @param body.message - User's message
     * @returns AI response with suggestions
     *
     * @example
     * ```ts
     * const response = await api.contact.chat({
     *   conversationId: 1,
     *   message: "What's the estimated timeline for this project?"
     * });
     * console.log('AI response:', response.message.content);
     * console.log('Suggestions:', response.suggestions);
     * ```
     */
    chat: async (body: typeof routes.contact.chat.body) => {
      const url = buildUrl(routes.contact.chat);
      return apiFetch<typeof routes.contact.chat.response>(url, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },

    /**
     * Mark conversation as viewed
     *
     * Updates the last viewed timestamp to clear "new message" indicators.
     *
     * @param body - Request payload
     * @param body.conversationId - Conversation to mark as viewed
     * @returns Success response
     *
     * @example
     * ```ts
     * await api.contact.markViewed({ conversationId: 1 });
     * ```
     */
    markViewed: async (body: typeof routes.contact.markViewed.body) => {
      const url = buildUrl(routes.contact.markViewed);
      return apiFetch<typeof routes.contact.markViewed.response>(url, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
  },
} as const;

export type Api = typeof api;
