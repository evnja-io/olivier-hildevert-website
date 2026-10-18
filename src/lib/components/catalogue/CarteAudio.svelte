<script lang="ts">
	import type { AudioContent } from '$lib/content/types';

	let { audio }: { audio: AudioContent } = $props();

	// Un mp4 peut être une vraie vidéo : lecteur vidéo pour tout `video/*`.
	const estVideo = $derived(audio.fichier.mime.startsWith('video/'));
	const SIZES = '(min-width: 1280px) 290px, (min-width: 768px) 45vw, calc(100vw - 2.75rem)';
</script>

<article
	class="flex flex-col overflow-hidden rounded-card border border-line bg-white shadow-[0_24px_54px_-46px_color-mix(in_oklab,var(--color-ember)_40%,transparent)]"
>
	{#if audio.visuel}
		<div class="relative aspect-square bg-surface-2">
			<img
				src={audio.visuel.src}
				srcset={audio.visuel.srcset}
				sizes={SIZES}
				width={audio.visuel.largeur}
				height={audio.visuel.hauteur}
				alt={audio.visuel.alt}
				loading="lazy"
				class="absolute inset-0 h-full w-full object-contain"
			/>
		</div>
	{/if}
	<div class="flex flex-1 flex-col p-[22px_24px]">
		{#if audio.duree}
			<span class="font-mono text-xs tracking-[0.18em] text-coral-ink uppercase">{audio.duree}</span
			>
		{/if}
		<h3 class="mt-2 mb-2.5 text-2xl tracking-[0.01em]">{audio.titre}</h3>
		{#if audio.description}
			<p class="mb-4.5 flex-1 text-sm leading-[1.6] text-ink-soft">{audio.description}</p>
		{/if}
		<div class="mt-auto border-t border-line pt-4">
			{#if estVideo}
				<!-- svelte-ignore a11y_media_has_caption -->
				<video
					src={audio.fichier.url}
					controls
					preload="none"
					playsinline
					aria-label="Écouter : {audio.titre}"
					class="w-full rounded-[11px]"
				></video>
			{:else}
				<audio
					src={audio.fichier.url}
					controls
					preload="none"
					aria-label="Écouter : {audio.titre}"
					class="w-full"
				></audio>
			{/if}
		</div>
	</div>
</article>
