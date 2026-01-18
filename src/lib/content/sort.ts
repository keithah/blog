import type { PostContent } from './types';

export function sortPostsForSection(posts: PostContent[]): PostContent[] {
	return [...posts].sort((a, b) => {
		if (a.pinned !== b.pinned) return Number(b.pinned) - Number(a.pinned);
		return b.createdAt.getTime() - a.createdAt.getTime();
	});
}

export function sortPostsByCreated(posts: PostContent[]): PostContent[] {
	return [...posts].sort(
		(a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
	);
}
