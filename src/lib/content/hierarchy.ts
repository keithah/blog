import type { PostContent } from './types';

export interface PathNode {
	name: string;
	posts: PostContent[];
	children: Map<string, PathNode>;
}

export interface GroupedPosts {
	rootPosts: PostContent[];
	trees: PathNode[];
}

export function groupPostsByPath(posts: PostContent[]): GroupedPosts {
	const rootMap = new Map<string, PathNode>();
	const rootPosts: PostContent[] = [];

	for (const post of posts) {
		const segments = (post.path ?? '')
			.split('/')
			.map((segment) => segment.trim())
			.filter(Boolean);

		if (segments.length === 0) {
			rootPosts.push(post);
			continue;
		}

		let cursor = rootMap;
		let currentNode: PathNode | null = null;

		for (const segment of segments) {
			const existing = cursor.get(segment);
			if (existing) {
				currentNode = existing;
				cursor = existing.children;
				continue;
			}

			const node: PathNode = { name: segment, posts: [], children: new Map() };
			cursor.set(segment, node);
			currentNode = node;
			cursor = node.children;
		}

		currentNode?.posts.push(post);
	}

	return {
		rootPosts,
		trees: Array.from(rootMap.values()),
	};
}
