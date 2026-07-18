<script lang="ts">
	import { resolve } from '$app/paths';
	import { openBooking } from '$lib/booking/booking.svelte';
	import type { PrestationId } from '$lib/booking/prestations';

	const reservation = resolve('/reservation');

	function ouvrir(e: MouseEvent, id: PrestationId) {
		e.preventDefault();
		openBooking(id);
	}
</script>

<section id="tarifs" class="relative z-1 scroll-mt-24 bg-sky py-[clamp(86px,11vw,148px)]">
	<div class="wrap">
		<div class="mx-auto mb-16 max-w-[640px] text-center">
			<span class="eyebrow eyebrow-center">Tarifs</span>
			<h2 class="mt-5 text-[clamp(34px,5vw,58px)] tracking-[0.005em]">Une tarification claire</h2>
		</div>
		<div class="grid items-stretch gap-4.5 lg:grid-cols-3">
			<div
				class="flex flex-col items-center gap-2 rounded-card border border-line bg-white px-7.5 py-11 text-center shadow-[0_24px_50px_-46px_color-mix(in_oklab,var(--color-ember)_36%,transparent)]"
			>
				<span class="font-mono text-[10.5px] tracking-[0.2em] text-coral uppercase">Groupes</span>
				<div class="my-1.5 font-display text-[56px] leading-none text-ink">Devis</div>
				<p class="mb-3 text-[13.5px] leading-[1.55] text-ink-soft">
					Ateliers et stages collectifs, adaptés à votre groupe.
				</p>
				<a
					class="btn btn-line"
					href="{reservation}?prestation=stage"
					onclick={(e) => ouvrir(e, 'stage')}
				>
					Demander
				</a>
			</div>
			<div
				class="flex flex-col items-center gap-2 rounded-card bg-linear-165 from-coral to-ember px-7.5 py-11 text-center text-white shadow-[0_34px_70px_-38px_color-mix(in_oklab,var(--color-ember)_80%,transparent)] lg:-translate-y-2.5"
			>
				<span class="font-mono text-[10.5px] tracking-[0.2em] text-amber-soft uppercase">
					Particuliers
				</span>
				<div class="my-1.5 font-display text-[56px] leading-none">
					140<small class="text-xl text-white/82"> €</small>
				</div>
				<p class="mb-3 text-[13.5px] leading-[1.55] text-white/88">
					Séance individuelle de 1 h 30, en présentiel ou à distance.
				</p>
				<a
					class="btn bg-white text-ember shadow-none hover:bg-amber-soft hover:text-dusk"
					href="{reservation}?prestation=individuelle"
					onclick={(e) => ouvrir(e, 'individuelle')}
				>
					Réserver
				</a>
			</div>
			<div
				class="flex flex-col items-center gap-2 rounded-card border border-line bg-white px-7.5 py-11 text-center shadow-[0_24px_50px_-46px_color-mix(in_oklab,var(--color-ember)_36%,transparent)]"
			>
				<span class="font-mono text-[10.5px] tracking-[0.2em] text-coral uppercase">
					Entreprises
				</span>
				<div class="my-1.5 font-display text-[56px] leading-none text-ink">Devis</div>
				<p class="mb-3 text-[13.5px] leading-[1.55] text-ink-soft">
					Accompagnement des dirigeants et des collaborateurs sur mesure.
				</p>
				<a
					class="btn btn-line"
					href="{reservation}?prestation=entreprise"
					onclick={(e) => ouvrir(e, 'entreprise')}
				>
					Demander
				</a>
			</div>
		</div>
	</div>
</section>
