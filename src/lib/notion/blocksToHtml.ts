import type {
	BlockObjectResponse,
	RichTextItemResponse,
} from '@notionhq/client/build/src/api-endpoints';

function escapeHtml(input: string): string {
	return input
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

function renderAnnotations(
	content: string,
	item: RichTextItemResponse,
): string {
	const { annotations } = item;
	let output = content;

	if (annotations.code) output = `<code>${output}</code>`;
	if (annotations.bold) output = `<strong>${output}</strong>`;
	if (annotations.italic) output = `<em>${output}</em>`;
	if (annotations.strikethrough) output = `<s>${output}</s>`;
	if (annotations.underline) output = `<u>${output}</u>`;

	return output;
}

function renderRichText(items: RichTextItemResponse[]): string {
	return items
		.map((item) => {
			const text = escapeHtml(item.plain_text ?? '');
			let content = renderAnnotations(text, item);

			if (item.href) {
				content = `<a href="${escapeHtml(item.href)}">${content}</a>`;
			}

			return content;
		})
		.join('');
}

function renderImage(block: BlockObjectResponse & { type: 'image' }): string {
	const source =
		block.image.type === 'external'
			? block.image.external.url
			: block.image.file.url;
	const alt = block.image.caption ? renderRichText(block.image.caption) : '';
	return `<figure><img src="${escapeHtml(
		source,
	)}" alt="${escapeHtml(alt)}" />${
		alt ? `<figcaption>${alt}</figcaption>` : ''
	}</figure>`;
}

function renderBlock(block: BlockObjectResponse): string {
	switch (block.type) {
		case 'paragraph':
			return `<p>${renderRichText(block.paragraph.rich_text)}</p>`;
		case 'heading_1':
			return `<h1>${renderRichText(block.heading_1.rich_text)}</h1>`;
		case 'heading_2':
			return `<h2>${renderRichText(block.heading_2.rich_text)}</h2>`;
		case 'heading_3':
			return `<h3>${renderRichText(block.heading_3.rich_text)}</h3>`;
		case 'code': {
			const code = renderRichText(block.code.rich_text);
			const language = block.code.language || 'plain';
			return `<pre><code class="language-${escapeHtml(
				language,
			)}">${code}</code></pre>`;
		}
		case 'quote':
			return `<blockquote>${renderRichText(block.quote.rich_text)}</blockquote>`;
		case 'divider':
			return '<hr />';
		case 'image':
			return renderImage(block);
		case 'bulleted_list_item':
		case 'numbered_list_item':
			return `<li>${renderRichText(block[block.type].rich_text)}</li>`;
		default:
			return `<p>[Unsupported block: ${block.type}]</p>`;
	}
}

export function blocksToHtml(blocks: BlockObjectResponse[]): string {
	const output: string[] = [];
	let listBuffer:
		| {
				type: 'bulleted_list_item' | 'numbered_list_item';
				items: string[];
		  }
		| null = null;

	const flushList = () => {
		if (!listBuffer) return;
		const tag = listBuffer.type === 'bulleted_list_item' ? 'ul' : 'ol';
		output.push(
			`<${tag}>${listBuffer.items
				.map((item) => `<li>${item}</li>`)
				.join('')}</${tag}>`,
		);
		listBuffer = null;
	};

	for (const block of blocks) {
		if (
			block.type === 'bulleted_list_item' ||
			block.type === 'numbered_list_item'
		) {
			const content = renderBlock(block);
			if (listBuffer && listBuffer.type === block.type) {
				listBuffer.items.push(content.replace(/^<li>|<\/li>$/g, ''));
			} else {
				flushList();
				listBuffer = {
					type: block.type,
					items: [content.replace(/^<li>|<\/li>$/g, '')],
				};
			}
			continue;
		}

		flushList();
		output.push(renderBlock(block));
	}

	flushList();
	return output.join('\n');
}
