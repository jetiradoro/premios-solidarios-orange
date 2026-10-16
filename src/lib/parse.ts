import { ORIGIN, SEL } from './selectors';
import { sanitizeHtml } from './sanitize';
import type { DataItem, Project } from './types';

/** Interfaz mínima de DOM: la cumplen `DOMParser` (navegador) y `linkedom` (Node). */
export interface El {
	querySelector(sel: string): El | null;
	querySelectorAll(sel: string): ArrayLike<El>;
	getAttribute(name: string): string | null;
	textContent: string | null;
	innerHTML: string;
}

export type CardInfo = {
	id: number;
	number: string;
	title: string;
	slug: string;
	url: string;
	entity: string;
	image?: string;
	votes: number;
};

export type DetailInfo = Partial<Omit<Project, 'scrapedAt'>> & { votes?: number; categoryName?: string };

const clean = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim();
const toInt = (s: string | null | undefined) => {
	const m = /\d[\d.]*/.exec(s ?? '');
	return m ? parseInt(m[0].replace(/\./g, ''), 10) : NaN;
};
const abs = (u: string | null | undefined) => (u ? new URL(u, ORIGIN).href : undefined);
const slugOf = (url: string) => url.replace(/\/+$/, '').split('/').pop() ?? '';

export function parseCategory(root: El): CardInfo[] {
	const out: CardInfo[] = [];
	for (const card of Array.from(root.querySelectorAll(SEL.card))) {
		const votesEl = card.querySelector(SEL.cardVotes);
		const link = card.querySelector(SEL.cardTitleLink);
		const id = toInt(votesEl?.getAttribute('data-vote-count'));
		const votes = toInt(votesEl?.textContent);
		const url = abs(link?.getAttribute('href'));
		if (!votesEl || !link || !url || Number.isNaN(id)) continue;
		out.push({
			id,
			number: clean(card.querySelector(SEL.cardNumber)?.textContent).replace(/^\D+/, ''),
			title: clean(link.textContent),
			slug: slugOf(url),
			url,
			entity: clean(card.querySelector(SEL.cardEntity)?.textContent),
			image: abs(card.querySelector(SEL.cardImage)?.getAttribute('src')),
			votes: Number.isNaN(votes) ? 0 : votes,
		});
	}
	return out;
}

export function parseDetail(root: El): DetailInfo {
	const votesEl = root.querySelector(SEL.detailVotes);
	const button = root.querySelector(SEL.detailVoteButton);
	const catLink = root.querySelector(SEL.detailCategory);
	const logo = root.querySelector(SEL.detailLogo);
	const content = root.querySelector(SEL.detailContent);

	const data: DataItem[] = [];
	for (const item of Array.from(root.querySelectorAll(SEL.detailDataItem))) {
		const label = clean(item.querySelector('dt')?.textContent);
		const dd = item.querySelector('dd');
		if (!label || !dd) continue;
		const html = sanitizeHtml(dd.innerHTML, ORIGIN);
		const hasMarkup = /<(?!br>)/i.test(html) || /<br>/i.test(html);
		const value = clean(html.replace(/<br>|<\/p>|<\/li>/gi, ' ').replace(/<[^>]+>/g, ''));
		data.push(hasMarkup ? { label, value, html } : { label, value });
	}

	const id = toInt(votesEl?.getAttribute('data-vote-count') ?? button?.getAttribute('data-candidature'));
	const votes = toInt(votesEl?.textContent);
	const alt = clean(logo?.getAttribute('alt')).replace(/^Logotipo de\s+/i, '');

	const detail: DetailInfo = {
		id: Number.isNaN(id) ? undefined : id,
		title: clean(root.querySelector(SEL.detailTitle)?.textContent) || undefined,
		category: catLink ? slugOf(catLink.getAttribute('href') ?? '') : undefined,
		categoryName: clean(catLink?.textContent) || undefined,
		image: abs(root.querySelector(SEL.detailImage)?.getAttribute('src')),
		logo: abs(logo?.getAttribute('src')),
		entityFull: alt || undefined,
		contentHtml: content ? sanitizeHtml(content.innerHTML, ORIGIN) : undefined,
		data,
		votes: Number.isNaN(votes) ? undefined : votes,
	};
	return detail;
}
