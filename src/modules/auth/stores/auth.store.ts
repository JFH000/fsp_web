import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/core/supabase/client'

export const useAuthStore = defineStore('auth', () => {
  const user     = ref<User | null>(null)
  const role     = ref<string | null>(null)
  const isReady  = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin         = computed(() => role.value === 'admin')

  let initPromise: Promise<void> | null = null

  function init(): Promise<void> {
    if (!initPromise) initPromise = _init()
    return initPromise
  }

  async function fetchRole(userId: string): Promise<void> {
    if (!supabase) return
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', userId)
        .single()
      role.value = data?.role ?? null
    } catch {
      role.value = null
    }
  }

  function _init(): Promise<void> {
    if (!supabase) {
      isReady.value = true
      return Promise.resolve()
    }

    return new Promise<void>((resolve) => {
      supabase!.auth.onAuthStateChange((_event, session) => {
        user.value = session?.user ?? null
        const resolveReady = () => {
          if (!isReady.value) {
            isReady.value = true
            resolve()
          }
        }
        if (user.value) {
          fetchRole(user.value.id).finally(resolveReady)
        } else {
          role.value = null
          resolveReady()
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
    role.value = null
  }

  return { user, role, isReady, isAuthenticated, isAdmin, init, signIn, signUp, signOut }
})
