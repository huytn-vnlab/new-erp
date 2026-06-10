/**
 * api.client.ts — provides a pre-configured $fetch instance as $api.
 *
 * Automatically injects Authorization header and handles 401 → refresh.
 *
 * Usage in components:
 *   const { $api } = useNuxtApp()
 *   const data = await $api('/api/user/list')
 *
 * Or use the useApi() composable which wraps this same logic.
 */
export default defineNuxtPlugin(() => {
  const { token, refreshAccessToken } = useAuth()
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: config.public.apiBase,

    onRequest({ options }) {
      if (token.value) {
        const headers = new Headers(options.headers as HeadersInit | undefined)
        headers.set('Authorization', `Bearer ${token.value}`)
        options.headers = headers
      }
    },

    async onResponseError({ response }) {
      if (response.status === 401) {
        await refreshAccessToken()
      }
    },
  })

  return {
    provide: { api },
  }
})
