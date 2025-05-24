export default defineNuxtPlugin((nuxtApp) => {
	const config = useRuntimeConfig();
	return {
		provide: {
			apiConfig: config.public.apiBase,
		},
	};
});
