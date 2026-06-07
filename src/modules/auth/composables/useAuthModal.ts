import { ref } from 'vue'

export type AuthModalMode = 'login' | 'register' | 'onboarding' | 'editProfile'

const mode = ref<AuthModalMode | null>(null)
const hint = ref<string | null>(null)

export function useAuthModal() {
  function open(m: AuthModalMode, h?: string) { mode.value = m; hint.value = h ?? null }
  function close() { mode.value = null; hint.value = null }
  function switchTo(m: AuthModalMode) { mode.value = m; hint.value = null }
  return { mode, hint, open, close, switchTo }
}
