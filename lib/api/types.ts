/**
 * API Type Definitions
 *
 * Centralized types for all API requests and responses.
 * Re-exports existing types from services and adds new types for API payloads.
 */

// Re-export existing types from services
import type { Photo as ServicePhoto, PhotoGridItem as ServicePhotoGridItem } from '@/lib/services/photos';
import type { ChatMessage as ServiceChatMessage, Conversation as ServiceConversation } from '@/lib/services/chat';

export type Photo = ServicePhoto;
export type PhotoGridItem = ServicePhotoGridItem;
export type ChatMessage = ServiceChatMessage;
export type Conversation = ServiceConversation;

/**
 * Professional details with extended information
 */
export interface ProfessionalDetails {
  id: number;
  name: string;
  company: string;
  averageRating?: number;
  reviewCount?: number;
  totalProjects?: number;
  reviews?: Array<{
    id: number;
    reviewerName: string;
    rating: number;
    comment: string;
    createdAt: string;
  }>;
  photos?: PhotoGridItem[];
}

/**
 * Request body for initializing a conversation
 */
export interface ContactInitRequest {
  professionalId: number;
  message: string;
}

/**
 * Response from initializing a conversation
 */
export interface ContactInitResponse {
  id: number;
  professional_id: number;
  last_summary?: string;
  last_viewed_at?: string;
  has_new_messages?: boolean;
  messages: ChatMessage[];
  suggestions?: string[];
  projectSummary?: string | null;
  isSufficient?: boolean;
}

/**
 * Request body for sending a chat message
 */
export interface ContactChatRequest {
  conversationId: number;
  message: string;
}

/**
 * Response from sending a chat message
 */
export interface ContactChatResponse {
  message: ChatMessage;
  suggestions?: string[];
  projectSummary?: string | null;
  isSufficient: boolean;
}

/**
 * Request body for marking a conversation as viewed
 */
export interface MarkViewedRequest {
  conversationId: number;
}

/**
 * Response from marking a conversation as viewed
 */
export interface MarkViewedResponse {
  success: boolean;
}

/**
 * Response wrapper for conversation queries
 */
export interface ConversationResponse {
  conversation: Conversation | null;
}

/**
 * Standard error response format
 */
export interface ErrorResponse {
  error: string;
}
