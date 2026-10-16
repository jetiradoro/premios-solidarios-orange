import type { DataItem } from './types';

const SHORT: Record<string, string> = {
	'¿A quién va dirigido?': 'Dirigido a',
	'Número estimado de beneficiarios directos': 'Beneficiarios',
	'Ámbito geográfico': 'Ámbito',
	'Coste del proyecto': 'Coste',
};

export const shortLabel = (label: string) => SHORT[label] ?? label;
export const isInvest = (label: string) => label.startsWith('¿En qué se invertirá');

/** Ancho completo para valores largos; una celda corta que quedaría sola en su fila también. */
export function wideFlags(items: DataItem[]): boolean[] {
	const wide = items.map((item) => item.value.length > 28);
	let run = 0;
	wide.forEach((w, i) => {
		if (w) run = 0;
		else if (++run % 2 === 1 && (i === wide.length - 1 || wide[i + 1])) wide[i] = true;
	});
	return wide;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** Mismo marcado que DataGrid.astro, para repintar tras un sync. */
export function renderDataGridItems(items: DataItem[]): string {
	const wide = wideFlags(items);
	return items
		.map(
			(item, i) =>
				`<div class="bg-bg px-3.5 py-3${wide[i] ? ' col-span-2' : ''}">` +
				`<dt class="text-[11px] font-semibold tracking-wide text-muted uppercase">${esc(shortLabel(item.label))}</dt>` +
				`<dd class="mt-0.5 text-sm leading-snug font-semibold text-fg [overflow-wrap:anywhere]">${esc(item.value)}</dd>` +
				`</div>`,
		)
		.join('');
}
