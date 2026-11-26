import { getCollection, type CollectionEntry } from 'astro:content';

export type ResearchEntry = CollectionEntry<'research'>;

export const readingMinutes = (body = '') => Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 220));

/** Published articles, newest first. Drafts are included only in dev. */
export async function getArticles() {
  const all = await getCollection('research', (e) => import.meta.env.DEV || !e.data.draft);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const articleUrl = (slug: string) => `${import.meta.env.BASE_URL.replace(/\/?$/, '/')}research/${slug}/`;
