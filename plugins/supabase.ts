// plugins/supabase.client.ts
import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  // Rzutuj publiczny runtime config na typ z właściwościami, które faktycznie masz
  const config = useRuntimeConfig().public as unknown as { supabaseUrl: string; supabaseKey: string }
  const supabase = createClient(config.supabaseUrl, config.supabaseKey)
  return {
    provide: {
      supabase
    }
  }
})
