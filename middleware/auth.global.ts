/* v1
 import { defineNuxtRouteMiddleware, navigateTo } from '#imports'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { $supabase } = useNuxtApp()
  const { data } = await $supabase.auth.getSession()

  // zakładając że ścieżki, chronione są zaczynające się od /dashboard
  const isDashboardRoute = to.path.startsWith('/dashboard')

  if (isDashboardRoute && !data.session) {
    return navigateTo('/')
  }

  // jak zalogowany user próbuje wbić na główną stronę /, to przeniesie go na dashboard
  const isLanding = to.path === '/'
  if (isLanding && data.session) {
    return navigateTo('/dashboard')
  }
})
*/



/* v2
import { defineNuxtRouteMiddleware, navigateTo } from '#imports'
import { useSupabaseClient } from '#supabase'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const supabase = useSupabaseClient()
  const { data } = await supabase.auth.getSession()

  const isDashboardRoute = to.path.startsWith('/dashboard')
  if (isDashboardRoute && !data.session) {
    return navigateTo('/')
  }

  const isLanding = to.path === '/'
  if (isLanding && data.session) {
    return navigateTo('/dashboard')
  }
})
*/


/* v3
import { defineNuxtRouteMiddleware, navigateTo } from '#imports'
import { useSupabaseClient } from '#supabase'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const supabase = useSupabaseClient()
  const { data } = await supabase.auth.getSession()

  const isDashboardRoute = to.path.startsWith('/dashboard')
  if (isDashboardRoute && !data.session) {
    return navigateTo('/')
  }

  const isLanding = to.path === '/'
  if (isLanding && data.session) {
    return navigateTo('/dashboard')
  }
})

*/
/*

// Przykład w middleware auth.global.ts:
import { defineNuxtRouteMiddleware, navigateTo } from '#imports'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { supabase } = useNuxtApp().$supabase ? useNuxtApp().$supabase : {} 
  // Lub, lepiej, korzystaj z własnego helpera:
  const client = useSupabaseClient() // jeśli masz zdefiniowany taki helper w module, 
  // jednak w naszym rozwiązaniu warto używać:
  const supabaseClient = useNuxtApp().$supabase

  const { data } = await supabaseClient.auth.getSession()

  const isDashboardRoute = to.path.startsWith('/dashboard')
  if (isDashboardRoute && !data.session) {
    return navigateTo('/')
  }

  const isLanding = to.path === '/'
  if (isLanding && data.session) {
    return navigateTo('/dashboard')
  }
})

*/

import { defineNuxtRouteMiddleware, navigateTo } from '#imports'
import { useNuxtApp } from '#app'

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Konwertujemy wynik useNuxtApp() na unknown, a potem na obiekt z $supabase
  const nuxtApp = useNuxtApp() as unknown as { $supabase: any }
  const supabaseClient = nuxtApp.$supabase

  if (!supabaseClient) {
    console.error("Supabase client not found in nuxtApp.");
    return;
  }

  const { data } = await supabaseClient.auth.getSession()

  const isDashboardRoute = to.path.startsWith('/dashboard')
  if (isDashboardRoute && !data.session) {
    return navigateTo('/')
  }

  const isLanding = to.path === '/'
  if (isLanding && data.session) {
    return navigateTo('/dashboard')
  }
})
