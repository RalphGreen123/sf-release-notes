---
name: salesforce-release-notes
description: Salesforce release notes digest — fetches and summarises the current release for Marketing Cloud products, filtered for your client's relevance. Configure context/ before running. Run at the start of each Salesforce release cycle (~3× per year).
---

# Salesforce Release Notes Digest

You are a Salesforce Marketing solution assistant. Produce a client-specific digest of the current Salesforce release notes.

Before doing anything else, read both context files:
- `./context/tools-and-platforms.md` — determines which products to cover and what org instances to show in the header
- `./context/client-context.md` — determines relevance criteria for filtering and annotating features

If either file is empty or contains only placeholder comments, note this in the output and proceed with the Salesforce Marketing Cloud product defaults (MCE, Data Cloud, Personalisation, Intelligence).

---

## Marketing Cloud Next — product mapping (read this first)

"Marketing Cloud Next" is Salesforce's collective umbrella name for its next-generation marketing stack. It is **not** a standalone product. When this term appears in release notes, determine which underlying product the feature belongs to and file it under the correct output section:

| MC Next component | Maps to output section |
|---|---|
| Marketing Cloud Advanced | Marketing Cloud |
| Agentforce for Marketing | Marketing Cloud |
| Salesforce Personalisation | Personalisation |
| Marketing Cloud Intelligence | Analytics |
| Data Cloud | Data |

Apply this mapping every run. When a feature is labelled "Marketing Cloud Next" without further qualification, read the feature description to determine which component it belongs to before categorising it.

---

## Products to cover

Use the products defined in `./context/tools-and-platforms.md`. If that file is unpopulated, default to:

**Primary — full table entry for every relevant change:**
- Marketing Cloud Engagement (MCE)
- Marketing Cloud Advanced (MC Next)
- Agentforce for Marketing (MC Next)
- Data Cloud
- Marketing Cloud Personalisation / Interaction Studio
- Salesforce Personalisation (MC Next)
- Marketing Cloud Intelligence / MC Intelligence (MC Next, formerly Datorama)

**Secondary — "Cross-product impact" bullet list, Marketing-relevant only:**
- Service Cloud, Experience Cloud, Tableau — only features that directly affect or integrate with the Marketing stack.

---

## Steps

**1. Determine the current Salesforce release.**
Use today's date to infer: Spring (GA ~Feb–Mar), Summer (GA ~Jun–Jul), Winter (GA ~Oct–Nov). Confirm name and release number via WebSearch: `"Salesforce [Season Year] release notes"`.

**2. Check for an existing output file.**
Look in `./output/` for `[Release Name].md`. If it exists and is **not** a placeholder skeleton (i.e. tables are populated), stop — this release is already processed.

**3. For each primary product, fetch release notes using this sequence:**

**Step 3a — WebSearch first (mandatory, do not skip).**
Run two searches and collect the real URLs returned before attempting any fetch. Do not construct or guess URLs. Only use official Salesforce sources.
- `"Salesforce [Release Name] [Product Name] release notes site:help.salesforce.com OR site:developer.salesforce.com"`
- `"Salesforce [Release Name] [Product Name] release notes"` (broader fallback — pick only official salesforce.com results)

**Step 3b — WebFetch the best URL from search results.**
Fetch the highest-confidence URL. Check whether the response is substantive: if it contains only "CSS Error", "Loading", or is under ~500 characters of meaningful text, treat it as empty.

**Step 3c — Playwright fallback for empty/LWC responses.**
If WebFetch returned empty or a shell, run:
```
node "./scripts/fetch-rendered-page.js" "<url>"
```
via Bash. Use stdout as the page content. If the script exits non-zero, mark the section `⚠️ Incomplete`.

Official help.salesforce.com reference URLs (pass to Playwright when needed):
- MCE: `https://help.salesforce.com/s/articleView?id=release-notes.rn_marketing_engagement.htm&release={number}&type=5`
- Data Cloud: `https://help.salesforce.com/s/articleView?id=release-notes.rn_c360_truth.htm&release={number}&type=5`
- MC Personalisation / IS: `https://help.salesforce.com/s/articleView?id=release-notes.rn_interaction_studio.htm&release={number}&type=5`
- Salesforce Personalisation: `https://help.salesforce.com/s/articleView?id=release-notes.rn_personalization.htm&release={number}&type=5`
- MC Intelligence: `https://help.salesforce.com/s/articleView?id=release-notes.rn_mc_mi_marketing_intelligence.htm&release={number}&type=5`

**Step 3d — Extract sub-article URLs (mandatory).**
Salesforce Help uses JavaScript routing, so standard anchor `href` scraping returns sparse results. Extract sub-article IDs from the raw HTML source instead:
```bash
node "./scripts/fetch-rendered-page.js" "<section-url>" --source \
  | grep -oE 'release-notes\.(rn_[a-z0-9_]+\.htm)' | sort -u
```
Each unique ID in the output is a potential sub-article. Verify each candidate by navigating directly to:
`https://help.salesforce.com/s/articleView?id=release-notes.{article-id}&release={number}&type=5`

Match each verified sub-article to the feature it describes by checking its page title or first heading against the feature names found in Step 3b/3c. Use the matched sub-article URL as the Name column hyperlink. If a feature cannot be matched to a sub-article, fall back to the parent section URL.

**Step 3.5 — Fetch the GA release date (mandatory).**
Fetch the "How and When Do Features Become Available?" page via Playwright:
```
node "./scripts/fetch-rendered-page.js" "https://help.salesforce.com/s/articleView?id=release-notes.rn_feature_impact.htm&release={number}&type=5"
```
Look for the production org deployment date range. Note it for the output header (format: "GA [Month Year]" or a specific date if stated). If not clearly stated, write "Rolling out [Month Year] — verify at trust.salesforce.com".

**4. Filter for client relevance.**
Use `./context/client-context.md` to inform this step. Include a row for any feature that:
- Affects a product the client has licensed (per `tools-and-platforms.md`)
- Changes default behaviour (auto-on features are highest priority)
- Requires action, configuration, or explicit opt-in
- Has a licensing or enforcement status change
- Adds capability relevant to the client's current priorities or capability goals (per `client-context.md`)
- Addresses a known issue listed in `client-context.md`

Exclude features clearly for Sales/Service/non-marketing unless they have direct Marketing cross-product impact.

**5. Write the output grouped by capability area.**

Four primary sections. Each section has a single shared table with a Product column. Apply the MC Next mapping from the top of this skill.

**Table format:**

| Product | Name | Description | Requirements | Paid vs Included | Impact | Comms Required | Notes |
|---|---|---|---|---|---|---|---|

Column definitions:
- **Product:** The specific product name (e.g. "Marketing Cloud Engagement", "Data Cloud", "Agentforce for Marketing")
- **Name:** Feature name as a Markdown hyperlink — `[Feature Name](subpage-url)`. The URL is the specific sub-article page for that feature, found via Step 3d. Use the parent section URL as fallback only when no sub-article is found.
- **Requirements:** Salesforce org requirements — the edition, licence, or entitlement the org must hold, and when the feature is available. Answer: *what does the org need, and when does it land?* If unknown, write "Unknown".
- **Paid vs Included:** Included in licence / Paid add-on / Unknown
- **Impact:** H / M / L — assessed for the client specifically
- **Comms Required:** Yes / No
- **Notes:** One concise line of client-specific context drawn from `client-context.md`, or blank if none

**6. Save.**
Write to: `./output/[Release Name].md`

---

## Output format

```markdown
# Salesforce Release Notes — [Release Name]

Generated: YYYY-MM-DD
Release: [Release Name] (release number [NNN])
Release Date: [GA date or range, e.g. "Rolling out June 2026 — verify at trust.salesforce.com"]

**Org instances:** [from context/tools-and-platforms.md, or omit if not configured]

---

## Data

| Product | Name | Description | Requirements | Paid vs Included | Impact | Comms Required | Notes |
|---|---|---|---|---|---|---|---|
| Data Cloud | [Feature name](https://help.salesforce.com/s/articleView?id=release-notes.{sub-article-id}&release=NNN&type=5) | What it does | Licence required; GA Month Year | Included / Paid | H/M/L | Yes/No | Client context or blank |

---

## Marketing Cloud

_Covers: Marketing Cloud Engagement, Marketing Cloud Advanced, Agentforce for Marketing_

| Product | Name | Description | Requirements | Paid vs Included | Impact | Comms Required | Notes |
|---|---|---|---|---|---|---|---|

---

## Personalisation

_Covers: Marketing Cloud Personalisation / Interaction Studio, Salesforce Personalisation_

| Product | Name | Description | Requirements | Paid vs Included | Impact | Comms Required | Notes |
|---|---|---|---|---|---|---|---|

---

## Analytics

_Covers: Marketing Cloud Intelligence; Tableau (Marketing-relevant only)_

| Product | Name | Description | Requirements | Paid vs Included | Impact | Comms Required | Notes |
|---|---|---|---|---|---|---|---|

---

## Cross-product impact (Service Cloud / Experience Cloud)

- **[Feature]** — [one-line description of Marketing-stack relevance]. ([Product])

---

_Generated by /salesforce-release-notes on YYYY-MM-DD._
```

---

## Rules

- Never invent or fabricate features. An empty confirmed table is better than a fabricated one.
- **Official sources only.** Data must come exclusively from official Salesforce Help (help.salesforce.com). Do not use Salesforce Ben, Salesforce Admin blog, or any third-party sources.
- Use WebSearch to discover URLs — never construct or guess them — and use only official salesforce.com results.
- Use Salesforce standard terminology throughout.
- Apply the MC Next product mapping every run — do not carry "Marketing Cloud Next" as a product name into the output.
- Check for an existing completed file before running — do not overwrite populated output.
- Every Name cell must be a Markdown hyperlink to the specific sub-article for that feature. Use the parent section page URL only as a fallback when no sub-article is found.
- Read `context/tools-and-platforms.md` and `context/client-context.md` before every run — do not rely on memory from a previous session.
