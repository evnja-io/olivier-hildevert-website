<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>{page.status === 404 ? 'Page introuvable' : 'Erreur'}</title>
</svelte:head>

<section class="py-16 text-center">
	<p class="text-sm font-medium text-primary-600">{page.status}</p>
	<h1 class="mt-2 text-3xl font-bold text-gray-900">
		{#if page.status === 404}
			Page introuvable
		{:else}
			Une erreur est survenue
		{/if}
	</h1>
	<p class="mt-4 text-gray-600">
		{#if page.status === 404}
			La page que vous cherchez n'existe pas ou a été déplacée.
		{:else}
			{page.error?.message ?? 'Veuillez réessayer plus tard.'}
		{/if}
	</p>
	<a
		href={resolve('/')}
		class="mt-8 inline-block rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
	>
		Retour à l'accueil
	</a>
</section>
