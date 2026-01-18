import { Client } from '@notionhq/client';
import { getEnv } from '../site/config';

let cachedClient: Client | null = null;

export function notionClient(): Client {
	if (cachedClient) return cachedClient;
	const env = getEnv();
	cachedClient = new Client({ auth: env.NOTION_API_KEY });
	return cachedClient;
}
