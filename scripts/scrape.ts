/** Genera src/data/*.json desde la web origen. Uso: npm run scrape (ver specs/003-scraping.md). */
import { mkdir, writeFile } from 'node:fs/promises';
import { parseHTML } from 'linkedom';
import { CATEGORIES, categoryUrl } from '../src/lib/selectors';
import { parseCategory, parseDetail, type El } from '../src/lib/parse';
import type { Category, Project, VotesSnapshot } from '../src/lib/types';

const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';
const CONCURRENCY = 4;
const DELAY_MS = 150;
const OUT = new URL('../src/data/', import.meta.url);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function load(url: string): Promise<El> {
	const res = await fetch(url, { headers: { 'User-Agent': UA } });
	if (!res.ok) throw new Error(`${res.status} ${url}`);
	return parseHTML(await res.text()).document as unknown as El;
}

async function pool<T, R>(items: T[], worker: (item: T) => Promise<R>): Promise<R[]> {
	const results: R[] = new Array(items.length);
	let next = 0;
	await Promise.all(
		Array.from({ length: CONCURRENCY }, async () => {
			while (next < items.length) {
				const i = next++;
				results[i] = await worker(items[i]);
				await sleep(DELAY_MS);
			}
		}),
	);
	return results;
}

const now = new Date().toISOString();
const categories: Category[] = CATEGORIES.map((c, order) => ({ ...c, url: categoryUrl(c.slug), order }));
const projects: Project[] = [];
const votes: Record<string, number> = {};
const warnings: string[] = [];

for (const cat of categories) {
	const cards = parseCategory(await load(cat.url));
	console.log(`${cat.name}: ${cards.length} proyectos`);
	const details = await pool(cards, async (card) => parseDetail(await load(card.url)));

	cards.forEach((card, i) => {
		const d = details[i];
		const p: Project = {
			id: card.id,
			slug: card.slug,
			number: card.number,
			title: d.title ?? card.title,
			entity: card.entity,
			...(d.entityFull ? { entityFull: d.entityFull } : {}),
			category: cat.slug,
			url: card.url,
			...((d.image ?? card.image) ? { image: d.image ?? card.image } : {}),
			...(d.logo ? { logo: d.logo } : {}),
			contentHtml: d.contentHtml ?? '',
			data: d.data ?? [],
			scrapedAt: now,
		};
		if (d.id !== undefined && d.id !== card.id) warnings.push(`id distinto en ${card.slug}: ${card.id} vs ${d.id}`);
		if (!p.logo) warnings.push(`sin logo: ${p.slug}`);
		if (!p.image) warnings.push(`sin imagen: ${p.slug}`);
		if (!p.data.length) warnings.push(`sin datos: ${p.slug}`);
		if (!p.contentHtml) warnings.push(`sin descripción: ${p.slug}`);
		projects.push(p);
		votes[String(card.id)] = d.votes ?? card.votes;
	});
}

const snapshot: VotesSnapshot = { updatedAt: now, votes };
await mkdir(OUT, { recursive: true });
const write = (name: string, data: unknown) => writeFile(new URL(name, OUT), JSON.stringify(data, null, '\t') + '\n');
await Promise.all([write('categories.json', categories), write('projects.json', projects), write('votes.json', snapshot)]);

console.log(`\nTotal: ${projects.length} proyectos en ${categories.length} categorías`);
if (warnings.length) console.warn(`\n${warnings.length} avisos:\n- ${warnings.join('\n- ')}`);
