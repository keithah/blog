import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { isMeaningfulUpdate, cleanPath } from '../content/normalize';
import type { PageContent, PostContent } from '../content/types';
import { SECTION_SLUGS, type SectionSlug } from '../site/config';
import { blocksToHtml } from './blocksToHtml';
import { fetchBlocks } from './queries';

type PropertyValue = PageObjectResponse['properties'][string];

function getTitle(page: PageObjectResponse, key: string): string {
	const prop = page.properties[key];
	if (!prop || prop.type !== 'title') {
		throw new Error(`Expected "${key}" title property on page ${page.id}.`);
	}

	const title = prop.title.map((item) => item.plain_text).join('').trim();
	if (!title) {
		throw new Error(`Page ${page.id} is missing a Title value.`);
	}

	return title;
}

function getRichText(page: PageObjectResponse, key: string): string | undefined {
	const prop = page.properties[key];
	if (!prop || prop.type !== 'rich_text') return undefined;

	const value = prop.rich_text.map((item) => item.plain_text).join('').trim();
	return value || undefined;
}

function getText(page: PageObjectResponse, key: string): string | undefined {
	const prop = page.properties[key];
	if (!prop) return undefined;

	if (prop.type === 'rich_text') {
		return getRichText(page, key);
	}

	if (prop.type === 'title') {
		return getTitle(page, key);
	}

	if (prop.type === 'number') {
		return typeof prop.number === 'number' ? String(prop.number) : undefined;
	}

	if (prop.type === 'url') {
		return prop.url ?? undefined;
	}

	if (prop.type === 'email') {
		return prop.email ?? undefined;
	}

	if (prop.type === 'phone_number') {
		return prop.phone_number ?? undefined;
	}

	return undefined;
}

function getCheckbox(page: PageObjectResponse, key: string): boolean {
	const prop = page.properties[key];
	if (!prop || prop.type !== 'checkbox') return false;
	return Boolean(prop.checkbox);
}

function getSelect(page: PageObjectResponse, key: string): string | undefined {
	const prop = page.properties[key];
	if (!prop || prop.type !== 'select') return undefined;
	return prop.select?.name?.trim();
}

function getMultiSelect(page: PageObjectResponse, key: string): string[] {
	const prop = page.properties[key];
	if (!prop || prop.type !== 'multi_select') return [];
	return prop.multi_select.map((option) => option.name.trim()).filter(Boolean);
}

function resolveUpdatedBy(
	page: PageObjectResponse,
	publicUpdatedBy?: string,
): string | undefined {
	const editor = (page.last_edited_by as { name?: string } | undefined)?.name;
	if (editor) return editor;
	if (publicUpdatedBy && publicUpdatedBy.trim()) return publicUpdatedBy.trim();
	return undefined;
}

export async function mapPage(
	page: PageObjectResponse,
): Promise<PageContent> {
	const title = getTitle(page, 'Title');
	const slug = getText(page, 'Slug') as string | undefined;

	if (!slug) {
		throw new Error(`Published page "${title}" is missing a Slug.`);
	}

	if (!SECTION_SLUGS.includes(slug as SectionSlug)) {
		throw new Error(
			`Published page "${title}" has an invalid slug "${slug}". Must be one of ${SECTION_SLUGS.join(
				', ',
			)}.`,
		);
	}

	const summary = getRichText(page, 'Summary');
	const createdAt = new Date(page.created_time);
	const lastEdited = new Date(page.last_edited_time);
	const updatedAt = isMeaningfulUpdate(createdAt, lastEdited)
		? lastEdited
		: undefined;
	const updatedBy = resolveUpdatedBy(page);
	const html = blocksToHtml(await fetchBlocks(page.id));

	return {
		id: page.id,
		title,
		slug,
		summary,
		createdAt,
		updatedAt,
		updatedBy,
		html,
	};
}

export async function mapPost(
	page: PageObjectResponse,
): Promise<PostContent> {
	const title = getTitle(page, 'Title');
	const slug = getText(page, 'Slug');

	if (!slug) {
		throw new Error(`Published post "${title}" is missing a Slug.`);
	}

	const section = getSelect(page, 'Section');
	const allowedSections = [...SECTION_SLUGS, 'blog'];
	if (!section || !allowedSections.includes(section as SectionSlug | 'blog')) {
		throw new Error(
			`Published post "${title}" has an invalid or missing Section "${section}".`,
		);
	}

	const tags = getMultiSelect(page, 'Tags');
	const path = cleanPath(getText(page, 'Path'));
	const summary = getRichText(page, 'Summary');
	const pinned = getCheckbox(page, 'Pinned');
	const publicUpdatedBy = getText(page, 'PublicUpdatedBy');

	if (!summary) {
		console.warn(`[Notion] Post "${title}" is missing a Summary.`);
	}

	if (!path) {
		console.warn(`[Notion] Post "${title}" is missing a Path value.`);
	}

	const createdAt = new Date(page.created_time);
	const lastEdited = new Date(page.last_edited_time);
	const updatedAt = isMeaningfulUpdate(createdAt, lastEdited)
		? lastEdited
		: undefined;
	const updatedBy = resolveUpdatedBy(page, publicUpdatedBy);
	const html = blocksToHtml(await fetchBlocks(page.id));

	return {
		id: page.id,
		title,
		slug,
		section: section as SectionSlug | 'blog',
		tags,
		path,
		summary,
		pinned,
		createdAt,
		updatedAt,
		updatedBy,
		html,
	};
}
