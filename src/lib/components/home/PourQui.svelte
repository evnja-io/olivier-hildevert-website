<script lang="ts">
	const publics = [
		'Particuliers',
		'Couples',
		'Familles',
		'Artistes',
		'Sportifs',
		'Dirigeants',
		'Entreprises',
		'Associations',
		'Groupes de développement personnel'
	];
</script>

<div class="wrap">
	<div class="mx-auto mb-10.5 max-w-[640px] text-center">
		<span class="eyebrow eyebrow-center text-amber-soft!">Pour qui ?</span>
		<h2 class="mt-5 text-[clamp(34px,5vw,58px)] tracking-[0.005em]">
			Un accompagnement ouvert à chacun(e)
		</h2>
	</div>
	<div class="mx-auto flex max-w-[880px] flex-wrap justify-center gap-[11px]">
		{#each publics as public_ (public_)}
			<span
				class="rounded-full border border-[color-mix(in_oklab,#fff_34%,transparent)] bg-[color-mix(in_oklab,#fff_14%,transparent)] px-5 py-[11px] font-mono text-xs tracking-[0.08em] text-white backdrop-blur-[3px] transition hover:-translate-y-[3px] hover:border-white hover:bg-[color-mix(in_oklab,#fff_26%,transparent)]"
			>
				{public_}
			</span>
		{/each}
	</div>
</div>
