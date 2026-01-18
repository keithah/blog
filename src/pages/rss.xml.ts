import type { APIRoute } from 'astro';
import { loadContent } from '../lib/content/load';
import { getEnv } from '../lib/site/config';
import { sortPostsByCreated } from '../lib/content/sort';

const escapeXml = (input: string) =>
	input
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');

export const GET: APIRoute = async () => {
	const env = getEnv();
	const { posts } = await loadContent();
	const ordered = sortPostsByCreated(posts);

	const items = ordered
		.map((post) => {
			const link = `${env.SITE_URL}/p/${post.slug}`;
			const description =
				post.summary ??
				post.html.replace(/<[^>]+>/g, '').slice(0, 180).trim();
			return `<item>
  <title>${escapeXml(post.title)}</title>
  <link>${escapeXml(link)}</link>
  <guid isPermaLink="true">${escapeXml(link)}</guid>
  <pubDate>${post.createdAt.toUTCString()}</pubDate>
  <description>${escapeXml(description)}</description>
</item>`;
		})
		.join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml('Blog')}</title>
    <link>${escapeXml(env.SITE_URL)}</link>
    <description>${escapeXml('Published posts')}</description>
${items}
  </channel>
</rss>`;

	return new Response(xml, {
		status: 200,
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8',
		},
	});
};
