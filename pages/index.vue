<template>
  <!-- Zewnętrzny kontener na całe tło -->
  <div class="min-h-screen bg-gray-800 flex items-center justify-center p-12"> <!-- Zwiększony padding kontenera -->
    <!-- Kafelki w jednym kontenerze, z zaokrąglonymi rogami i cieniem -->
    <div class="flex flex-row w-full max-w-5xl overflow-hidden rounded-lg shadow-lg"> <!-- Zwiększona maksymalna szerokość -->
      <!-- Lewy kafelek -->
      <div class="w-1/2 bg-gray-700 p-12 flex flex-col items-center justify-center"> <!-- Zwiększony padding kafelka -->
        <h2 class="text-3xl font-bold mb-6 text-white">Witaj na sekcji gitarowej!</h2>
        <p class="text-gray-200 mb-6 text-center">
          Razem rozwijamy swoje umiejętności gry na gitarze
          i dobrze się bawimy!
        </p>

        <!-- Miejsce na gif gitary -->
        <img src="https://media.tenor.com/mRz7Tl7_Es8AAAAi/guitar-playing-guitar.gif" alt="Playing Guitar" class="w-full h-auto"> <!--GIF z grającym ludkiem-->

      </div>

      <!-- Prawy kafelek (logowanie) -->
      <div class="w-1/2 bg-gray-900 p-12 flex flex-col items-center justify-center"> <!-- Zwiększony padding kafelka -->
        <h2 class="text-2xl font-bold mb-8 text-white">Logowanie</h2>

        <!-- E-mail -->
        <div class="mb-6 w-2/3"> <!-- Zwiększony margines -->
          <label class="block mb-2 font-semibold text-gray-200" for="email">Email</label>
          <input
            v-model="email"
            type="email"
            id="email"
            class="w-full p-3 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring"
            placeholder="Wpisz swój email"
          />
        </div>

        <!-- Hasło -->
        <div class="mb-8 w-2/3"> <!-- Zwiększony margines -->
          <label class="block mb-2 font-semibold text-gray-200" for="password">Hasło</label>
          <input
            v-model="password"
            type="password"
            id="password"
            class="w-full p-3 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring"
            placeholder="Wpisz swoje hasło"
          />
        </div>

        <!-- Przyciski ZALOGUJ / REJESTRACJA -->
        <div class="flex gap-6 mb-14"> <!-- Zwiększony margines -->
          <button
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
            @click="handleLogin"
          >
            Zaloguj
          </button>

          <button
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
            @click="goToRegister"
          >
            Rejestracja
          </button>
        </div>

        <!-- Przykład logowania przez Discord -->
        <div class="text-sm text-gray-400 w-2/3 flex justify-center">
          <button
            class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500 flex items-center"
            @click="loginWithDiscord"
          >
            <i class="fab fa-discord fa-2x text-white mr-2"></i> Zaloguj przez Discord
          </button>
        </div>

      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref } from 'vue'
import { useNuxtApp } from '#app'
import { useHead } from '#app'
import { useUserRole } from '~/composables/useUserRole'

useHead({
  link: [
    { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css' }
  ]
})

definePageMeta({
  layout: 'guest'
})

const email = ref('')
const password = ref('')

const { $supabase } = useNuxtApp()
const userRole = useUserRole()

async function handleLogin() {
  try {
    const { data: loginData, error } = await $supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    if (error) {
      alert('Błąd logowania: ' + error.message)
      return
    }

    if (loginData.user) {
      const userId = loginData.user.id

      const { data: profileData, error: profileError } = await $supabase
        .from('profiles')
        .select('role')
        .eq('user_id', userId)
        .single()

      if (profileError) {
        console.error('Błąd pobierania roli:', profileError)
        // Możesz zdecydować, czy przerwać, czy kontynuować
        // W tym przykładzie ustawimy rolę jako null
        userRole.value = null
      } else {
        // Ustaw globalną rolę
        userRole.value = profileData.role // np. 'uczestnik'
      }
    }

    navigateTo('/dashboard')
  } catch (err) {
    alert('Wystąpił nieoczekiwany błąd.')
    console.error(err)
  }
}

async function loginWithDiscord() {
  try {
    const { data, error } = await $supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: 'http://localhost:3000/dashboard',
      }
    })
    if (error) {
      alert('Błąd logowania z Discord: ' + error.message)
    }
  } catch (err) {
    alert('Wystąpił nieoczekiwany błąd.')
    console.error(err)
  }
}

function goToRegister() {
  navigateTo('/register')
}
</script>

