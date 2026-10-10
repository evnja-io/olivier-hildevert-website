<script lang="ts" module>
	import { zod4, zod4Client } from 'sveltekit-superforms/adapters';
	import { commandeSchema } from '$lib/commande/schema';

	// Portée module : les adapters sont mis en cache par Superforms.
	const adapter = zod4(commandeSchema);
	const clientAdapter = zod4Client(commandeSchema);
</script>

<script lang="ts">
	import { defaults, superForm } from 'sveltekit-superforms';
	import { resolve } from '$app/paths';
	import { commande, closeCommande } from '$lib/commande/commande.svelte';

	let dlg: HTMLDialogElement | undefined = $state();

	const { form, errors, message, enhance, delayed, reset } = superForm(defaults(adapter), {
		validators: clientAdapter,
		invalidateAll: false,
		applyAction: false
	});

	$effect(() => {
		if (commande.open) {
			reset({ data: { produit: commande.produit } });
			dlg?.showModal();
		} else {
			dlg?.close();
		}
	});

	const champ =
		'w-full rounded-[11px] border-[color-mix(in_oklab,var(--color-ink)_16%,transparent)] bg-white px-4 py-3.5 text-base focus:border-coral focus:ring-coral';
</script>

<dialog
	bind:this={dlg}
	aria-label="Commander"
	class="m-auto max-h-[90vh] w-[min(640px,calc(100%-32px))] overflow-auto rounded-card bg-surface p-[38px_clamp(24px,5vw,48px)_40px] text-ink shadow-[0_40px_120px_-30px_rgba(40,20,10,0.45)] backdrop:bg-[color-mix(in_oklab,var(--color-ink)_55%,transparent)] backdrop:backdrop-blur-[6px]"
	onclose={() => {
		if (commande.open) closeCommande();
	}}
	onmousedown={(e) => {
		if (e.target === dlg) closeCommande();
	}}
>
	<button
		type="button"
		class="absolute top-3 right-3 h-11 w-11 cursor-pointer rounded-full text-3xl leading-none text-mute transition-colors hover:bg-[color-mix(in_oklab,var(--color-coral)_14%,transparent)] hover:text-ink"
		aria-label="Fermer"
		onclick={closeCommande}
	>
		&times;
	</button>

	<span class="mb-5 block font-mono text-xs font-semibold tracking-[0.28em] text-coral uppercase">
		Commander
	</span>

	<!-- Contenu rendu seulement à l'ouverture : la modale fermée ne doit pas
	     dupliquer les champs des pages de repli (/commande, /contact…). -->
	{#if !commande.open}
		<!-- fermée -->
	{:else if $message?.type === 'succes'}
		<div class="px-0 pt-3.5 pb-1.5 text-center">
			<div class="mb-4 flex justify-center text-coral" aria-hidden="true">
				<svg viewBox="0 0 64 64" width="64" height="64">
					<circle
						cx="32"
						cy="32"
						r="30"
						fill="none"
						stroke="currentColor"
						stroke-width="1.4"
						opacity="0.45"
					/>
					<path
						d="M20 33 l8 8 l16 -18"
						fill="none"
						stroke="currentColor"
						stroke-width="2.2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</div>
			<h3 class="font-display text-2xl">Demande transmise</h3>
			<p role="status" class="mx-auto mt-2 mb-6 max-w-[380px] text-base text-ink-soft">
				{$message.texte}
			</p>
			<button type="button" class="mx-auto btn btn-sun" onclick={closeCommande}>Fermer</button>
		</div>
	{:else}
		<h3 class="font-display text-2xl">Vos coordonnées</h3>
		<p class="mt-1.5 mb-5 text-base text-ink-soft">
			Je vous recontacte pour finaliser votre commande.
		</p>

		{#if $message?.type === 'erreur'}
			<p
				role="alert"
				class="mb-4 rounded-[11px] bg-[color-mix(in_oklab,var(--color-ember)_12%,#fff)] px-4 py-3 text-sm text-ember"
			>
				{$message.texte}
			</p>
		{/if}

		<div
			class="mb-5 flex justify-between gap-4 rounded-[14px] border border-[color-mix(in_oklab,var(--color-ink)_12%,transparent)] bg-surface-2 px-4.5 py-4.5 text-sm"
		>
			<span class="text-ink-soft">Produit</span>
			<strong class="text-right font-semibold">{$form.produit || '—'}</strong>
		</div>

		<form method="POST" action={resolve('/commande')} use:enhance novalidate>
			<input type="hidden" name="produit" value={$form.produit} />
			{#if $errors.produit}<p class="mb-3 text-sm text-ember">{$errors.produit[0]}</p>{/if}
			<div class="flex flex-col gap-3">
				<div>
					<label for="cmd-name" class="sr-only">Nom et prénom</label>
					<input
						id="cmd-name"
						type="text"
						name="name"
						placeholder="Nom et prénom"
						autocomplete="name"
						bind:value={$form.name}
						aria-invalid={$errors.name ? 'true' : undefined}
						class={champ}
					/>
					{#if $errors.name}<p class="mt-1 text-sm text-ember">{$errors.name[0]}</p>{/if}
				</div>
				<div>
					<label for="cmd-email" class="sr-only">Adresse e-mail</label>
					<input
						id="cmd-email"
						type="email"
						name="email"
						placeholder="Adresse e-mail"
						autocomplete="email"
						bind:value={$form.email}
						aria-invalid={$errors.email ? 'true' : undefined}
						class={champ}
					/>
					{#if $errors.email}<p class="mt-1 text-sm text-ember">{$errors.email[0]}</p>{/if}
				</div>
				<div>
					<label for="cmd-phone" class="sr-only">Téléphone</label>
					<input
						id="cmd-phone"
						type="tel"
						name="phone"
						placeholder="Téléphone"
						autocomplete="tel"
						bind:value={$form.phone}
						aria-invalid={$errors.phone ? 'true' : undefined}
						class={champ}
					/>
					{#if $errors.phone}<p class="mt-1 text-sm text-ember">{$errors.phone[0]}</p>{/if}
				</div>
				<div>
					<label for="cmd-message" class="sr-only">
						Quantité, adresse de livraison ou précisions
					</label>
					<textarea
						id="cmd-message"
						name="message"
						placeholder="Quantité, adresse de livraison ou précisions"
						rows="3"
						bind:value={$form.message}
						aria-invalid={$errors.message ? 'true' : undefined}
						class="min-h-[84px] resize-y {champ}"></textarea>
					{#if $errors.message}<p class="mt-1 text-sm text-ember">{$errors.message[0]}</p>{/if}
				</div>
			</div>

			<div class="mt-6 flex justify-end">
				<button
					type="submit"
					disabled={$delayed}
					class="cursor-pointer rounded-full bg-ink px-6 py-3 text-sm font-semibold text-surface transition-colors hover:bg-coral disabled:cursor-not-allowed disabled:opacity-40"
				>
					{$delayed ? 'Envoi en cours…' : 'Envoyer ma demande'}
				</button>
			</div>
		</form>
	{/if}
</dialog>

<style>
	dialog {
		opacity: 0;
		transform: translateY(18px) scale(0.985);
	}
	dialog[open] {
		opacity: 1;
		transform: none;
		transition:
			opacity 0.35s ease,
			transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
		@starting-style {
			opacity: 0;
			transform: translateY(18px) scale(0.985);
		}
	}
</style>
