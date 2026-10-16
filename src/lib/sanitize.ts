/** Saneado por lista blanca, sin DOM: funciona igual en Node y en el navegador. */
const ALLOWED = new Set(['p', 'br', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'a']);
const TAG = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;

function safeHref(attrs: string, base: string): string | null {
	const m = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/i.exec(attrs);
	const raw = (m?.[1] ?? m?.[2] ?? m?.[3] ?? '').trim().replace(/&amp;/g, '&');
	try {
		const url = new URL(raw, base);
		return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
	} catch {
		return null;
	}
}

export function sanitizeHtml(html: string, base: string): string {
	const cleaned = html
		.replace(/<!--[\s\S]*?-->/g, '')
		.replace(/<(script|style|iframe|object|embed)\b[\s\S]*?<\/\1\s*>/gi, '');
	return cleaned
		.replace(TAG, (_all, close: string, name: string, attrs: string) => {
			const tag = name.toLowerCase();
			if (!ALLOWED.has(tag)) return '';
			if (close) return `</${tag}>`;
			if (tag === 'br') return '<br>';
			if (tag === 'a') {
				const href = safeHref(attrs, base);
				return href ? `<a href="${href.replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer">` : '<a>';
			}
			return `<${tag}>`;
		})
		.replace(/\s+\n/g, '\n')
		.trim();
}
