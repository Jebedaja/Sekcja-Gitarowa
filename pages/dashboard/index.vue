<template>
  <div class="flex flex-col items-center w-full bg-gray-800 min-h-screen"> <!-- Dodanie min-h-screen dla pełnego pokrycia wysokości -->
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

        <NuxtLink 
          to="/dashboard/files" 
          class="p-6 bg-gray-700 hover:bg-gray-600 shadow rounded hover:shadow-lg flex flex-col justify-center items-center text-white transition-colors duration-200"
        >
          <span class="text-xl font-semibold mb-2">Pliki</span>
          <span class="text-gray-300">Wspólny dysk sekcji</span>
        </NuxtLink>

        <NuxtLink 
          to="/dashboard/testalpha" 
          class="p-6 bg-gray-700 hover:bg-gray-600 shadow rounded hover:shadow-lg flex flex-col justify-center items-center text-white transition-colors duration-200"
        >
          <span class="text-xl font-semibold mb-2">Alpha test</span>
          <span class="text-gray-300">Wspólny dysk sekcji</span>
        </NuxtLink>

        
        
        <!-- Reszta kafelków... -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports'

definePageMeta({
  layout: 'default' // tutaj mamy nav-bar
})
</script>
