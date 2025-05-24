import { defineNuxtPlugin, useRuntimeConfig } from "nuxt/app";

export default defineNuxtPlugin((nuxtApp) => {
	const apiBase = useRuntimeConfig().public.apiBase as string;
  
	const api = {
	  // Sign-up API
	  signUp: async (userData: any) => {
		return await $fetch("/auth/sign-up", {
		  baseURL: apiBase,
		  method: "POST",
		  body: userData,
		});
	  },
	  // Sign-in API
	  signIn: async (credentials: any) => {
		return await $fetch("/auth/sign-in", {
		  baseURL: apiBase,
		  method: "POST",
		  body: credentials,
		});
	  },
	};
  
	// Provide the `api` globally in Nuxt
	nuxtApp.provide("api", api);
  });
  