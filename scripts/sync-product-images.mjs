#!/usr/bin/env node
/**
 * Downloads product/category images listed in src/assets/images/image-manifest.json
 * into the bundled asset folders. Run locally when refreshing catalog art — not part
 * of the Angular build.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const manifestPath = path.join(repoRoot, 'src/assets/images/image-manifest.json');
const productsDir = path.join(repoRoot, 'src/assets/images/products');
const categoriesDir = path.join(repoRoot, 'src/assets/images/categories');

async function downloadToFile(url, destination) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(destination, buffer);
}

async function main() {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  await mkdir(productsDir, { recursive: true });
  await mkdir(categoriesDir, { recursive: true });

  let downloaded = 0;
  let skipped = 0;

  for (const entry of manifest.products ?? []) {
    if (!entry.sourceUrl) {
      skipped += 1;
      continue;
    }
    const target = path.join(productsDir, entry.file);
    await downloadToFile(entry.sourceUrl, target);
    downloaded += 1;
    console.log(`products/${entry.file}`);
  }

  for (const entry of manifest.categories ?? []) {
    if (!entry.sourceUrl) {
      skipped += 1;
      continue;
    }
    const target = path.join(categoriesDir, entry.file);
    await downloadToFile(entry.sourceUrl, target);
    downloaded += 1;
    console.log(`categories/${entry.file}`);
  }

  console.log(`Done. Downloaded ${downloaded} file(s); skipped ${skipped} without sourceUrl.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
