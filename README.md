# Salesforce Release Notes Digest

A Claude Code skill that fetches, filters, and summarises the current Salesforce release notes for your client — covering Marketing Cloud Engagement, Data Cloud, Personalisation, Intelligence, and related products. Runs as a slash command. Configure two context files and you're ready to go.

Runs approximately three times per year, aligned to Salesforce's Spring / Summer / Winter release cycle.

---

## Prerequisites

- [Claude Code](https://claude.ai/code) installed
- Node.js ≥ 18
- Playwright Chromium (used to render Salesforce Help pages that require JavaScript)

---

## Setup

**1. Clone the repo**

```bash
git clone https://github.com/YOUR-USERNAME/sf-release-notes.git
cd sf-release-notes
```

**2. Install dependencies**

```bash
npm install
npm run install:browsers
```

**3. Configure your client context**

Edit `context/tools-and-platforms.md` — add the Salesforce products your client has licensed and their org instance IDs.

Edit `context/client-context.md` — add your client's current priorities, known issues, and capability goals. The skill uses this to filter and annotate features for relevance.

---

## Usage

Open the `sf-release-notes/` directory in Claude Code. The `/salesforce-release-notes` slash command will be available automatically.

```
/salesforce-release-notes
```

The skill will:
1. Determine the current Salesforce release from today's date
2. Check `output/` for an existing run — skips if already generated
3. Fetch release notes per product from `help.salesforce.com`, using Playwright for JS-rendered pages
4. Filter and annotate features based on your context files
5. Write the digest to `output/[Release Name].md`

---

## Output

Generated files appear in `output/` and are gitignored — they contain client-specific annotations and should not be committed.

---

## Notes

- All data comes exclusively from `help.salesforce.com`. Third-party sources (Salesforce Ben, Salesforce Admin blog, etc.) are never used.
- The skill never overwrites a completed output file. Delete or rename the file to regenerate.
- "Marketing Cloud Next" is an umbrella term in Salesforce's release notes. The skill maps each MC Next component to the correct output section automatically.
