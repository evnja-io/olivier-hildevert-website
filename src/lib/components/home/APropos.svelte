<script lang="ts">
	const creds = [
		'Praticien depuis 1992',
		'Collège International de Sophrologie de Paris',
		'Chambre Syndicale de la Sophrologie',
		'Préparation mentale',
		'Psycho-recrutement'
	];
</script>

<section
	id="apropos"
	class="relative z-1 scroll-mt-24 bg-linear-to-b from-blush to-blush-2 py-[clamp(86px,11vw,148px)]"
>
	<div class="wrap grid items-center gap-16 lg:grid-cols-[0.84fr_1.16fr]">
		<div class="relative aspect-4/5 w-full max-lg:mx-auto max-lg:max-w-[380px]">
			<div
				class="absolute -inset-y-4 -right-4 left-4 -z-1 rounded-card border border-coral opacity-55"
				aria-hidden="true"
			></div>
			<div
				class="absolute inset-0 overflow-hidden rounded-card shadow-[0_40px_90px_-44px_color-mix(in_oklab,var(--color-ember)_45%,transparent)]"
			>
				<enhanced:img
					src="$lib/assets/portrait-cabinet.jpg"
					alt="Olivier Hildevert dans son cabinet"
					loading="lazy"
					sizes="(min-width: 1024px) 460px, 90vw"
					class="h-full w-full object-cover"
				/>
			</div>
			<span
				class="absolute -bottom-7.5 left-0 font-mono text-[10px] tracking-[0.16em] text-mute uppercase"
			>
				Cabinet — relation d'aide
			</span>
		</div>
		<div>
			<span class="eyebrow">À propos</span>
			<h2 class="mt-3.5 mb-2 text-[clamp(34px,4.6vw,56px)]">Olivier Hildevert</h2>
			<p class="mb-6 font-mono text-[11px] tracking-[0.2em] text-coral uppercase">
				Sophrologue · praticien en relation d'aide
			</p>
			<p class="mb-4 text-[15.5px] leading-[1.7] text-ink-soft">
				Sophrologue social et praticien en relation d'aide depuis 1992, formé au Collège
				International de Sophrologie de Paris et membre professionnel de la Chambre Syndicale de la
				Sophrologie.
			</p>
			<p class="mb-4 text-[15.5px] leading-[1.7] text-ink-soft">
				Initié aux techniques d'éveil énergétique, il met en évidence les interactions fondamentales
				entre les dimensions psychologique, émotionnelle, vibratoire, philosophique et spirituelle
				de l'être humain.
			</p>
			<blockquote
				class="my-6.5 border-l border-coral pl-6.5 font-display text-2xl leading-[1.38] text-plum italic"
			>
				Révéler le sens des expériences dans lesquelles chacun est en quête de construction, de
				réparation et de transformation.
			</blockquote>
			<p class="mb-4 text-[15.5px] leading-[1.7] text-ink-soft">
				Conseiller en entreprise spécialisé en psycho-recrutement, préparateur mental des sportifs
				et des artistes, auteur d'audios de sophrologie, d'articles et de pièces de théâtre.
			</p>
			<div class="mt-6.5 flex flex-wrap gap-2.5">
				{#each creds as cred (cred)}
					<span
						class="rounded-full border border-line bg-[color-mix(in_oklab,var(--color-coral)_10%,#fff)] px-3.5 py-2 font-mono text-[10.5px] tracking-[0.08em] text-ink-soft"
					>
						{cred}
					</span>
				{/each}
			</div>
		</div>
	</div>
</section>
