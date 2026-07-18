import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		// e2e = mode dégradé sans CMS : neutralise le .env local (les variables
		// d'environnement existantes priment sur les fichiers .env)
		env: { STRAPI_URL: '', STRAPI_API_TOKEN: '' }
	},
	testMatch: '**/*.e2e.{ts,js}'
});
