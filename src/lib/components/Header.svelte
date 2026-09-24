<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { site, nav } from '$lib/config';
	import { openBooking } from '$lib/booking/booking.svelte';
	import type { ReglagesSite } from '$lib/content/types';
	import { defaultReglages } from '$lib/content/defaults';
	import SunMark from '$lib/components/SunMark.svelte';

	let { reglages = defaultReglages }: { reglages?: ReglagesSite } = $props();

	let scrollY = $state(0);
	const scrolled = $derived(scrollY > 40);
	const home = resolve('/');
	// En haut de l'accueil, l'en-tête transparent flotte sur le voile sombre du
	// hero : textes en clair. Partout ailleurs (ou après défilement), fond crème.
	const surHero = $derived(!scrolled && page.url.pathname === home);

	// Ouverture du panneau mobile. Sans JavaScript, ce lien n'existe pas et
	// <details> continue de s'ouvrir et se fermer nativement par son <summary>.
	let menuOuvert = $state(false);
</script>

<svelte:window bind:scrollY />

<header
	class="fixed inset-x-0 top-0 z-120 transition-[background,box-shadow,padding] duration-500 {scrolled
		? 'bg-[color-mix(in_oklab,var(--color-sky)_86%,transparent)] py-[15px] shadow-[0_1px_0_var(--color-line)] backdrop-blur-[14px] backdrop-saturate-110'
		: 'py-[26px]'}"
>
	<div class="relative wrap flex items-center justify-between gap-4">
		<a
			class="flex min-w-0 items-center gap-3.5 {surHero ? 'text-on-dusk' : 'text-ink'}"
			href={home}
			aria-label="Accueil"
		>
			<SunMark class="h-[clamp(46px,3.6vw,62px)] w-[clamp(46px,3.6vw,62px)] flex-none text-coral" />
			<span
				class="font-display text-[clamp(24px,1.9vw,34px)] leading-none tracking-[0.04em] whitespace-nowrap transition-colors duration-500 {surHero
					? 'text-on-dusk'
					: 'text-[#5E4108]'}"
			>
				{site.name}
				<small
					class="mt-2 block font-mono text-xs font-medium tracking-[0.28em] uppercase transition-colors duration-500 {surHero
						? 'text-on-dusk-soft'
						: 'text-mute'}"
				>
					{reglages.sousTitreLogo}
				</small>
			</span>
		</a>

		<nav class="hidden items-center gap-[30px] xl:flex" aria-label="Navigation principale">
			{#each nav as item (item.anchor)}
				{#if item.pill}
					<a
						href="{home}#{item.anchor}"
						class="rounded-full bg-amber-soft px-4 py-2 font-mono text-xs font-semibold tracking-[0.14em] text-white uppercase shadow-[0_3px_10px_rgba(242,160,61,0.22)] transition hover:-translate-y-px hover:bg-amber hover:shadow-[0_5px_14px_rgba(242,160,61,0.34)]"
					>
						{item.label}
					</a>
				{:else}
					<a
						href="{home}#{item.anchor}"
						class="relative font-mono text-xs tracking-[0.14em] whitespace-nowrap uppercase transition-colors after:absolute {surHero
							? 'text-on-dusk hover:text-amber-soft'
							: 'text-ink-soft hover:text-coral-ink'} after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-coral after:transition-[width] after:duration-300 hover:after:w-full"
					>
						{item.label}
					</a>
				{/if}
			{/each}
		</nav>

		<a
			class="btn hidden btn-sun xl:inline-flex"
			href={resolve('/reservation')}
			onclick={(e) => {
				e.preventDefault();
				openBooking();
			}}
		>
			Prendre rendez-vous
		</a>

		<!-- Menu mobile : <details> plutôt qu'un panneau piloté uniquement par
		     JavaScript, pour qu'il fonctionne sans JS comme le reste des parcours
		     du site. `bind:open` n'ajoute que la fermeture au clic sur un lien. -->
		<details bind:open={menuOuvert} class="group xl:hidden">
			<!-- Pastille ronde « soleil » : au repos trois filets corail de largeurs
			     inégales (le court s'étire au survol), à l'ouverture le disque
			     s'allume en corail plein et les filets se croisent en X. -->
			<summary
				class="group/burger relative grid h-12 w-12 cursor-pointer list-none place-items-center rounded-full border border-[color-mix(in_oklab,var(--color-coral)_38%,transparent)] bg-[color-mix(in_oklab,#fff_58%,transparent)] shadow-[0_6px_18px_-12px_var(--color-coral-deep)] backdrop-blur-[6px] transition-[background-color,border-color,box-shadow,translate] duration-400 group-open:border-transparent group-open:bg-coral-deep group-open:shadow-[0_12px_28px_-12px_var(--color-coral-deep)] hover:-translate-y-px hover:border-coral hover:shadow-[0_12px_26px_-12px_var(--color-coral-deep)] [&::-webkit-details-marker]:hidden"
				aria-label={menuOuvert ? 'Fermer le menu' : 'Ouvrir le menu'}
			>
				<span
					class="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-amber)_60%,transparent),transparent_70%)] opacity-0 blur-[7px] transition-opacity duration-500 group-open:opacity-0 group-hover/burger:opacity-100"
					aria-hidden="true"
				></span>
				<span
					class="pointer-events-none absolute h-0.5 w-5 -translate-y-1.5 rounded-full bg-coral-ink transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-open:translate-y-0 group-open:rotate-45 group-open:bg-white"
				></span>
				<span
					class="pointer-events-none absolute h-0.5 w-3 rounded-full bg-coral-ink transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-open:w-0 group-open:opacity-0 group-hover/burger:w-5"
				></span>
				<span
					class="pointer-events-none absolute h-0.5 w-5 translate-y-1.5 rounded-full bg-coral-ink transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-open:translate-y-0 group-open:-rotate-45 group-open:bg-white"
				></span>
			</summary>

			<nav
				class="absolute top-[calc(100%+16px)] right-0 flex w-[min(320px,calc(100vw-2.75rem))] origin-top-right animate-menu-panel flex-col rounded-card border border-line-2 bg-[linear-gradient(175deg,color-mix(in_oklab,var(--color-surface)_96%,transparent),color-mix(in_oklab,var(--color-blush)_48%,var(--color-surface)))] p-3 shadow-[0_34px_70px_-30px_color-mix(in_oklab,var(--color-ember)_55%,transparent)] backdrop-blur-[16px]"
				aria-label="Navigation mobile"
			>
				<span
					class="absolute -top-[7px] right-[17px] h-3.5 w-3.5 rotate-45 rounded-[3px] border-t border-l border-line-2 bg-surface"
					aria-hidden="true"
				></span>
				{#each nav as item, i (item.anchor)}
					<!-- La pastille du bureau se lit mal dans une liste verticale : la mise
					     en avant devient une puce ambre allumée en permanence, plus un
					     texte appuyé. La couleur reste décorative — le texte garde son
					     contraste. Sur les autres entrées, la puce éclot au survol ;
					     réservée à sa place dès le repos, elle ne décale pas le libellé. -->
					<a
						href="{home}#{item.anchor}"
						onclick={() => (menuOuvert = false)}
						style="animation-delay: {70 + i * 45}ms"
						class="group/lien flex animate-menu-item items-center gap-3 rounded-btn px-3 py-3 font-mono text-xs tracking-[0.14em] uppercase transition-colors hover:bg-[color-mix(in_oklab,var(--color-coral)_9%,transparent)] hover:text-coral-ink {item.pill
							? 'font-semibold text-ink'
							: 'text-ink-soft'}"
					>
						<span
							class="h-[6px] w-[6px] flex-none rounded-full transition-[scale,background-color] duration-300 group-hover/lien:scale-100 {item.pill
								? 'bg-amber'
								: 'scale-0 bg-coral'}"
							aria-hidden="true"
						></span>
						<span class="transition-[translate] duration-300 group-hover/lien:translate-x-0.5">
							{item.label}
						</span>
					</a>
				{/each}
				<div class="rule my-2 px-3 text-line-2" aria-hidden="true">
					<i></i><b></b><i></i>
				</div>
				<a
					class="btn btn-sun animate-menu-item justify-center"
					style="animation-delay: {70 + nav.length * 45}ms"
					href={resolve('/reservation')}
					onclick={(e) => {
						e.preventDefault();
						menuOuvert = false;
						openBooking();
					}}
				>
					Prendre rendez-vous
				</a>
			</nav>
		</details>
	</div>
</header>
