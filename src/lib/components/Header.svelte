<script lang="ts">
	import { resolve } from '$app/paths';
	import { site, nav } from '$lib/config';
	import { openBooking } from '$lib/booking/booking.svelte';

	let scrollY = $state(0);
	const scrolled = $derived(scrollY > 40);
	const home = resolve('/');
</script>

<svelte:window bind:scrollY />

<header
	class="fixed inset-x-0 top-0 z-120 transition-[background,box-shadow,padding] duration-500 {scrolled
		? 'bg-[color-mix(in_oklab,var(--color-sky)_86%,transparent)] py-[15px] shadow-[0_1px_0_var(--color-line)] backdrop-blur-[14px] backdrop-saturate-110'
		: 'py-[26px]'}"
>
	<div class="wrap flex items-center justify-between gap-6">
		<a class="flex items-center gap-3.5 text-ink" href={home} aria-label="Accueil">
			<svg
				class="h-[38px] w-[38px] flex-none text-coral"
				viewBox="0 0 40 40"
				fill="none"
				stroke="currentColor"
				stroke-width="1.2"
				aria-hidden="true"
			>
				<circle cx="20" cy="20" r="8" />
				<path
					d="M20 3v5M20 32v5M3 20h5M32 20h5M8 8l3.5 3.5M28.5 28.5L32 32M32 8l-3.5 3.5M11.5 28.5L8 32"
					stroke-linecap="round"
				/>
			</svg>
			<span class="font-display text-[22px] leading-none tracking-[0.04em] whitespace-nowrap">
				{site.name}
				<small
					class="mt-1.5 block font-mono text-[8.5px] font-medium tracking-[0.36em] text-mute uppercase"
				>
					Consultant
				</small>
			</span>
		</a>
		<nav class="hidden items-center gap-[30px] lg:flex" aria-label="Navigation principale">
			{#each nav as item (item.anchor)}
				{#if item.pill}
					<a
						href="{home}#{item.anchor}"
						class="rounded-full bg-amber-soft px-4 py-2 font-mono text-[11.5px] font-semibold tracking-[0.14em] text-plum uppercase shadow-[0_3px_10px_rgba(242,160,61,0.22)] transition hover:-translate-y-px hover:bg-amber hover:shadow-[0_5px_14px_rgba(242,160,61,0.34)]"
					>
						{item.label}
					</a>
				{:else}
					<a
						href="{home}#{item.anchor}"
						class="relative font-mono text-[11.5px] tracking-[0.14em] whitespace-nowrap text-ink-soft uppercase transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-coral after:transition-[width] after:duration-300 hover:text-coral hover:after:w-full"
					>
						{item.label}
					</a>
				{/if}
			{/each}
		</nav>
		<a
			class="btn btn-sun"
			href={resolve('/reservation')}
			onclick={(e) => {
				e.preventDefault();
				openBooking();
			}}
		>
			Prendre rendez-vous
		</a>
	</div>
</header>
