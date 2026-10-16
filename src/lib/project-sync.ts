import { isInvest, renderDataGridItems } from './datagrid';
import { parseDetail, type El } from './parse';
import { readJson, writeJson } from './storage';
import { mergeVotes } from './votes';
import type { ProjectOverride } from './types';

const key = (id: number) => `project:v1:${id}`;

export const loadOverride = (id: number) => readJson<ProjectOverride>(key(id));

/** Vuelve a leer el detalle de la web origen y lo guarda como override (specs/002-data-model.md). */
export async function syncProject(id: number, slug: string): Promise<ProjectOverride> {
	const res = await fetch(`/remote/candidatura/${slug}/`, { headers: { Accept: 'text/html' } });
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
	const d = parseDetail(doc as unknown as El);
	if (!d.title || !d.data?.length) throw new Error('detalle vacío');

	const override: ProjectOverride = {
		title: d.title,
		...(d.entityFull ? { entityFull: d.entityFull } : {}),
		...(d.image ? { image: d.image } : {}),
		...(d.logo ? { logo: d.logo } : {}),
		contentHtml: d.contentHtml ?? '',
		data: d.data,
		syncedAt: new Date().toISOString(),
	};
	writeJson(key(id), override);
	if (d.votes !== undefined) mergeVotes({ [String(id)]: d.votes });
	return override;
}

const text = (sel: string, value: string) => {
	const el = document.querySelector<HTMLElement>(sel);
	if (el) el.textContent = value;
};

export function applyOverride(o: ProjectOverride) {
	if (o.title) {
		text('[data-field="title"]', o.title);
		document.title = `${o.title} · Premios Solidarios`;
	}
	if (o.entityFull) text('[data-field="entity"]', o.entityFull);

	const image = document.querySelector<HTMLImageElement>('img[data-field="image"]');
	if (image && o.image) image.src = o.image;

	const logo = document.querySelector<HTMLElement>('[data-logo]');
	if (logo && o.logo) {
		const img = document.createElement('img');
		img.src = o.logo;
		img.alt = '';
		img.className = 'size-full object-contain p-1';
		logo.replaceChildren(img);
	}

	const content = document.querySelector<HTMLElement>('[data-field="content"]');
	if (content && o.contentHtml !== undefined) content.innerHTML = o.contentHtml;

	if (o.data) {
		const grid = document.querySelector<HTMLElement>('[data-field="data"]');
		if (grid) grid.innerHTML = renderDataGridItems(o.data.filter((d) => !isInvest(d.label)));
		const body = document.querySelector<HTMLElement>('[data-invest-body]');
		const invest = o.data.find((d) => isInvest(d.label));
		if (body && invest) {
			if (invest.html) body.innerHTML = invest.html;
			else body.textContent = invest.value;
		}
	}

	if (o.syncedAt) {
		text(
			'[data-synced]',
			new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(o.syncedAt)),
		);
	}
}
