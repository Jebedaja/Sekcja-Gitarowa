<!-- DO USUNIĘCIA -->

<template>
    <div class="max-w-md mx-auto mt-16 p-4 border rounded">
      <h2 class="text-2xl font-bold text-center mb-6">Logowanie</h2>
      
      <!-- Pole e-mail -->
      <div class="mb-4">
        <label class="block mb-2 font-semibold text-gray-700" for="email">Email</label>
        <input
          v-model="email"
          type="email"
          id="email"
          class="w-full p-2 border rounded focus:outline-none focus:ring"
          placeholder="Wpisz swój email"
        />
      </div>
  
      <!-- Pole hasło -->
      <div class="mb-4">
        <label class="block mb-2 font-semibold text-gray-700" for="password">Hasło</label>
        <input
          v-model="password"
          type="password"
          id="password"
          class="w-full p-2 border rounded focus:outline-none focus:ring"
          placeholder="Wpisz swoje hasło"
        />
      </div>
  
      <button
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
        @click="handleLogin"
      >
        Zaloguj
      </button>
  
      <!-- Możesz tu dać np. link do /register, jeśli ktoś nie ma konta -->
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import { useNuxtApp } from '#app'
  
  const email = ref('')
  const password = ref('')
  
  const { $supabase } = useNuxtApp()
  
  async function handleLogin() {
    try {
      const { data, error } = await $supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      })
  
      if (error) {
        // Obsłuż błąd logowania (np. nieprawidłowe dane)
        alert('Błąd logowania: ' + error.message)
      } else {
        // Zalogowano poprawnie
        alert('Zalogowano użytkownika: ' + data.user?.email)
        // Przekierowanie na dashboard
        navigateTo('/dashboard')
      }
    } catch (err) {
      alert('Wystąpił nieoczekiwany błąd.')
      console.error(err)
    }
  }
  </script>
  