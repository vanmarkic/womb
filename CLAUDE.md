# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static website built with Astro for promoting and marketing womb ambient events and artist curation. The design aesthetic is dark with small impressionist, furtive touches of light and sound.

**External Platforms:**
- Instagram: Connected for social media presence
- SoundCloud: Connected for audio content

## Design Principles

- **Visual Identity**: Dark theme with subtle, impressionist lighting effects
- **Audio Integration**: Sound elements should be furtive and ambient, not intrusive
- **Artist Focus**: Curation and presentation of ambient artists is central to the experience

## Tech Stack

- **Framework**: Astro v5.15.6 (minimal template)
- **TypeScript**: Strict mode enabled
- **MCP Servers**: Context7 for up-to-date documentation access

## Common Commands

All commands run from the project root:

| Command | Action |
|---------|--------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview production build locally |
| `npm run astro ...` | Run Astro CLI commands |
| `npm run astro -- --help` | Get Astro CLI help |

## Project Structure

```
/
├── public/          # Static assets (images, fonts, etc.)
├── src/
│   └── pages/       # File-based routing (.astro or .md files)
│       └── index.astro
├── astro.config.mjs # Astro configuration
├── tsconfig.json    # TypeScript configuration
└── package.json
```

## Architecture

**Routing**: Astro uses file-based routing. Files in `src/pages/` become routes based on their filename.

**Components**: Create reusable components in `src/components/` (supports Astro, React, Vue, Svelte, Preact).

**Static Assets**: Place images and static files in `public/` directory.

**Build Output**: Production builds generate to `./dist/` directory.

## Context7 MCP

This project has Context7 MCP server configured, which provides real-time, version-specific documentation. To use it in prompts:

```
Create a component with Astro islands architecture. use context7
```

## Development Notes

- **Content Strategy**: Events and artist information can be managed via markdown files in `src/content/`, external CMS, or API integration
- **Media Integration**: SoundCloud embeds and Instagram feed will need integration planning
- **Performance**: Leverage Astro's partial hydration and static generation for optimal performance with rich media
- **Dark Theme**: Implement with CSS custom properties for maintainability; ensure WCAG contrast compliance
