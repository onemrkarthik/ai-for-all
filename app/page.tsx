import { redirect } from 'next/navigation';
import { DEFAULT_TOPIC, getTopicPath } from '@/lib/utils/slug';

/**
 * Root Page - Redirects to Default Topic
 *
 * This page immediately redirects to the default topic gallery.
 * Default: /photos/kitchen-ideas-and-designs-phbr0-bp~t_709
 */
export default function RootPage() {
  redirect(getTopicPath(DEFAULT_TOPIC));
}
