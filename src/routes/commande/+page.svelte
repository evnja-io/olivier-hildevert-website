<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { site } from '$lib/config';
	import { TEXTES_DEMANDE, typeDemande } from '$lib/commande/textes';

	let { data } = $props();

	// superForm capture la valeur initiale par design (réactivité gérée en interne)
	// svelte-ignore state_referenced_locally
	const { form, errors, message, enhance, delayed } = superForm(data.form);

	const textes = $derived(TEXTES_DEMANDE[typeDemande($form.type)]);
</script>

<svelte:head>
	<title>{textes.titre} — {site.name}</title>
	<meta
		name="description"
		content="Commande ou adhésion auprès de {site.name} : laissez vos coordonnées, vous serez recontacté pour finaliser votre demande."
	/>
	<link rel="canonical" href="{site.url}/commande" />
</svelte:head>

<section class="mx-auto w-[min(860px,90vw)] pt-36 pb-24">
	<span class="eyebrow">Boutique</span>
	<h1 class="mt-5 text-4xl text-ink sm:text-5xl">{textes.titre}</h1>
	<p class="mt-4 max-w-2xl text-ink-soft">
		Laissez-moi vos coordonnées. {textes.accroche}
	</p>

	{#if $message}
		<p
			role="status"
			class="mt-8 rounded-card px-5 py-4 {$message.type === 'erreur'
				? 'bg-[color-mix(in_oklab,var(--color-ember)_12%,#fff)] text-ember'
				: 'bg-halo text-plum'}"
		>
			{$message.texte}
		</p>
	{/if}

	<form method="POST" use:enhance class="mt-10 space-y-8" novalidate>
		<input type="hidden" name="type" value={$form.type} />
		<div>
			<label for="produit" class="block text-sm font-medium text-ink-soft">Produit souhaité</label>
			<input
				type="text"
				id="produit"
				name="produit"
				bind:value={$form.produit}
				aria-invalid={$errors.produit ? 'true' : undefined}
				aria-describedby={$errors.produit ? 'produit-error' : undefined}
				class="mt-1 w-full rounded-lg border-line-2 bg-white focus:border-coral focus:ring-coral"
			/>
			{#if $errors.produit}
				<p id="produit-error" class="mt-1 text-sm text-ember">{$errors.produit[0]}</p>
			{/if}
		</div>

		<div class="grid gap-6 sm:grid-cols-2">
			<div>
				<label for="name" class="block text-sm font-medium text-ink-soft">Nom et prénom</label>
				<input
					type="text"
					id="name"
					name="name"
					bind:value={$form.name}
					aria-invalid={$errors.name ? 'true' : undefined}
					aria-describedby={$errors.name ? 'name-error' : undefined}
					autocomplete="name"
					class="mt-1 w-full rounded-lg border-line-2 bg-white focus:border-coral focus:ring-coral"
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
					class="mt-1 w-full rounded-lg border-line-2 bg-white focus:border-coral focus:ring-coral"
				/>
				{#if $errors.email}
					<p id="email-error" class="mt-1 text-sm text-ember">{$errors.email[0]}</p>
				{/if}
			</div>
		</div>

		<div>
			<label for="phone" class="block text-sm font-medium text-ink-soft">Téléphone</label>
			<input
				type="tel"
				id="phone"
				name="phone"
				bind:value={$form.phone}
				aria-invalid={$errors.phone ? 'true' : undefined}
				aria-describedby={$errors.phone ? 'phone-error' : undefined}
				autocomplete="tel"
				class="mt-1 w-full rounded-lg border-line-2 bg-white focus:border-coral focus:ring-coral"
			/>
			{#if $errors.phone}
				<p id="phone-error" class="mt-1 text-sm text-ember">{$errors.phone[0]}</p>
			{/if}
		</div>

		<div>
			<label for="message" class="block text-sm font-medium text-ink-soft">Votre message</label>
			<textarea
				id="message"
				name="message"
				rows="5"
				bind:value={$form.message}
				aria-invalid={$errors.message ? 'true' : undefined}
				aria-describedby={$errors.message ? 'message-error' : undefined}
				class="mt-1 w-full rounded-lg border-line-2 bg-white focus:border-coral focus:ring-coral"
			></textarea>
			{#if $errors.message}
				<p id="message-error" class="mt-1 text-sm text-ember">{$errors.message[0]}</p>
			{/if}
		</div>

		<button
			type="submit"
			disabled={$delayed}
			class="btn btn-sun disabled:cursor-not-allowed disabled:opacity-60"
		>
			{$delayed ? 'Envoi en cours…' : 'Envoyer ma demande'}
		</button>
	</form>
</section>
