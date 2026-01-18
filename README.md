# Notion-powered Astro Blog

Static-first personal site powered by Astro + Notion (Pages + Posts databases). Publish visibility is controlled by a `Publish` checkbox in Notion.

## Notion setup (required)
- **Pages DB properties:** `Title` (Title), `Slug` (Text: about, projects, music, travel, open-source, favorites), `Publish` (Checkbox), optional `Summary`.
- **Posts DB properties:** `Title` (Title), `Slug` (Text, unique), `Publish` (Checkbox), `Section` (Select: about, projects, music, travel, open-source, favorites, blog), `Tags` (Multi-select), `Path` (Text, optional), optional `Summary`, `Pinned`, `PublicUpdatedBy`.
- Only items with `Publish == true` are rendered. Duplicate slugs fail the build.

## Environment variables
Copy `.env.example` to `.env` and fill:
```
NOTION_API_KEY=
NOTION_PAGES_DATABASE_ID=
NOTION_POSTS_DATABASE_ID=
SITE_URL=           # e.g. https://yoursite.com
```

## Run locally
```
pnpm install
pnpm run dev
```
`pnpm run build` fetches published content from Notion at build time.

## Deployment (GitHub Pages)
- Workflow: `.github/workflows/publish.yml`
- Runs every 5 minutes (and manually via workflow_dispatch) to pull published Notion content, build, and deploy to GitHub Pages.
- Required GitHub secrets: `NOTION_API_KEY`, `NOTION_PAGES_DATABASE_ID`, `NOTION_POSTS_DATABASE_ID`, `SITE_URL` (your public URL or Pages URL).
- Pages permissions: repository → Settings → Pages → Source = “GitHub Actions.”

## Routes
`/`, `/:section`, `/blog`, `/p/:slug`, `/t/:tag`, `/rss.xml`, `/sitemap.xml`, `/health`.
