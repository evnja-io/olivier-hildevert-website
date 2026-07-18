<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { site, nav } from '$lib/config';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="flex min-h-dvh flex-col">
	<header class="border-b border-gray-200">
		<div class="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
			<a href={resolve('/')} class="text-lg font-semibold text-gray-900">{site.name}</a>
			<nav aria-label="Navigation principale">
				<ul class="flex gap-6">
					{#each nav as item (item.href)}
						<li>
							<a
								href={resolve(item.href)}
								aria-current={page.url.pathname === item.href ? 'page' : undefined}
								class="text-sm text-gray-600 transition-colors hover:text-primary-600 aria-[current=page]:font-medium aria-[current=page]:text-primary-700"
							>
								{item.label}
							</a>
						</li>
					{/each}
				</ul>
			</nav>
		</div>
	</header>

	<main class="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
		{@render children()}
	</main>

	<footer class="border-t border-gray-200">
		<div class="mx-auto max-w-4xl px-4 py-6 text-sm text-gray-500">
			© {new Date().getFullYear()}
			{site.name}. Tous droits réservés.
		</div>
	</footer>
</div>
