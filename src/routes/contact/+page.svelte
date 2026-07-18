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
	<h1 class="text-4xl text-ink">Contact</h1>
	<p class="mt-3 text-ink-soft">
		Une question, un projet ? Envoyez-moi un message, je vous répondrai rapidement.
	</p>

	{#if $message}
		<p role="status" class="mt-6 rounded-lg bg-halo px-4 py-3 text-sm text-plum">
			{$message}
		</p>
	{/if}

	<form method="POST" use:enhance class="mt-8 space-y-6" novalidate>
		<div>
			<label for="name" class="block text-sm font-medium text-ink-soft">Nom</label>
			<input
				type="text"
				id="name"
				name="name"
				bind:value={$form.name}
				aria-invalid={$errors.name ? 'true' : undefined}
				aria-describedby={$errors.name ? 'name-error' : undefined}
				autocomplete="name"
				class="mt-1 w-full rounded-lg border-line-2 focus:border-coral focus:ring-coral"
			/>
			{#if $errors.name}
				<p id="name-error" class="mt-1 text-sm text-ember">{$errors.name[0]}</p>
			{/if}
		</div>

		<div>
			<label for="email" class="block text-sm font-medium text-ink-soft">Adresse e-mail</label>
			<input
				type="email"
				id="email"
				name="email"
				bind:value={$form.email}
				aria-invalid={$errors.email ? 'true' : undefined}
				aria-describedby={$errors.email ? 'email-error' : undefined}
				autocomplete="email"
				class="mt-1 w-full rounded-lg border-line-2 focus:border-coral focus:ring-coral"
			/>
			{#if $errors.email}
				<p id="email-error" class="mt-1 text-sm text-ember">{$errors.email[0]}</p>
			{/if}
		</div>

		<div>
			<label for="message" class="block text-sm font-medium text-ink-soft">Message</label>
			<textarea
				id="message"
				name="message"
				rows="5"
				bind:value={$form.message}
				aria-invalid={$errors.message ? 'true' : undefined}
				aria-describedby={$errors.message ? 'message-error' : undefined}
				class="mt-1 w-full rounded-lg border-line-2 focus:border-coral focus:ring-coral"></textarea>
			{#if $errors.message}
				<p id="message-error" class="mt-1 text-sm text-ember">{$errors.message[0]}</p>
			{/if}
		</div>

		<button
			type="submit"
			disabled={$delayed}
			class="rounded-lg bg-coral px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ember disabled:cursor-not-allowed disabled:opacity-60"
		>
			{$delayed ? 'Envoi en cours…' : 'Envoyer'}
		</button>
	</form>
</section>
