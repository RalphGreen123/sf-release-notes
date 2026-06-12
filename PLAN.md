# Plan: SF Release Notes — Shareable GitHub Repo

## Context

The existing `/salesforce-release-notes` skill (in `Claude Skills/salesforce-release-notes-SKILL.md` and mirrored at `Code/SF MKTG BSA/.claude/commands/salesforce-release-notes.md`) is tightly coupled to a specific client engagement: hardcoded org instances, client-specific output paths, absolute paths to the Playwright script, and client-framed relevance filtering. The goal is to create a clean GitHub-publishable clone that anyone on the team can pick up, configure for their own client, and run — without touching the original working skill.

---

## What Was Generalised

| Original (client-specific) | This version |
|---|---|
| Hardcoded client name in description | Generic description; configure via `context/` |
| Products list with specific org instance IDs | Read from `context/tools-and-platforms.md` |
| Absolute Playwright script path | `./scripts/fetch-rendered-page.js` (repo-relative) |
| Client-specific output path | `./output/[Release Name].md` |
| "Filter for [client] relevance" | "Filter for client relevance" driven by `context/client-context.md` |
| Client-named Notes column | `Notes` column |
| Hardcoded org instances in output header | Populated from `tools-and-platforms.md` or omitted if blank |

---

## Structure

```
sf-release-notes/
├── .claude/
│   ├── commands/
│   │   └── salesforce-release-notes.md   ← copy of skill.md; activates slash command
│   └── settings.json                     ← pre-grants Bash(node *) permission
├── context/
│   ├── tools-and-platforms.md            ← user configures: products, org instances
│   └── client-context.md                 ← user configures: priorities, issues, goals
├── scripts/
│   └── fetch-rendered-page.js            ← Playwright LWC renderer (verbatim copy)
├── output/
│   └── .gitkeep                          ← gitignored; generated notes land here
├── skill.md                              ← canonical skill definition (root for GitHub visibility)
├── package.json
├── .gitignore
├── README.md
└── PLAN.md                               ← this file
```

---

## Files Not Touched

| File | Why |
|---|---|
| `Claude Skills/salesforce-release-notes-SKILL.md` | Original master copy — untouched |
| `Code/SF MKTG BSA/.claude/commands/salesforce-release-notes.md` | Working client command — untouched |
| `Code/SF MKTG BSA/scripts/fetch-rendered-page.js` | Source — copied, not moved |
| `Chief of Staff/Clients/.../Release Notes/` | All client output — untouched |

---

## Verification

1. Open `Code/sf-release-notes/` in Claude Code
2. Confirm `/salesforce-release-notes` appears as an available slash command
3. Run it — confirm it reads both context files; no client-specific input required
4. Confirm output lands in `./output/` not the original vault path
5. Confirm Playwright script path resolves correctly (no absolute path errors)
