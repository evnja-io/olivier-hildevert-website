<script lang="ts">
	import { resolve } from '$app/paths';
	import { openBooking } from '$lib/booking/booking.svelte';
	import { reveal } from '$lib/attachments/reveal';

	const reservation = resolve('/reservation');
</script>

<section
	id="boutique"
	class="relative z-1 scroll-mt-24 bg-linear-to-b from-blush to-blush-2 py-[clamp(86px,11vw,148px)]"
>
	<div class="wrap">
		<div class="reveal mb-16 max-w-[640px]" {@attach reveal()}>
			<span class="eyebrow">Boutique</span>
			<h2 class="mt-5 mb-4.5 text-[clamp(34px,5vw,58px)] tracking-[0.005em]">
				Prolonger le chemin
			</h2>
			<p class="text-[17.5px] leading-[1.66] text-ink-soft">
				Un roman thérapeutique et les veilleuses LUMINÂME, pensées pour la réharmonisation
				vibratoire des lieux et des états d'être.
			</p>
		</div>
		<div class="grid gap-5.5 lg:grid-cols-2">
			<div
				class="reveal grid items-center gap-6 rounded-card border border-line bg-white p-6 shadow-[0_24px_54px_-46px_color-mix(in_oklab,var(--color-ember)_40%,transparent)] transition hover:-translate-y-[5px] hover:shadow-[0_38px_76px_-46px_color-mix(in_oklab,var(--color-ember)_50%,transparent)] sm:grid-cols-[0.82fr_1.18fr]"
				{@attach reveal()}
			>
				<div
					class="aspect-3/4 overflow-hidden rounded-btn shadow-[0_16px_38px_-22px_color-mix(in_oklab,var(--color-ember)_50%,transparent)] max-sm:mx-auto max-sm:max-w-[200px]"
				>
					<enhanced:img
						src="$lib/assets/book-cover.jpeg"
						alt="Couverture du roman Angela, l'ange est là !"
						loading="lazy"
						sizes="(min-width: 640px) 240px, 200px"
						class="h-full w-full object-cover"
					/>
				</div>
				<div>
					<span class="font-mono text-[10px] tracking-[0.18em] text-coral uppercase">
						Roman fantastique &amp; thérapeutique
					</span>
					<h3 class="mt-2 mb-2.5 text-[26px] tracking-[0.01em]">Angela, l'ange est là !</h3>
					<p class="mb-4.5 text-[13.5px] leading-[1.6] text-ink-soft">
						Un récit où le merveilleux soigne; premier roman d'Olivier Hildevert, paru chez BoD.
					</p>
					<div class="flex flex-wrap items-center gap-3.5">
						<b class="font-mono text-[11px] tracking-[0.08em] text-mute uppercase">
							Disponible à la commande
						</b>
						<a
							class="btn btn-line"
							href={reservation}
							onclick={(e) => {
								e.preventDefault();
								openBooking();
							}}
						>
							Commander
						</a>
					</div>
				</div>
			</div>
			<div
				class="reveal grid items-center gap-6 rounded-card border border-line bg-white p-6 shadow-[0_24px_54px_-46px_color-mix(in_oklab,var(--color-ember)_40%,transparent)] transition hover:-translate-y-[5px] hover:shadow-[0_38px_76px_-46px_color-mix(in_oklab,var(--color-ember)_50%,transparent)] sm:grid-cols-[0.82fr_1.18fr]"
				{@attach reveal()}
			>
				<div
					class="aspect-square overflow-hidden rounded-btn shadow-[0_16px_38px_-22px_color-mix(in_oklab,var(--color-ember)_50%,transparent)] max-sm:mx-auto max-sm:max-w-[200px]"
				>
					<enhanced:img
						src="$lib/assets/luminame.jpg"
						alt="Veilleuse LUMINÂME gravée de motifs sacrés, allumée sur un socle en bois"
						loading="lazy"
						sizes="(min-width: 640px) 240px, 200px"
						class="h-full w-full object-cover"
						style="object-position: 38% center"
					/>
				</div>
				<div>
					<span class="font-mono text-[10px] tracking-[0.18em] text-coral uppercase">
						Veilleuses thérapeutiques
					</span>
					<h3 class="mt-2 mb-2.5 text-[26px] tracking-[0.01em]">LUMINÂME</h3>
					<p class="mb-4.5 text-[13.5px] leading-[1.6] text-ink-soft">
						Inspirées de motifs sacrés, pour l'harmonisation vibratoire des lieux, le bien-être
						énergétique et les pratiques méditatives.
					</p>
					<div class="flex flex-wrap items-center gap-3.5">
						<b class="font-mono text-[11px] tracking-[0.08em] text-mute uppercase">
							Catalogue en ligne
						</b>
						<a
							class="btn btn-line"
							href={reservation}
							onclick={(e) => {
								e.preventDefault();
								openBooking();
							}}
						>
							Découvrir
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
