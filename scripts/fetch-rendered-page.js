#!/usr/bin/env node
// Renders a JS-heavy page (e.g. Salesforce Help LWC) and prints its text content to stdout.
// Usage: node fetch-rendered-page.js <url> [--links] [--source]
//   Default: prints page text (document.body.innerText)
//   --links: prints JSON array of {text, href} for all articleView anchor elements
//   --source: prints raw page HTML (page.content()) for article ID extraction

import { chromium } from 'playwright';

const args = process.argv.slice(2);
const url = args.find(a => !a.startsWith('--'));
const linksMode = args.includes('--links');
const sourceMode = args.includes('--source');

if (!url) {
  console.error('Usage: node fetch-rendered-page.js <url> [--links] [--source]');
  process.exit(1);
}

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

  // Wait for Salesforce Help content to render, but don't fail if selector isn't found
  try {
    await page.waitForSelector(
      '.slds-rich-text-editor__output, article, .content, [data-component-id]',
      { timeout: 10000 }
    );
  } catch {
    // Content selector not found — fall through to full body extraction
  }

  if (linksMode) {
    const links = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a[href]'))
        .map(a => ({ text: a.innerText.trim(), href: a.href }))
        .filter(l => l.href.includes('articleView') && l.text.length > 0)
    );
    console.log(JSON.stringify(links, null, 2));
  } else if (sourceMode) {
    const html = await page.content();
    console.log(html);
  } else {
    const text = await page.evaluate(() => document.body.innerText);
    console.log(text);
  }
} catch (err) {
  console.error(`Failed to fetch ${url}: ${err.message}`);
  process.exit(1);
} finally {
  await browser?.close();
}
