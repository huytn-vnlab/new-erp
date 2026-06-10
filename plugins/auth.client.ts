/**
 * auth.client.ts — restore user session on full page reload.
 *
 * If a valid access token cookie exists but user state is empty
 * (e.g. after hard refresh), re-fetch the user profile from the API.
 */
export default defineNuxtPlugin(async () => {
  const { token, user, fetchCurrentUser } = useAuth()

  if (token.value && !user.value) {
    await fetchCurrentUser()
  }
})
