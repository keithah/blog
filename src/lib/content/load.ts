import { fetchPublishedPages, fetchPublishedPosts } from '../notion/queries';
import { mapPage, mapPost } from '../notion/mapper';
import { tagSlug } from './normalize';
import type { PageContent, PostContent, SiteContent, TagInfo } from './types';

let cachedContent: SiteContent | null = null;

function validatePageSlugs(pages: PageContent[]) {
	const seen = new Map<string, string>();

	for (const page of pages) {
		if (seen.has(page.slug)) {
			throw new Error(
				`Duplicate published page slug "${page.slug}" for pages "${seen.get(
					page.slug,
				)}" and "${page.title}".`,
			);
		}
		seen.set(page.slug, page.title);
	}
}

function validatePostSlugs(posts: PostContent[]) {
	const seen = new Map<string, string>();

	for (const post of posts) {
		if (seen.has(post.slug)) {
			throw new Error(
				`Duplicate published post slug "${post.slug}" for posts "${seen.get(
					post.slug,
				)}" and "${post.title}".`,
			);
		}
		seen.set(post.slug, post.title);
	}
}

function collectTags(posts: PostContent[]): TagInfo[] {
	const tagMap = new Map<string, string>();

	for (const post of posts) {
		for (const tag of post.tags) {
			const slug = tagSlug(tag);
			if (!tagMap.has(slug)) {
				tagMap.set(slug, tag);
			}
		}
	}

	return Array.from(tagMap.entries())
		.map(([slug, label]) => ({ slug, label }))
		.sort((a, b) => a.slug.localeCompare(b.slug));
}

export async function loadContent(): Promise<SiteContent> {
	if (cachedContent) return cachedContent;

	const [pageResults, postResults] = await Promise.all([
		fetchPublishedPages(),
		fetchPublishedPosts(),
	]);

	const pages = await Promise.all(pageResults.map((page) => mapPage(page)));
	validatePageSlugs(pages);

	const posts = await Promise.all(postResults.map((post) => mapPost(post)));
	validatePostSlugs(posts);

	const tags = collectTags(posts);

	cachedContent = {
		pages,
		posts,
		tags,
	};

	return cachedContent;
}
