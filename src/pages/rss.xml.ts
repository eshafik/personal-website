import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { profile } from '../data/profile';
import { getArticles, articleUrl } from '../data/research';

export async function GET(context: APIContext) {
  const items = (await getArticles()).filter((a) => !a.data.draft);
  return rss({
    title: `${profile.name} — Research`,
    description: 'Technical writing on agentic AI, real-time communication, voice & telephony and systems engineering.',
    site: context.site!,
    items: items.map((a) => ({ title: a.data.title, description: a.data.abstract, pubDate: a.data.date, link: articleUrl(a.id), categories: a.data.topics })),
  });
}
