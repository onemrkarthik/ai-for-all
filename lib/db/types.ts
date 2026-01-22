/**
 * Database Row Type Definitions
 *
 * Typed interfaces for all database table rows and common query results.
 * These types replace `as any` casts in service files for type safety.
 */

/**
 * Raw row from the professionals table
 */
export interface ProfessionalRow {
  id: number;
  name: string;
  company: string;
}

/**
 * Raw row from the photos table
 */
export interface PhotoRow {
  id: number;
  title: string;
  source: string;
  image_url: string;
  description?: string;
}

/**
 * Photo row joined with professional data
 */
export interface PhotoWithProfessionalRow extends PhotoRow {
  prof_id: number;
  prof_name: string;
  prof_company: string;
}

/**
 * Raw row from the photo_attributes table
 */
export interface PhotoAttributeRow {
  id: number;
  photo_id: number;
  label: string;
  value: string;
}

/**
 * Raw row from the reviews table
 */
export interface ReviewRow {
  id: number;
  professional_id: number;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

/**
 * Aggregate rating statistics for a professional
 */
export interface RatingStatsRow {
  avg_rating: number | null;
  review_count: number;
}

/**
 * Count result from aggregate queries
 */
export interface CountRow {
  count: number;
}

/**
 * Raw row from the conversations table
 */
export interface ConversationRow {
  id: number;
  professional_id: number;
  created_at: string;
  last_summary: string | null;
  last_viewed_at: string | null;
}

/**
 * Raw row from the messages table
 */
export interface MessageRow {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

/**
 * Result from new messages check query
 */
export interface NewMessagesCountRow {
  count: number;
}

/**
 * Minimal photo row for professional portfolio query
 */
export interface ProfessionalPhotoRow {
  id: number;
  title: string;
  image_url: string;
}

/**
 * Conversation row with computed new_message_count from subquery
 */
export interface ConversationWithNewMessageCountRow extends ConversationRow {
  new_message_count: number;
}
