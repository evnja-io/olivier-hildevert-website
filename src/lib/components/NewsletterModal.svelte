<script lang="ts" module>
	import { zod4, zod4Client } from 'sveltekit-superforms/adapters';
	import { newsletterSchema } from '$lib/newsletter/schema';

	// Portée module : les adapters sont mis en cache par Superforms.
	const adapter = zod4(newsletterSchema);
	const clientAdapter = zod4Client(newsletterSchema);
</script>

<script lang="ts">
	import { defaults, superForm } from 'sveltekit-superforms';
	import { resolve } from '$app/paths';
	import { newsletter, openNewsletter, closeNewsletter } from '$lib/newsletter/newsletter.svelte';
	import { attacherExitIntent, marquerInscrit, snoozer } from '$lib/newsletter/exit-intent';

	let dlg: HTMLDialogElement | undefined = $state();

	const { form, errors, message, enhance, delayed } = superForm(defaults(adapter), {
		validators: clientAdapter,
		invalidateAll: false,
		applyAction: false
	});

	$effect(() => attacherExitIntent(openNewsletter));

	$effect(() => {
		if (newsletter.open) {
			dlg?.showModal();
		} else {
			dlg?.close();
		}
	});

	$effect(() => {
		if ($message) marquerInscrit();
	});
</script>

<dialog
	bind:this={dlg}
	aria-label="Newsletter"
	class="m-auto w-[min(440px,calc(100%-32px))] rounded-card bg-surface p-[34px_clamp(24px,6vw,40px)_32px] text-ink shadow-[0_40px_120px_-30px_rgba(40,20,10,0.4)] backdrop:bg-[color-mix(in_oklab,var(--color-ink)_35%,transparent)] backdrop:backdrop-blur-[4px]"
	onclose={() => {
		if (!$message) snoozer();
		if (newsletter.open) closeNewsletter();
	}}
	onmousedown={(e) => {
		if (e.target === dlg) closeNewsletter();
	}}
>
	<button
		type="button"
		class="absolute top-3.5 right-4 h-[34px] w-[34px] cursor-pointer rounded-full text-2xl leading-none text-mute transition-colors hover:bg-[color-mix(in_oklab,var(--color-coral)_14%,transparent)] hover:text-ink"
		aria-label="Fermer"
		onclick={closeNewsletter}
	>
		&times;
	</button>

	{#if $message}
		<div class="pt-2 pb-1 text-center">
			<div class="mb-4 flex justify-center text-coral" aria-hidden="true">
				<svg viewBox="0 0 64 64" width="56" height="56">
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
			<h3 class="font-display text-[clamp(22px,4vw,27px)]">Inscription confirmée</h3>
			<p role="status" class="mx-auto mt-2 mb-6 max-w-[320px] text-[14.5px] text-ink-soft">
				{$message}
			</p>
			<button type="button" class="mx-auto btn btn-sun" onclick={closeNewsletter}>Fermer</button>
		</div>
	{:else}
		<span class="font-mono text-xs font-semibold tracking-[0.28em] text-coral uppercase">
			Newsletter
		</span>
		<h3 class="mt-3 font-display text-[clamp(24px,4.4vw,30px)] leading-[1.15]">
			Avant de partir…
			<em class="block font-script text-[1.2em] leading-[1.1] text-coral not-italic">
				restons en lien
			</em>
		</h3>
		<p class="mt-3 mb-5 text-[14.5px] leading-[1.6] text-ink-soft">
			Une lettre occasionnelle : pratiques à explorer, audios de sophrologie et actualités du
			cabinet. Rien de plus.
		</p>

		<form method="POST" action={resolve('/newsletter')} use:enhance novalidate>
			<label for="nl-email" class="sr-only">Adresse e-mail</label>
			<input
				id="nl-email"
				type="email"
				name="email"
				placeholder="Votre adresse e-mail"
				autocomplete="email"
				bind:value={$form.email}
				aria-invalid={$errors.email ? 'true' : undefined}
				class="w-full rounded-[11px] border-[color-mix(in_oklab,var(--color-ink)_16%,transparent)] bg-white px-4 py-3.5 text-[15px] focus:border-coral focus:ring-coral"
			/>
			{#if $errors.email}<p class="mt-1 text-sm text-ember">{$errors.email[0]}</p>{/if}

			<div class="mt-4 flex items-center justify-between gap-3">
				<button
					type="button"
					class="cursor-pointer text-[13.5px] text-mute underline-offset-4 transition-colors hover:text-ink hover:underline"
					onclick={closeNewsletter}
				>
					Non merci
				</button>
				<button type="submit" disabled={$delayed} class="btn btn-sun">
					{$delayed ? 'Envoi…' : "Je m'inscris"}
				</button>
			</div>
			<p class="mt-4 font-mono text-[10.5px] leading-[1.5] tracking-[0.06em] text-mute">
				Désinscription possible à tout moment. Votre adresse n'est jamais partagée.
			</p>
		</form>
	{/if}
</dialog>

<style>
	/* entrée volontairement plus lente et plus douce que la modale de réservation */
	dialog {
		opacity: 0;
		transform: translateY(10px);
	}
	dialog[open] {
		opacity: 1;
		transform: none;
		transition:
			opacity 0.5s ease,
			transform 0.55s cubic-bezier(0.2, 0.8, 0.2, 1);
		@starting-style {
			opacity: 0;
			transform: translateY(10px);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		dialog[open] {
			transition: none;
		}
	}
</style>
