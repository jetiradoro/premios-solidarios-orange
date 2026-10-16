/** Buscador de la home: marca coincidencias por título o entidad sin ocultar filas (specs/004-ui.md). */
const MIN_CHARS = 2;
const DEBOUNCE_MS = 200;

type Norm = { text: string; map: number[] };

/** Minúsculas y sin tildes; `map[i]` es el índice del original al que corresponde el carácter i. */
function normalize(s: string): Norm {
	let text = '';
	const map: number[] = [];
	let i = 0;
	for (const ch of s) {
		const n = ch.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
		for (let k = 0; k < n.length; k++) map.push(i);
		text += n;
		i += ch.length;
	}
	return { text, map };
}

/** Rangos [inicio, fin) sobre el texto original donde aparece `q` (ya normalizado). */
function findRanges(src: string, norm: Norm, q: string): [number, number][] {
	const ranges: [number, number][] = [];
	let from = 0;
	for (let at = norm.text.indexOf(q, from); at !== -1; at = norm.text.indexOf(q, from)) {
		const start = norm.map[at];
		const last = norm.map[at + q.length - 1];
		const end = last + (String.fromCodePoint(src.codePointAt(last)!).length);
		const prev = ranges[ranges.length - 1];
		if (prev && start < prev[1]) prev[1] = Math.max(prev[1], end);
		else ranges.push([start, end]);
		from = at + q.length;
	}
	return ranges;
}

function paint(el: HTMLElement, src: string, ranges: [number, number][]) {
	if (!ranges.length) {
		if (el.childElementCount || el.textContent !== src) el.textContent = src;
		return;
	}
	const frag = document.createDocumentFragment();
	let pos = 0;
	for (const [a, b] of ranges) {
		if (a > pos) frag.append(src.slice(pos, a));
		const mark = document.createElement('mark');
		mark.textContent = src.slice(a, b);
		frag.append(mark);
		pos = b;
	}
	if (pos < src.length) frag.append(src.slice(pos));
	el.replaceChildren(frag);
}

type Row = { li: HTMLElement; title: HTMLElement; entity: HTMLElement; tSrc: string; eSrc: string; tN: Norm; eN: Norm };

export function initSearch() {
	const input = document.querySelector<HTMLInputElement>('[data-search-input]');
	const count = document.querySelector<HTMLElement>('[data-search-count]');
	const prev = document.querySelector<HTMLButtonElement>('[data-search-prev]');
	const next = document.querySelector<HTMLButtonElement>('[data-search-next]');
	const nav = document.querySelector<HTMLElement>('[data-search-nav]');
	if (!input || !count || !prev || !next || !nav) return;

	const rows: Row[] = Array.from(document.querySelectorAll<HTMLElement>('[data-project]')).flatMap((li) => {
		const title = li.querySelector<HTMLElement>('[data-s-title]');
		const entity = li.querySelector<HTMLElement>('[data-s-entity]');
		if (!title || !entity) return [];
		const tSrc = title.textContent ?? '';
		const eSrc = entity.textContent ?? '';
		return [{ li, title, entity, tSrc, eSrc, tN: normalize(tSrc), eN: normalize(eSrc) }];
	});

	const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
	let current: HTMLElement | null = null;
	let timer: number | undefined; // definido mientras hay una búsqueda pendiente

	/** Coincidencias en el orden actual del DOM (el sync puede haber reordenado las filas). */
	const matches = () => Array.from(document.querySelectorAll<HTMLElement>('[data-project][data-match]'));

	function goTo(el: HTMLElement | undefined) {
		current?.removeAttribute('data-current');
		current = el ?? null;
		if (!el) return;
		el.setAttribute('data-current', '');
		el.scrollIntoView({ block: 'start', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
	}

	function summary() {
		const list = matches();
		nav!.hidden = !list.length;
		if (!input!.value.trim() || input!.value.trim().length < MIN_CHARS) {
			count!.textContent = '';
			count!.hidden = true;
			return;
		}
		count!.hidden = false;
		const i = current ? list.indexOf(current) : -1;
		count!.textContent = list.length ? `${i + 1} de ${list.length}` : 'Sin resultados';
	}

	function run() {
		timer = undefined;
		const raw = input!.value.trim();
		const q = raw.length >= MIN_CHARS ? normalize(raw).text : '';
		for (const r of rows) {
			const tr = q ? findRanges(r.tSrc, r.tN, q) : [];
			const er = q ? findRanges(r.eSrc, r.eN, q) : [];
			paint(r.title, r.tSrc, tr);
			paint(r.entity, r.eSrc, er);
			r.li.toggleAttribute('data-match', tr.length + er.length > 0);
		}
		current?.removeAttribute('data-current');
		current = null;
		if (q) goTo(matches()[0]);
		summary();
	}

	function step(dir: 1 | -1) {
		const list = matches();
		if (!list.length) return;
		const i = current ? list.indexOf(current) : -1;
		goTo(list[(i + dir + list.length) % list.length]);
		summary();
	}

	input.addEventListener('input', () => {
		clearTimeout(timer);
		timer = window.setTimeout(run, input.value.trim() ? DEBOUNCE_MS : 0);
	});
	input.addEventListener('keydown', (e) => {
		if (e.key !== 'Enter') return;
		e.preventDefault();
		if (timer !== undefined || !current) {
			clearTimeout(timer);
			run();
		} else step(e.shiftKey ? -1 : 1);
		input.blur(); // cierra el teclado para ver el resultado
	});
	prev.addEventListener('click', () => step(-1));
	next.addEventListener('click', () => step(1));
}
