import {
	type BlockObjectResponse,
	type PageObjectResponse,
	type PartialBlockObjectResponse,
	type PartialPageObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { notionClient } from './client';
import { getEnv } from '../site/config';

const blockCache = new Map<string, BlockObjectResponse[]>();

function isFullPage(
	page: PageObjectResponse | PartialPageObjectResponse,
): page is PageObjectResponse {
	return page.object === 'page' && 'properties' in page;
}

function isFullBlock(
	block: BlockObjectResponse | PartialBlockObjectResponse,
): block is BlockObjectResponse {
	return block.object === 'block' && 'type' in block;
}

async function queryPublished(databaseId: string): Promise<PageObjectResponse[]> {
	const client = notionClient();
	const records: PageObjectResponse[] = [];
	let cursor: string | undefined;

	do {
		const response = await client.databases.query({
			database_id: databaseId,
			filter: {
				property: 'Publish',
				checkbox: { equals: true },
			},
			start_cursor: cursor,
			page_size: 100,
		});

		records.push(...response.results.filter(isFullPage));
		cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
	} while (cursor);

	if (records.length === 0) {
		console.warn(
			`[Notion] No published items found in database ${databaseId}. Check the Publish flag?`,
		);
	}

	return records;
}

export async function fetchPublishedPages(): Promise<PageObjectResponse[]> {
	const env = getEnv();
	return queryPublished(env.NOTION_PAGES_DATABASE_ID);
}

export async function fetchPublishedPosts(): Promise<PageObjectResponse[]> {
	const env = getEnv();
	return queryPublished(env.NOTION_POSTS_DATABASE_ID);
}

export async function fetchBlocks(
	pageId: string,
): Promise<BlockObjectResponse[]> {
	if (blockCache.has(pageId)) {
		return blockCache.get(pageId)!;
	}

	const client = notionClient();
	const blocks: BlockObjectResponse[] = [];
	let cursor: string | undefined;

	do {
		const response = await client.blocks.children.list({
			block_id: pageId,
			start_cursor: cursor,
			page_size: 100,
		});

		blocks.push(...response.results.filter(isFullBlock));
		cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
	} while (cursor);

	blockCache.set(pageId, blocks);
	return blocks;
}

export function clearBlockCache() {
	blockCache.clear();
}
