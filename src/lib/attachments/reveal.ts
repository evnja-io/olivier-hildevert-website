import type { Attachment } from 'svelte/attachments';

/**
 * Révélation au scroll : la classe `reveal` (posée dans le markup pour un SSR
 * cohérent) masque l'élément ; l'attachment ajoute `in` quand il entre dans le
 * viewport (seuil ~90 % de la hauteur, comme le prototype).
 */
let observer: IntersectionObserver | undefined;
const delays = new Map<Element, number>();

function getObserver() {
	observer ??= new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				const el = entry.target as HTMLElement;
				const delay = delays.get(el) ?? 0;
				el.style.transitionDelay = `${delay}ms`;
				el.classList.add('in');
				// une fois révélé, retirer le délai pour ne pas retarder d'autres transitions
				setTimeout(() => (el.style.transitionDelay = ''), 1000 + delay);
				observer?.unobserve(el);
				delays.delete(el);
			}
		},
		{ rootMargin: '0px 0px -10% 0px' }
	);
	return observer;
}

export function reveal(delay = 0): Attachment {
	return (element) => {
		const el = element as HTMLElement;
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
			el.classList.add('in');
			return;
		}
		delays.set(el, delay);
		getObserver().observe(el);
		return () => {
			observer?.unobserve(el);
			delays.delete(el);
		};
	};
}
