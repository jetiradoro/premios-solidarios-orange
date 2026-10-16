export const TOAST_EVENT = 'app:toast';

export function showToast(message: string) {
	window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: message }));
}
