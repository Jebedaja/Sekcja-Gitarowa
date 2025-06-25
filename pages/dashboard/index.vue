<template>
  <div class="flex flex-col items-center w-full bg-gray-800 min-h-screen">
    <!-- Kontener na treść z marginesami i maksymalną szerokością -->
    <div class="w-full max-w-6xl mx-auto px-4">
      <!-- Tytuł wyśrodkowany na stronie -->
      <h2 class="text-3xl font-bold mt-12 mb-6 text-white text-center">Dashboard</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
        <!-- Kafelek 1: Zadania -->
        <NuxtLink 
          to="/dashboard/tasks"
          class="p-6 bg-gray-700 hover:bg-gray-600 shadow rounded hover:shadow-lg flex flex-col justify-center items-center text-white transition-colors duration-200"
        >
          <span class="text-xl font-semibold mb-2">Zadania Domowe</span>
          <span class="text-gray-300">Przeglądaj, dodawaj</span>
        </NuxtLink>

        <!-- Kafelek 2: Tabulatury -->
        <NuxtLink 
          to="/dashboard/tabulatures" 
          class="p-6 bg-gray-700 hover:bg-gray-600 shadow rounded hover:shadow-lg flex flex-col justify-center items-center text-white transition-colors duration-200"
        >
          <span class="text-xl font-semibold mb-2">Tabulatury</span>
          <span class="text-gray-300">Przeglądaj i udostępniaj tabulatury</span>
        </NuxtLink>

        <!-- Kafelek 3: Kalendarz -->
        <NuxtLink 
          to="/dashboard/calendar" 
          class="p-6 bg-gray-700 hover:bg-gray-600 shadow rounded hover:shadow-lg flex flex-col justify-center items-center text-white transition-colors duration-200"
        >
          <span class="text-xl font-semibold mb-2">Kalendarz</span>
          <span class="text-gray-300">Nadchodzące spotkania i terminy</span>
        </NuxtLink>

        <!-- Kafelek 4: Pliki -->
        <NuxtLink 
          to="/dashboard/files" 
          class="p-6 bg-gray-700 hover:bg-gray-600 shadow rounded hover:shadow-lg flex flex-col justify-center items-center text-white transition-colors duration-200"
        >
          <span class="text-xl font-semibold mb-2">Pliki</span>
          <span class="text-gray-300">Wspólny dysk sekcji</span>
        </NuxtLink>

        <!-- Kafelek 5: Alpha test (jeśli nadal potrzebny) -->
        <NuxtLink 
          to="/dashboard/testalpha" 
          class="p-6 bg-gray-700 hover:bg-gray-600 shadow rounded hover:shadow-lg flex flex-col justify-center items-center text-white transition-colors duration-200"
        >
          <span class="text-xl font-semibold mb-2">Alpha test</span>
          <span class="text-gray-300">Testowanie AlphaTab</span>
        </NuxtLink>

        <!-- KAFEELEK: Metronom -->
        <NuxtLink 
          to="/dashboard/metronome" 
          class="p-6 bg-blue-600 hover:bg-blue-500 shadow rounded hover:shadow-lg flex flex-col justify-center items-center text-white transition-colors duration-200"
        >
          <span class="text-2xl mb-2">🎵</span> <!-- Ikona metronomu -->
          <span class="text-xl font-semibold mb-2">Metronom</span>
          <span class="text-gray-200">Ustaw tempo do ćwiczeń</span>
        </NuxtLink>
        
        <!-- kafelek Stroika -->
        <NuxtLink 
          to="/dashboard/tuner" 
          class="p-6 bg-green-600 hover:bg-green-500 shadow rounded hover:shadow-lg flex flex-col justify-center items-center text-white transition-colors duration-200"
        >
          <span class="text-2xl mb-2">🎸</span> <!-- Ikona gitary/stroika -->
          <span class="text-xl font-semibold mb-2">Stroik Gitarowy</span>
          <span class="text-gray-200">Precyzyjne strojenie instrumentu</span>
        </NuxtLink>

        <NuxtLink 
          v-if="userRole === 'admin'"
          to="/dashboard/user_management" 
          class="p-6 bg-purple-600 hover:bg-purple-500 shadow rounded hover:shadow-lg flex flex-col justify-center items-center text-white transition-colors duration-200"
        >
          <span class="text-2xl mb-2">⚙️</span> <span class="text-xl font-semibold mb-2">Zarządzanie Użytkownikami</span>
          <span class="text-gray-200">Panel administracyjny</span>
        </NuxtLink>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports'
import { useUserRole } from '~/composables/useUserRole'

definePageMeta({
  layout: 'default' // tutaj mamy nav-bar
})

const userRole = useUserRole();
</script>
