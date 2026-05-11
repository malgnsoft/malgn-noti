import { defineStore } from 'pinia'
import type { CurrentUser, Tenant } from '~/types/domain'

interface AuthState {
  user: CurrentUser | null
  tenant: Tenant | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    tenant: null
  }),
  getters: {
    isAuthed: (s): boolean => s.user !== null,
    creditBalance: (s): number => s.tenant?.creditBalance ?? 0
  },
  actions: {
    async logout() {
      this.user = null
      this.tenant = null
      await navigateTo('/login')
    }
  }
})
