import { z } from 'zod';

export const SECTION_SLUGS = [
	'about',
	'projects',
	'music',
	'travel',
	'open-source',
	'favorites',
] as const;

export type SectionSlug = (typeof SECTION_SLUGS)[number];

export const SECTION_LABELS: Record<SectionSlug, string> = {
	about: 'About',
	projects: 'Projects',
	music: 'Music',
	travel: 'Travel',
	'open-source': 'Open Source',
	favorites: 'Favorites',
};

export const UPDATE_THRESHOLD_MS = 5 * 60 * 1000;

const envSchema = z.object({
	NOTION_API_KEY: z.string().min(1, 'NOTION_API_KEY is required'),
	NOTION_PAGES_DATABASE_ID: z
		.string()
		.min(1, 'NOTION_PAGES_DATABASE_ID is required'),
	NOTION_POSTS_DATABASE_ID: z
		.string()
		.min(1, 'NOTION_POSTS_DATABASE_ID is required'),
	SITE_URL: z.string().url('SITE_URL must be a valid URL'),
});

export type EnvConfig = z.infer<typeof envSchema>;

let cachedEnv: EnvConfig | null = null;

export function getEnv(): EnvConfig {
	if (cachedEnv) return cachedEnv;
	cachedEnv = envSchema.parse(import.meta.env);
	return cachedEnv;
}
