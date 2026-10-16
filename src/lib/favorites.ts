import { readJson, writeJson } from './storage';

export const FAVORITES_KEY = 'favorites:v1';

export function getFavorites(): number[] {
	const raw = readJson<unknown>(FAVORITES_KEY);
	return Array.isArray(raw) ? raw.filter((n): n is number => typeof n === 'number') : [];
}

function toggleFavorite(id: number) {
	const list = getFavorites();
	writeJson(FAVORITES_KEY, list.includes(id) ? list.filter((n) => n !== id) : [...list, id]);
}

function syncStars(favs: Set<number>) {
	document.querySelectorAll<HTMLElement>('[data-list] > [data-project]').forEach((row) => {
		const btn = row.querySelector<HTMLElement>('[data-fav-toggle]');
		if (!btn) return;
		const on = favs.has(Number(row.dataset.project));
		btn.setAttribute('aria-pressed', String(on));
		btn.setAttribute('aria-label', on ? 'Quitar de favoritos' : 'Añadir a favoritos');
	});
}

/** Reconstruye la sección de favoritos a partir de las filas de cada categoría (ya ordenadas por votos). */
export function renderFavorites() {
	const section = document.querySelector<HTMLElement>('[data-favorites]');
	const list = section?.querySelector<HTMLElement>('[data-fav-list]');
	const count = section?.querySelector<HTMLElement>('[data-fav-count]');
	if (!section || !list || !count) return;

	const favs = new Set(getFavorites());
	syncStars(favs);

	const items: { li: HTMLElement; rank: number; votes: number }[] = [];
	document.querySelectorAll<HTMLElement>('[data-category-section]').forEach((cat) => {
		const rows = Array.from(cat.querySelectorAll<HTMLElement>('[data-list] > [data-project]'));
		rows.forEach((row, i) => {
			if (!favs.has(Number(row.dataset.project))) return;
			const li = row.cloneNode(true) as HTMLElement;
			li.removeAttribute('data-project');
			li.removeAttribute('data-match');
			li.removeAttribute('data-current');
			li.dataset.favProject = row.dataset.project;
			li.classList.add('border-l-4', 'border-brand', 'bg-brand/10');
			// Una coincidencia del buscador deja <mark> en la fila original; la copia va en texto plano.
			li.querySelectorAll<HTMLElement>('[data-s-title], [data-s-entity]').forEach((el) => {
				el.textContent = el.textContent;
			});
			const badge = li.querySelector<HTMLElement>('[data-rank-badge]');
			if (badge) {
				badge.hidden = false;
				badge.textContent = String(i + 1);
				badge.setAttribute('aria-label', `Puesto ${i + 1}`);
			}
			const info = li.querySelector<HTMLElement>('[data-fav-rank]');
			if (info) {
				info.hidden = false;
				info.textContent = `Puesto ${i + 1} de ${rows.length} · ${cat.dataset.categoryName ?? ''}`;
			}
			const votes = Number(row.querySelector('[data-votes]')?.textContent?.replace(/\D/g, '')) || 0;
			items.push({ li, rank: i + 1, votes });
		});
	});

	items.sort((a, b) => a.rank - b.rank || b.votes - a.votes);
	list.replaceChildren(...items.map((it) => it.li));
	count.textContent = String(items.length);
	section.hidden = items.length === 0;
}

/** Engancha las estrellas (delegado) y pinta la sección. */
export function initFavorites() {
	document.addEventListener('click', (e) => {
		const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-fav-toggle]');
		if (!btn) return;
		const li = btn.closest<HTMLElement>('[data-project], [data-fav-project]');
		const id = Number(li?.dataset.project ?? li?.dataset.favProject);
		if (!id) return;
		toggleFavorite(id);
		renderFavorites();
	});
	renderFavorites();
}
