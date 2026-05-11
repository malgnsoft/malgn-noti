function createApiClient() {
  const config = useRuntimeConfig()

  return $fetch.create({
    baseURL: config.public.apiBaseUrl,
    credentials: 'include',
    retry: 0,
    onRequest({ options }) {
      options.headers = new Headers(options.headers)
      if (!options.headers.has('Accept')) {
        options.headers.set('Accept', 'application/json')
      }
    },
    onResponseError({ response }) {
      if (response?.status === 401 && import.meta.client) {
        navigateTo('/login')
      }
    }
  })
}

let _apiClient: ReturnType<typeof createApiClient> | undefined

export function useApi() {
  if (!_apiClient) _apiClient = createApiClient()
  return _apiClient
}
