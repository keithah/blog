import type { SectionSlug } from '../site/config';

export interface BaseRecord {
	id: string;
	title: string;
	slug: string;
	createdAt: Date;
	updatedAt?: Date;
	updatedBy?: string;
}

export interface PageContent extends BaseRecord {
	summary?: string;
	html: string;
}

export interface PostContent extends BaseRecord {
	section: SectionSlug | 'blog';
	tags: string[];
	path?: string;
	summary?: string;
	pinned: boolean;
	html: string;
}

export interface TagInfo {
	label: string;
	slug: string;
}

export interface SiteContent {
	pages: PageContent[];
	posts: PostContent[];
	tags: TagInfo[];
}
