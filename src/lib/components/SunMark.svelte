<script lang="ts">
	/**
	 * Le soleil — unique signe de marque du site : en-tête, section « Sept
	 * niveaux de lecture de l'être », favicon. La taille et la couleur se
	 * pilotent depuis le parent (`class="h-16 w-16 text-coral"`).
	 */
	let { class: classe = '' }: { class?: string } = $props();
</script>

<svg
	class={classe}
	viewBox="0 0 40 40"
	fill="none"
	stroke="currentColor"
	stroke-width="1.1"
	aria-hidden="true"
>
	<circle cx="20" cy="20" r="8" />
	<path
		d="M20 3v5M20 32v5M3 20h5M32 20h5M8 8l3.5 3.5M28.5 28.5L32 32M32 8l-3.5 3.5M11.5 28.5L8 32"
		stroke-linecap="round"
	/>
</svg>
