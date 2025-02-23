<template>
  <div class="min-h-screen flex flex-col bg-gray-800">
    <!-- Navbar -->
    <header class="bg-gray-900 shadow p-4 flex items-center w-full px-80 text-white">
      <!-- Lewa strona linków -->
      <div class="flex-1 flex gap-4">
        <NuxtLink to="/dashboard" class="text-white hover:text-gray-300">Dashboard</NuxtLink>
        <NuxtLink to="/news" class="text-white hover:text-gray-300">Aktualności</NuxtLink>
      </div>

      <!-- Centralny napis -->
      <h1 class="flex-1 text-2xl font-bold text-center text-white">Sekcja Gitarowa</h1>

      <!-- Prawa strona: wylogowanie -->
      <div class="flex-1 flex justify-end">
        <button
          @click="handleLogout"
          class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
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

const { $supabase } = useNuxtApp()

async function handleLogout() {
  await $supabase.auth.signOut()
  navigateTo('/')
}
</script>
