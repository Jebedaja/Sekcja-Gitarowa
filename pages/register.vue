<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <div class="w-full max-w-md p-6 bg-white rounded shadow">
      <h2 class="text-2xl font-bold text-center mb-6">Rejestracja</h2>
      
      <div class="mb-4">
        <label class="block mb-1 font-semibold text-gray-700" for="email">Email</label>
        <input
          v-model="email"
          type="email"
          id="email"
          class="w-full p-2 border rounded focus:outline-none focus:ring"
          placeholder="Twój email"
        />
      </div>

      <div class="mb-4">
        <label class="block mb-1 font-semibold text-gray-700" for="password">Hasło</label>
        <input
          v-model="password"
          type="password"
          id="password"
          class="w-full p-2 border rounded focus:outline-none focus:ring"
          placeholder="Hasło"
        />
      </div>

      <button
        class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500 w-full"
        @click="handleRegister"
      >
        Zarejestruj
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useNuxtApp } from '#app'

definePageMeta({
  layout: 'guest' // Jesteśmy niezalogowani, używamy layoutu "guest"
})

const email = ref('')
const password = ref('')

const { $supabase } = useNuxtApp()

async function handleRegister() {
  try {
    // 1) Rejestracja w Supabase (auth.users)
    const { data, error } = await $supabase.auth.signUp({
      email: email.value,
      password: password.value
    })

    if (error) {
      alert('Błąd rejestracji: ' + error.message)
      return
    }

    // 2) Jeśli użytkownik został utworzony, dopisz wpis w tabeli profiles
    if (data.user) {
      const userId = data.user.id
      // Domyślna rola to 'uczestnik'
      const { error: insertError } = await $supabase
        .from('profiles')
        .insert([
          {
            user_id: userId,
            role: 'uczestnik'
          }
        ])
      if (insertError) {
        console.error('Błąd tworzenia profilu:', insertError)
        // Możesz wyświetlić alert lub pominąć
      }
    }

    // 3) Komunikat o konieczności potwierdzenia maila
    alert('Konto utworzone! Sprawdź mail i potwierdź rejestrację.')

    // 4) Przeniesienie usera na landing page
    navigateTo('/')
  } catch (err) {
    alert('Wystąpił nieoczekiwany błąd.')
    console.error(err)
  }
}
</script>
