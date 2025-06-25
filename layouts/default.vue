<template>
  <div class="min-h-screen flex flex-col bg-gray-800">
    <!-- Navbar -->
    <header class="bg-gray-900 shadow p-4 flex flex-wrap items-center justify-between w-full text-white
                   sm:px-6 md:px-8 lg:px-16"> <!-- Zmieniono stały px-80 na responsywny padding -->
      
      <!-- Lewa strona linków -->
      <div class="flex-none sm:flex-1 flex gap-4 mb-2 sm:mb-0 w-full sm:w-auto justify-center sm:justify-start">
        <NuxtLink to="/dashboard" class="text-white hover:text-gray-300 px-3 py-1 rounded-md">Dashboard</NuxtLink>
        <NuxtLink to="/news" class="text-white hover:text-gray-300 px-3 py-1 rounded-md">Aktualności</NuxtLink>
      </div>

      <!-- Centralny napis -->
      <h1 class="flex-none text-2xl font-bold text-center text-white mb-2 sm:mb-0 w-full sm:w-auto">Sekcja Gitarowa</h1>

      <!-- Prawa strona: wylogowanie -->
      <div class="flex-none sm:flex-1 flex justify-center sm:justify-end w-full sm:w-auto">
        <button
          @click="handleLogout"
          class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
        >
          Wyloguj
        </button>
      </div>
    </header>

    <!-- Główna treść stron -->
    <main class="flex-1 p-6 bg-gray-700 text-white">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useNuxtApp } from '#app'
import { navigateTo } from '#imports' // Upewnij się, że navigateTo jest importowane

const { $supabase } = useNuxtApp()

async function handleLogout() {
  await $supabase.auth.signOut()
  navigateTo('/')
}
</script>
