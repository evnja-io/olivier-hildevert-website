<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { site } from '$lib/config';

	let { data } = $props();

	// superForm capture la valeur initiale par design (réactivité gérée en interne)
	// svelte-ignore state_referenced_locally
	const { form, errors, message, enhance, delayed } = superForm(data.form);
</script>

<svelte:head>
	<title>Contact — {site.name}</title>
	<meta name="description" content="Contactez {site.name} via ce formulaire." />
	<link rel="canonical" href="{site.url}/contact" />
</svelte:head>

<section class="mx-auto max-w-xl">
	<h1 class="text-3xl font-bold tracking-tight text-gray-900">Contact</h1>
	<p class="mt-3 text-gray-600">
		Une question, un projet ? Envoyez-moi un message, je vous répondrai rapidement.
	</p>

	{#if $message}
		<p role="status" class="mt-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
			{$message}
		</p>
	{/if}

	<form method="POST" use:enhance class="mt-8 space-y-6" novalidate>
		<div>
			<label for="name" class="block text-sm font-medium text-gray-700">Nom</label>
			<input
				type="text"
				id="name"
				name="name"
				bind:value={$form.name}
				aria-invalid={$errors.name ? 'true' : undefined}
				aria-describedby={$errors.name ? 'name-error' : undefined}
				autocomplete="name"
				class="mt-1 w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
			/>
			{#if $errors.name}
				<p id="name-error" class="mt-1 text-sm text-red-600">{$errors.name[0]}</p>
			{/if}
		</div>

		<div>
			<label for="email" class="block text-sm font-medium text-gray-700">Adresse e-mail</label>
			<input
				type="email"
				id="email"
				name="email"
				bind:value={$form.email}
				aria-invalid={$errors.email ? 'true' : undefined}
				aria-describedby={$errors.email ? 'email-error' : undefined}
				autocomplete="email"
				class="mt-1 w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
			/>
			{#if $errors.email}
				<p id="email-error" class="mt-1 text-sm text-red-600">{$errors.email[0]}</p>
			{/if}
		</div>

		<div>
			<label for="message" class="block text-sm font-medium text-gray-700">Message</label>
			<textarea
				id="message"
				name="message"
				rows="5"
				bind:value={$form.message}
				aria-invalid={$errors.message ? 'true' : undefined}
				aria-describedby={$errors.message ? 'message-error' : undefined}
				class="mt-1 w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
			></textarea>
			{#if $errors.message}
				<p id="message-error" class="mt-1 text-sm text-red-600">{$errors.message[0]}</p>
			{/if}
		</div>

		<button
			type="submit"
			disabled={$delayed}
			class="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
		>
			{$delayed ? 'Envoi en cours…' : 'Envoyer'}
		</button>
	</form>
</section>
