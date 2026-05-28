import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/core/supabase/client'

export const useAuthStore = defineStore('auth', () => {
  const user    = ref<User | null>(null)
  const isReady = ref(false)

  // Single shared promise so multiple callers await the same init
  let initPromise: Promise<void> | null = null

  function init(): Promise<void> {
    if (!initPromise) initPromise = _init()
    return initPromise
  }

  function _init(): Promise<void> {
    if (!supabase) {
      isReady.value = true
      return Promise.resolve()
    }

    // onAuthStateChange fires INITIAL_SESSION immediately on registration,
    // giving us the stored session (or null) without a separate getSession() call.
    return new Promise<void>((resolve) => {
      supabase!.auth.onAuthStateChange((_event, session) => {
        user.value = session?.user ?? null
        if (!isReady.value) {
          isReady.value = true
          resolve()
        }
      })
    })
  }

  async function signIn(email: string, password: string) {
    if (!supabase) throw new Error('Supabase no configurado')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
  }

  async function signUp(email: string, password: string) {
    if (!supabase) throw new Error('Supabase no configurado')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw new Error(error.message)
  }

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  const isAuthenticated = computed(() => !!user.value)

  return { user, isReady, isAuthenticated, init, signIn, signUp, signOut }
})
