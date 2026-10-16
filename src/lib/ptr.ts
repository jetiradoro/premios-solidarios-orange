/** Pull-to-refresh propio (iOS en modo standalone no lo trae). Se activa arrastrando más de 70 px desde arriba. */
const THRESHOLD = 70;

export function initPullToRefresh(onRefresh: () => Promise<unknown>) {
	const indicator = document.createElement('div');
	indicator.setAttribute('aria-hidden', 'true');
	indicator.className =
		'pointer-events-none fixed left-1/2 z-20 grid size-10 -translate-x-1/2 place-items-center rounded-full border border-line bg-bg text-brand opacity-0 shadow-lg';
	indicator.style.top = 'calc(env(safe-area-inset-top, 0px) + var(--stack-h))';
	indicator.innerHTML =
		'<svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M6 13l6 6 6-6"/></svg>';
	document.body.appendChild(indicator);
	const icon = indicator.firstElementChild as SVGElement;
	const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

	let startY = 0;
	let dy = 0;
	let active = false;
	let busy = false;

	const place = (pull: number, animate: boolean) => {
		indicator.style.transition = animate && !reduceMotion.matches ? 'transform .2s, opacity .2s' : 'none';
		indicator.style.opacity = String(Math.min(1, pull / 50));
		indicator.style.transform = `translateY(${pull - 44}px)`;
		icon.style.transform = `rotate(${pull >= THRESHOLD * 0.5 ? 180 : 0}deg)`;
	};
	const hide = () => place(0, true);

	addEventListener(
		'touchstart',
		(e) => {
			active = !busy && scrollY <= 0 && e.touches.length === 1;
			startY = e.touches[0].clientY;
			dy = 0;
		},
		{ passive: true },
	);

	addEventListener(
		'touchmove',
		(e) => {
			if (!active) return;
			dy = e.touches[0].clientY - startY;
			if (dy <= 0 || scrollY > 0) {
				active = dy > 0 && scrollY <= 0;
				hide();
				return;
			}
			if (e.cancelable) e.preventDefault();
			place(Math.min(dy * 0.5, 80), false);
		},
		{ passive: false },
	);

	addEventListener('touchend', async () => {
		if (!active) return;
		active = false;
		if (dy <= THRESHOLD) return hide();
		busy = true;
		place(THRESHOLD * 0.6, true);
		icon.classList.add('animate-spin');
		try {
			await onRefresh();
		} finally {
			busy = false;
			icon.classList.remove('animate-spin');
			hide();
		}
	});
}
