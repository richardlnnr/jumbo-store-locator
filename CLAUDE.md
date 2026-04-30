# CLAUDE.md

The instructions for AI coding agents in this repository live in [`AGENTS.md`](./AGENTS.md). It is the single source of truth — do not duplicate or override it here.

## Required at session start

Before taking any action in this repo (reading code, planning, editing, running commands), use the Read tool to load `AGENTS.md` in full. Do not rely on partial recall, summaries, or earlier sessions. The file is short enough to read in one call.

It covers, among other things:

- Stack, Node version, and `npm` commands (this project uses npm — never pnpm/yarn).
- Test conventions: `*.test.ts` (node) vs `*.nuxt.test.ts` (Nuxt runtime), colocated with source.
- Code style: 4-space indent, single quotes, no semicolons, arrow functions only.
- UI: every primitive must come from `@nuxt/ui` (`<UButton>`, `<UInput>`, etc.).
- Mobile-first responsive rules: no `max-*:` Tailwind variants, no `@media (max-width: …)`.
- i18n: every user-facing string goes through `@nuxtjs/i18n`; keys must exist in both `en.json` and `nl.json`.
- CI workflow expectations and known gotchas (e.g. `mapbox-gl` must not be imported at server top level).

## After context compaction

If the conversation has been compacted and you previously read `AGENTS.md`, re-read it. Compaction may have dropped its content from context.

## Updating project rules

When project-wide rules change, edit `AGENTS.md`. Do not move rules into this file — keeping the source single avoids drift between agent harnesses (Cursor, Copilot, OpenCode, Aider, etc. all consume the same file).
