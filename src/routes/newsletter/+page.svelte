<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { site } from '$lib/config';

	let { data } = $props();

	// superForm capture la valeur initiale par design (réactivité gérée en interne)
	// svelte-ignore state_referenced_locally
	const { form, errors, message, enhance, delayed } = superForm(data.form);
</script>

<svelte:head>
	<title>Newsletter — {site.name}</title>
	<meta
		name="description"
		content="Recevez la lettre occasionnelle de {site.name} : pratiques, audios de sophrologie et actualités du cabinet."
	/>
	<link rel="canonical" href="{site.url}/newsletter" />
</svelte:head>

<section class="mx-auto max-w-xl px-4 pt-36 pb-24">
	<span class="eyebrow">Newsletter</span>
	<h1 class="mt-4 text-4xl text-ink">Restons en lien</h1>
	<p class="mt-3 text-ink-soft">
		Une lettre occasionnelle : pratiques à explorer, audios de sophrologie et actualités du cabinet.
		Pas de spam, promis.
	</p>

	{#if $message?.type === 'succes'}
		<p role="status" class="mt-6 rounded-lg bg-halo px-4 py-3 text-sm text-plum">
			{$message.texte}
		</p>
	{:else}
		{#if $message?.type === 'erreur'}
			<p
				role="alert"
				class="mt-6 rounded-lg bg-[color-mix(in_oklab,var(--color-ember)_12%,#fff)] px-4 py-3 text-sm text-ember"
			>
				{$message.texte}
			</p>
		{/if}
		<form method="POST" use:enhance class="mt-8 space-y-6" novalidate>
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

			<button type="submit" disabled={$delayed} class="btn btn-sun">
				{$delayed ? 'Envoi en cours…' : "Je m'inscris"}
			</button>

			<p class="font-mono text-[11px] tracking-[0.06em] text-mute">
				Désinscription possible à tout moment. Votre adresse n'est jamais partagée.
			</p>
		</form>
	{/if}
</section>
