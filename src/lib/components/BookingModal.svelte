<script lang="ts" module>
	import { zod4, zod4Client } from 'sveltekit-superforms/adapters';
	import { bookingSchema } from '$lib/booking/schema';

	// Portée module : les adapters sont mis en cache par Superforms.
	const adapter = zod4(bookingSchema);
	const clientAdapter = zod4Client(bookingSchema);
</script>

<script lang="ts">
	import { defaults, superForm } from 'sveltekit-superforms';
	import { resolve } from '$app/paths';
	import { booking, closeBooking } from '$lib/booking/booking.svelte';
	import { PRESTATIONS, type PrestationId } from '$lib/booking/prestations';

	let dlg: HTMLDialogElement | undefined = $state();
	let step = $state(0);

	const { form, errors, message, enhance, delayed, reset } = superForm(defaults(adapter), {
		validators: clientAdapter,
		invalidateAll: false,
		applyAction: false
	});

	const prestationChoisie = $derived(PRESTATIONS.find((p) => p.id === $form.prestation));

	$effect(() => {
		if (booking.open) {
			reset({ data: booking.prestation ? { prestation: booking.prestation } : undefined });
			step = booking.prestation ? 1 : 0;
			dlg?.showModal();
		} else {
			dlg?.close();
		}
	});

	function choisir(id: PrestationId) {
		$form.prestation = id;
		step = 1;
	}
</script>

<dialog
	bind:this={dlg}
	aria-label="Prendre rendez-vous"
	class="m-auto max-h-[90vh] w-[min(640px,calc(100%-32px))] overflow-auto rounded-card bg-surface p-[38px_clamp(24px,5vw,48px)_40px] text-ink shadow-[0_40px_120px_-30px_rgba(40,20,10,0.45)] backdrop:bg-[color-mix(in_oklab,var(--color-ink)_55%,transparent)] backdrop:backdrop-blur-[6px]"
	onclose={() => {
		if (booking.open) closeBooking();
	}}
	onmousedown={(e) => {
		if (e.target === dlg) closeBooking();
	}}
>
	<button
		type="button"
		class="absolute top-4 right-[18px] h-[38px] w-[38px] cursor-pointer rounded-full text-3xl leading-none text-mute transition-colors hover:bg-[color-mix(in_oklab,var(--color-coral)_14%,transparent)] hover:text-ink"
		aria-label="Fermer"
		onclick={closeBooking}
	>
		&times;
	</button>

	<div class="mb-5 flex flex-col gap-3.5">
		<span class="font-mono text-xs font-semibold tracking-[0.28em] text-coral uppercase">
			Prendre rendez-vous
		</span>
		{#if !$message}
			<div class="flex gap-2" aria-hidden="true">
				{#each [0, 1] as i (i)}
					<span
						class="h-[3px] w-[30px] rounded-full transition-colors {i === step
							? 'bg-coral'
							: i < step
								? 'bg-coral-soft'
								: 'bg-[color-mix(in_oklab,var(--color-ink)_14%,transparent)]'}"
					></span>
				{/each}
			</div>
		{/if}
	</div>

	{#if $message}
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
			<h3 class="font-display text-[clamp(24px,4vw,30px)]">Demande transmise</h3>
			<p role="status" class="mx-auto mt-2 mb-6 max-w-[380px] text-[15px] text-ink-soft">
				{$message}
			</p>
			<button type="button" class="mx-auto btn btn-sun" onclick={closeBooking}>Fermer</button>
		</div>
	{:else if step === 0}
		<h3 class="font-display text-[clamp(24px,4vw,30px)]">Quel accompagnement ?</h3>
		<p class="mt-1.5 mb-5 text-[15px] text-ink-soft">
			Choisissez le type de séance qui vous correspond.
		</p>
		<div class="grid gap-3 sm:grid-cols-2">
			{#each PRESTATIONS as p (p.id)}
				<button
					type="button"
					class="flex cursor-pointer flex-col gap-1 rounded-[14px] border border-[color-mix(in_oklab,var(--color-ink)_12%,transparent)] bg-surface-2 p-[18px_18px_16px] text-left transition hover:-translate-y-px hover:border-coral"
					onclick={() => choisir(p.id)}
				>
					<span class="font-display text-lg">{p.titre}</span>
					<span class="text-[12.5px] font-semibold tracking-[0.04em] text-coral">{p.meta}</span>
					<span class="text-[13.5px] leading-[1.45] text-ink-soft">{p.desc}</span>
				</button>
			{/each}
		</div>
	{:else}
		<h3 class="font-display text-[clamp(24px,4vw,30px)]">Vos coordonnées</h3>
		<p class="mt-1.5 mb-5 text-[15px] text-ink-soft">
			Les séances se déroulent par téléphone. Je vous recontacte pour convenir ensemble d'une date
			et d'un horaire.
		</p>

		<div
			class="mb-5 rounded-[14px] border border-[color-mix(in_oklab,var(--color-ink)_12%,transparent)] bg-surface-2 px-4.5 py-1.5"
		>
			<div
				class="flex justify-between gap-4 border-b border-[color-mix(in_oklab,var(--color-ink)_9%,transparent)] py-3 text-sm"
			>
				<span class="text-ink-soft">Accompagnement</span>
				<strong class="text-right font-semibold">{prestationChoisie?.titre ?? '—'}</strong>
			</div>
			<div class="flex justify-between gap-4 py-3 text-sm">
				<span class="text-ink-soft">Format</span>
				<strong class="text-right font-semibold">Par téléphone</strong>
			</div>
		</div>

		<form method="POST" action={resolve('/reservation')} use:enhance novalidate>
			<input type="hidden" name="prestation" value={$form.prestation ?? ''} />
			<div class="flex flex-col gap-3">
				<div>
					<label for="bk-name" class="sr-only">Nom et prénom</label>
					<input
						id="bk-name"
						type="text"
						name="name"
						placeholder="Nom et prénom"
						autocomplete="name"
						bind:value={$form.name}
						aria-invalid={$errors.name ? 'true' : undefined}
						class="w-full rounded-[11px] border-[color-mix(in_oklab,var(--color-ink)_16%,transparent)] bg-white px-4 py-3.5 text-[15px] focus:border-coral focus:ring-coral"
					/>
					{#if $errors.name}<p class="mt-1 text-sm text-ember">{$errors.name[0]}</p>{/if}
				</div>
				<div>
					<label for="bk-email" class="sr-only">Adresse e-mail</label>
					<input
						id="bk-email"
						type="email"
						name="email"
						placeholder="Adresse e-mail"
						autocomplete="email"
						bind:value={$form.email}
						aria-invalid={$errors.email ? 'true' : undefined}
						class="w-full rounded-[11px] border-[color-mix(in_oklab,var(--color-ink)_16%,transparent)] bg-white px-4 py-3.5 text-[15px] focus:border-coral focus:ring-coral"
					/>
					{#if $errors.email}<p class="mt-1 text-sm text-ember">{$errors.email[0]}</p>{/if}
				</div>
				<div>
					<label for="bk-phone" class="sr-only">Téléphone</label>
					<input
						id="bk-phone"
						type="tel"
						name="phone"
						placeholder="Téléphone"
						autocomplete="tel"
						bind:value={$form.phone}
						aria-invalid={$errors.phone ? 'true' : undefined}
						class="w-full rounded-[11px] border-[color-mix(in_oklab,var(--color-ink)_16%,transparent)] bg-white px-4 py-3.5 text-[15px] focus:border-coral focus:ring-coral"
					/>
					{#if $errors.phone}<p class="mt-1 text-sm text-ember">{$errors.phone[0]}</p>{/if}
				</div>
				<div>
					<label for="bk-message" class="sr-only">
						Vos disponibilités et quelques mots sur votre demande
					</label>
					<textarea
						id="bk-message"
						name="message"
						placeholder="Vos disponibilités et quelques mots sur votre demande"
						rows="3"
						bind:value={$form.message}
						aria-invalid={$errors.message ? 'true' : undefined}
						class="min-h-[84px] w-full resize-y rounded-[11px] border-[color-mix(in_oklab,var(--color-ink)_16%,transparent)] bg-white px-4 py-3.5 text-[15px] focus:border-coral focus:ring-coral"
					></textarea>
					{#if $errors.message}<p class="mt-1 text-sm text-ember">{$errors.message[0]}</p>{/if}
				</div>
			</div>

			<div class="mt-6 flex justify-between gap-3">
				<button
					type="button"
					class="cursor-pointer rounded-full border border-[color-mix(in_oklab,var(--color-ink)_18%,transparent)] px-6 py-3 text-[14.5px] font-semibold text-ink-soft transition-colors hover:border-ink hover:text-ink"
					onclick={() => (step = 0)}
				>
					Retour
				</button>
				<button
					type="submit"
					disabled={$delayed}
					class="cursor-pointer rounded-full bg-ink px-6 py-3 text-[14.5px] font-semibold text-surface transition-colors hover:bg-coral disabled:cursor-not-allowed disabled:opacity-40"
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
	/* bloque le défilement de la page quand la modale est ouverte */
	:global(body:has(dialog[open])) {
		overflow: hidden;
	}
</style>
