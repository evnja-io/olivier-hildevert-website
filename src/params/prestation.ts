import type { ParamMatcher } from '@sveltejs/kit';
import { PRESTATION_IDS, type PrestationId } from '$lib/booking/prestations';

export const match = ((param: string): param is PrestationId =>
	(PRESTATION_IDS as readonly string[]).includes(param)) satisfies ParamMatcher;
