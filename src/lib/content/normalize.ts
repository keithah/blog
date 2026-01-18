import { UPDATE_THRESHOLD_MS } from '../site/config';

export function isMeaningfulUpdate(createdAt: Date, lastEditedAt: Date): boolean {
	return lastEditedAt.getTime() - createdAt.getTime() > UPDATE_THRESHOLD_MS;
}

export function formatDate(date: Date): string {
	return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
}

export function tagSlug(tag: string): string {
	return tag
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '')
		.replace(/-+/g, '-');
}

export function cleanPath(path?: string | null): string | undefined {
	if (!path) return undefined;
	const cleaned = path
		.split('/')
		.map((segment) => segment.trim())
		.filter(Boolean)
		.join('/');
	return cleaned || undefined;
}
