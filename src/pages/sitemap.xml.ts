import type { APIRoute } from 'astro';
import { loadContent } from '../lib/content/load';
import { getEnv, SECTION_SLUGS } from '../lib/site/config';

const withBase = (base: string, path: string) =>
	new URL(path, base).toString();

export const GET: APIRoute = async () => {
	const env = getEnv();
	const { posts, tags } = await loadContent();

	const staticPaths = ['/', '/blog', ...SECTION_SLUGS.map((slug) => `/${slug}`)];
	const postPaths = posts.map((post) => `/p/${post.slug}`);
	const tagPaths = tags.map((tag) => `/t/${tag.slug}`);
	const allPaths = [...staticPaths, ...postPaths, ...tagPaths];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPaths
	.map((path) => `  <url><loc>${withBase(env.SITE_URL, path)}</loc></url>`)
	.join('\n')}
</urlset>`;

	return new Response(xml, {
		status: 200,
		headers: {
			'Content-Type': 'application/xml',
		},
	});
};
