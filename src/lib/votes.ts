import baseSnapshot from '../data/votes.json';
import { parseCategory, type El } from './parse';
import { CATEGORIES } from './selectors';
import { readJson, writeJson } from './storage';
import type { VotesSnapshot } from './types';

export const VOTES_KEY = 'votes:v1';
const ALL_SLUGS: string[] = CATEGORIES.map((c) => c.slug);
const fmt = new Intl.NumberFormat('es-ES');

/** Prioridad: caché de localStorage > snapshot del build (specs/002-data-model.md). */
export function currentVotes(): VotesSnapshot {
	const cached = readJson<VotesSnapshot>(VOTES_KEY);
	return cached && typeof cached.votes === 'object' && cached.votes ? cached : (baseSnapshot as VotesSnapshot);
}

async function fetchCategoryVotes(slug: string): Promise<Record<string, number>> {
	const res = await fetch(`/remote/candidaturas/${slug}/`, { headers: { Accept: 'text/html' } });
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
	const cards = parseCategory(doc as unknown as El);
	if (!cards.length) throw new Error('sin proyectos');
	return Object.fromEntries(cards.map((c) => [String(c.id), c.votes]));
}

/** Descarga los votos de las categorías indicadas y los guarda. Lanza si todas fallan. */
export async function refreshVotes(slugs: string[] = ALL_SLUGS): Promise<{ snapshot: VotesSnapshot; failed: number }> {
	const results = await Promise.allSettled(slugs.map(fetchCategoryVotes));
	const fresh = results.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []));
	if (!fresh.length) throw new Error('sin conexión');
	const snapshot: VotesSnapshot = {
		updatedAt: new Date().toISOString(),
		votes: Object.assign({}, currentVotes().votes, ...fresh),
	};
	writeJson(VOTES_KEY, snapshot);
	return { snapshot, failed: results.length - fresh.length };
}

/** Guarda votos sueltos (p. ej. los leídos al sincronizar un detalle). */
export function mergeVotes(update: Record<string, number>): VotesSnapshot {
	const snapshot: VotesSnapshot = {
		updatedAt: new Date().toISOString(),
		votes: { ...currentVotes().votes, ...update },
	};
	writeJson(VOTES_KEY, snapshot);
	return snapshot;
}

function flash(el: HTMLElement) {
	el.classList.remove('vote-changed');
	void el.offsetWidth;
	el.classList.add('vote-changed');
}

/** Pinta cifras, reordena cada lista por votos y actualiza insignias y puesto. */
export function applyVotes(snapshot: VotesSnapshot, opts: { animate?: boolean } = {}) {
	const { votes } = snapshot;

	document.querySelectorAll<HTMLElement>('[data-votes]').forEach((el) => {
		const n = votes[el.dataset.votes ?? ''];
		if (n === undefined) return;
		const text = fmt.format(n);
		if (el.textContent?.trim() === text) return;
		el.textContent = text;
		if (opts.animate) flash(el);
	});

	document.querySelectorAll<HTMLElement>('[data-list]').forEach((list) => {
		const rows = Array.from(list.children) as HTMLElement[];
		const sorted = rows
			.map((row, i) => ({ row, i, v: votes[row.dataset.project ?? ''] ?? 0 }))
			.sort((a, b) => b.v - a.v || a.i - b.i);
		if (sorted.some(({ row }, i) => row !== rows[i])) sorted.forEach(({ row }) => list.appendChild(row));
		sorted.forEach(({ row }, i) => {
			const badge = row.querySelector<HTMLElement>('[data-rank-badge]');
			if (!badge) return;
			badge.textContent = String(i + 1);
			badge.hidden = i + 1 > 3;
			badge.setAttribute('aria-label', `Puesto ${i + 1}`);
		});
	});

	updateRank(snapshot);
}

/** Puesto del proyecto del detalle entre los de su categoría (data-peers = ids). */
export function updateRank(snapshot: VotesSnapshot) {
	const page = document.querySelector<HTMLElement>('[data-project-page]');
	const out = document.querySelector<HTMLElement>('[data-rank-text]');
	if (!page || !out) return;
	try {
		const peers: number[] = JSON.parse(page.dataset.peers ?? '[]');
		const mine = snapshot.votes[page.dataset.id ?? ''] ?? 0;
		out.textContent = String(1 + peers.filter((id) => (snapshot.votes[String(id)] ?? 0) > mine).length);
	} catch {
		/* se mantiene el puesto del build */
	}
}

const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
function relative(iso: string): string {
	const secs = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
	const abs = Math.abs(secs);
	if (abs < 45) return 'ahora mismo';
	if (abs < 3600) return rtf.format(Math.round(secs / 60), 'minute');
	if (abs < 86400) return rtf.format(Math.round(secs / 3600), 'hour');
	return rtf.format(Math.round(secs / 86400), 'day');
}

/** Muestra "hace X min" en los elementos [data-updated] y lo mantiene al día. */
let timer: number | undefined;
export function setUpdated(iso: string) {
	const paint = () =>
		document.querySelectorAll<HTMLElement>('[data-updated]').forEach((el) => {
			el.dataset.updatedAt = iso;
			el.textContent = relative(iso);
		});
	paint();
	clearInterval(timer);
	timer = window.setInterval(paint, 30_000);
}

/** Estado de carga de los botones sync. */
export function setLoading(on: boolean) {
	document.querySelectorAll<HTMLButtonElement>('[data-sync]').forEach((b) => {
		b.toggleAttribute('data-loading', on);
		b.disabled = on;
	});
}
