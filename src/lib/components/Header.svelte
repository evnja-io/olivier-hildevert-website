<script lang="ts">
	import { resolve } from '$app/paths';
	import { site, nav } from '$lib/config';
	import { openBooking } from '$lib/booking/booking.svelte';
	import type { ReglagesSite } from '$lib/content/types';
	import { defaultReglages } from '$lib/content/defaults';
	import SunMark from '$lib/components/SunMark.svelte';

	let { reglages = defaultReglages }: { reglages?: ReglagesSite } = $props();

	let scrollY = $state(0);
	const scrolled = $derived(scrollY > 40);
	const home = resolve('/');

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
		<a class="flex min-w-0 items-center gap-3.5 text-ink" href={home} aria-label="Accueil">
			<SunMark class="h-[clamp(46px,3.6vw,62px)] w-[clamp(46px,3.6vw,62px)] flex-none text-coral" />
			<span
				class="font-display text-[clamp(24px,1.9vw,34px)] leading-none tracking-[0.04em] whitespace-nowrap text-[#5E4108]"
			>
				{site.name}
				<small
					class="mt-2 block font-mono text-xs font-medium tracking-[0.28em] text-mute uppercase"
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
						class="relative font-mono text-xs tracking-[0.14em] whitespace-nowrap text-ink-soft uppercase transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-coral after:transition-[width] after:duration-300 hover:text-coral-ink hover:after:w-full"
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
		<details bind:open={menuOuvert} class="xl:hidden">
			<summary
				class="grid h-12 w-12 cursor-pointer list-none place-items-center gap-[5px] rounded-btn border border-[color-mix(in_oklab,var(--color-coral)_40%,transparent)] bg-[color-mix(in_oklab,#fff_55%,transparent)] [&::-webkit-details-marker]:hidden"
				aria-label={menuOuvert ? 'Fermer le menu' : 'Ouvrir le menu'}
			>
				<span class="block h-0.5 w-5 rounded-full bg-coral-ink"></span>
				<span class="block h-0.5 w-5 rounded-full bg-coral-ink"></span>
				<span class="block h-0.5 w-5 rounded-full bg-coral-ink"></span>
			</summary>

			<nav
				class="absolute top-[calc(100%+14px)] right-0 flex w-[min(320px,calc(100vw-2.75rem))] flex-col gap-1 rounded-card border border-line bg-[color-mix(in_oklab,var(--color-sky)_97%,transparent)] p-4 shadow-[0_30px_60px_-30px_color-mix(in_oklab,var(--color-ember)_45%,transparent)] backdrop-blur-[14px]"
				aria-label="Navigation mobile"
			>
				{#each nav as item (item.anchor)}
					<!-- La pastille du bureau se lit mal dans une liste verticale : la mise
					     en avant devient un filet ambre à gauche, plus un texte appuyé.
					     L'ambre reste décoratif — le texte garde sa couleur contrastée. -->
					<a
						href="{home}#{item.anchor}"
						onclick={() => (menuOuvert = false)}
						class="rounded-btn py-3 font-mono text-xs tracking-[0.14em] uppercase transition-colors hover:bg-[color-mix(in_oklab,var(--color-coral)_10%,transparent)] hover:text-coral-ink {item.pill
							? 'border-l-2 border-amber pr-3 pl-2.5 font-semibold text-ink'
							: 'px-3 text-ink-soft'}"
					>
						{item.label}
					</a>
				{/each}
				<a
					class="mt-2 btn btn-sun justify-center"
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
