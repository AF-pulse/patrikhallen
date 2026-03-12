import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {

  const posts = await getCollection('insights');

  return rss({
    title: 'Patrik Hallén — Perspectives',
    description: 'Perspectives on enterprise architecture, operating models and strategy execution.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/insights/${post.slug}/`,
    })),
  });

}
