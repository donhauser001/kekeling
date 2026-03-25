import * as fs from 'node:fs';
import * as path from 'node:path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SOURCE_PATH = path.join(__dirname, '..', 'data', 'terms.txt');

const PAGE_SLUG = 'terms';
const PAGE_TITLE = '用户协议';
const PAGE_EXCERPT = '科科灵陪诊平台用户端服务协议';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildTermsHtml(rawText: string) {
  const normalized = rawText
    .replace(/\r/g, '')
    .replace(/第\s*\d+\s*页\s*共\s*\d+\s*页/g, '')
    .replace(/\f/g, '\n');

  const lines = normalized
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  const mainHeadingRe = /^[一二三四五六七八九十]+、/;
  const subHeadingRe = /^（[一二三四五六七八九十]+）/;
  const itemRe = /^\d+[.．]/;

  const blocks: string[] = [];
  const introLines: string[] = [];
  let current = '';
  let reachedMainHeading = false;

  const flushCurrent = () => {
    if (!current.trim()) return;
    blocks.push(current.trim());
    current = '';
  };

  for (const line of lines) {
    if (!reachedMainHeading && !mainHeadingRe.test(line)) {
      introLines.push(line);
      continue;
    }

    if (mainHeadingRe.test(line)) {
      reachedMainHeading = true;
    }

    if (mainHeadingRe.test(line) || subHeadingRe.test(line) || itemRe.test(line)) {
      flushCurrent();
    }

    current += line;
  }

  flushCurrent();

  const introParagraphs = introLines.length > 1
    ? [
        introLines[1] || '',
        introLines.slice(2).join(''),
      ].filter(Boolean)
    : [];

  const htmlBlocks: string[] = [
    `<h1>${escapeHtml(PAGE_TITLE)}</h1>`,
    ...introParagraphs.map((paragraph, index) => {
      const content = escapeHtml(paragraph);
      return index === introParagraphs.length - 1
        ? `<p><strong>${content}</strong></p>`
        : `<p>${content}</p>`;
    }),
  ];

  for (const block of blocks) {
    const safeBlock = escapeHtml(block);

    if (mainHeadingRe.test(block)) {
      htmlBlocks.push(`<h2>${safeBlock}</h2>`);
      continue;
    }

    if (subHeadingRe.test(block)) {
      const headingMatch = block.match(/^（[一二三四五六七八九十]+）[^，。,；;:：]{1,24}[:：]?/);
      if (headingMatch && headingMatch[0].length < block.length) {
        const heading = escapeHtml(headingMatch[0]);
        const rest = escapeHtml(block.slice(headingMatch[0].length));
        htmlBlocks.push(`<h3>${heading}</h3>`);
        if (rest) {
          htmlBlocks.push(`<p>${rest}</p>`);
        }
      } else {
        htmlBlocks.push(`<h3>${safeBlock}</h3>`);
      }
      continue;
    }

    htmlBlocks.push(`<p>${safeBlock}</p>`);
  }

  return htmlBlocks.join('\n');
}

async function main() {
  const rawText = fs.readFileSync(SOURCE_PATH, 'utf8');
  const content = buildTermsHtml(rawText);
  const now = new Date();

  const page = await prisma.page.upsert({
    where: { slug: PAGE_SLUG },
    update: {
      title: PAGE_TITLE,
      content,
      excerpt: PAGE_EXCERPT,
      seoTitle: PAGE_TITLE,
      seoDesc: PAGE_EXCERPT,
      seoKeywords: '用户协议,服务协议,科科灵',
      status: 'published',
      publishedAt: now,
    },
    create: {
      title: PAGE_TITLE,
      slug: PAGE_SLUG,
      content,
      excerpt: PAGE_EXCERPT,
      seoTitle: PAGE_TITLE,
      seoDesc: PAGE_EXCERPT,
      seoKeywords: '用户协议,服务协议,科科灵',
      status: 'published',
      publishedAt: now,
    },
  });

  console.log(`[terms] upsert success: ${page.slug}`);
}

main()
  .catch((error) => {
    console.error('[terms] upsert failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
