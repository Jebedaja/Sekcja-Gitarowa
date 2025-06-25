<template>
  <div class="flex flex-col items-center w-full bg-gray-800 min-h-screen p-4 sm:p-6 lg:p-8">
    <!-- Kontener na treść z marginesami i maksymalną szerokością -->
    <div class="w-full max-w-6xl mx-auto px-4">
      <!-- Tytuł wyśrodkowany na stronie -->
      <h2 class="text-3xl sm:text-4xl font-extrabold mt-8 mb-6 text-white text-center">Dashboard</h2>
      
      <!-- Siatka kafelków -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
        <!-- Szablon dla każdego kafelka: -->
        <!-- class="p-6 shadow rounded-lg flex flex-col justify-center items-center text-white 
                   transition-colors duration-200 aspect-square" -->
        <!-- "aspect-square" sprawi, że kafelki będą kwadratowe, utrzymując ten sam rozmiar -->
        <!-- Kolory i hover są dostosowane indywidualnie -->

        <!-- Kafelek 1: Zadania Domowe -->
        <NuxtLink 
          to="/dashboard/tasks"
          class="p-6 bg-yellow-600 hover:bg-yellow-500 shadow rounded-lg flex flex-col justify-center items-center text-white 
                 transition-colors duration-200 aspect-square"
        >
          <span class="text-3xl mb-2">📋</span> <!-- Emotikona listy/zadań -->
          <span class="text-xl font-semibold mb-2 text-center">Zadania Domowe</span>
          <span class="text-gray-200 text-sm text-center">Przeglądaj, dodawaj i zarządzaj</span>
        </NuxtLink>

        <!-- Kafelek 2: Tabulatury -->
        <NuxtLink 
          to="/dashboard/tabulatures" 
          class="p-6 bg-red-600 hover:bg-red-500 shadow rounded-lg flex flex-col justify-center items-center text-white 
                 transition-colors duration-200 aspect-square"
        >
          <span class="text-3xl mb-2">🎶</span> <!-- Emotikona nut/muzyki -->
          <span class="text-xl font-semibold mb-2 text-center">Tabulatury</span>
          <span class="text-gray-200 text-sm text-center">Przeglądaj i udostępniaj</span>
        </NuxtLink>

        <!-- Kafelek 3: Kalendarz -->
        <NuxtLink 
          to="/dashboard/calendar" 
          class="p-6 bg-purple-600 hover:bg-purple-500 shadow rounded-lg flex flex-col justify-center items-center text-white 
                 transition-colors duration-200 aspect-square"
        >
          <span class="text-3xl mb-2">🗓️</span> <!-- Emotikona kalendarza -->
          <span class="text-xl font-semibold mb-2 text-center">Kalendarz</span>
          <span class="text-gray-200 text-sm text-center">Nadchodzące spotkania i terminy</span>
        </NuxtLink>

        <!-- Kafelek 4: Pliki -->
        <NuxtLink 
          to="/dashboard/files" 
          class="p-6 bg-teal-600 hover:bg-teal-500 shadow rounded-lg flex flex-col justify-center items-center text-white 
                 transition-colors duration-200 aspect-square"
        >
          <span class="text-3xl mb-2">📁</span> <!-- Emotikona folderu/plików -->
          <span class="text-xl font-semibold mb-2 text-center">Pliki</span>
          <span class="text-gray-200 text-sm text-center">Wspólna przestrzeń dyskowa</span>
        </NuxtLink>

        <!-- Kafelek 5: Alpha test -->
        <!-- Ten kafelek zostawiam z szarym tłem, bo jest to testowy, a nie główna funkcjonalność -->
        <NuxtLink 
          to="/dashboard/testalpha" 
          class="p-6 bg-gray-700 hover:bg-gray-600 shadow rounded-lg flex flex-col justify-center items-center text-white 
                 transition-colors duration-200 aspect-square"
        >
          <span class="text-3xl mb-2">🧪</span> <!-- Emotikona probówki/testu -->
          <span class="text-xl font-semibold mb-2 text-center">Alpha Test</span>
          <span class="text-gray-300 text-sm text-center">Funkcjonalności w trakcie rozwoju</span>
        </NuxtLink>

        <!-- KAFEELEK: Metronom -->
        <NuxtLink 
          to="/dashboard/metronome" 
          class="p-6 bg-blue-600 hover:bg-blue-500 shadow rounded-lg flex flex-col justify-center items-center text-white 
                 transition-colors duration-200 aspect-square"
        >
          <span class="text-3xl mb-2">🥁</span> <!-- Emotikona bębna/metronomu -->
          <span class="text-xl font-semibold mb-2 text-center">Metronom</span>
          <span class="text-gray-200 text-sm text-center">Ustaw tempo do ćwiczeń</span>
        </NuxtLink>
        
        <!-- kafelek Stroika -->
        <NuxtLink 
          to="/dashboard/tuner" 
          class="p-6 bg-green-600 hover:bg-green-500 shadow rounded-lg flex flex-col justify-center items-center text-white 
                 transition-colors duration-200 aspect-square"
        >
          <span class="text-3xl mb-2">🎸</span> <!-- Emotikona gitary -->
          <span class="text-xl font-semibold mb-2 text-center">Stroik Gitarowy</span>
          <span class="text-gray-200 text-sm text-center">Precyzyjne strojenie instrumentu</span>
        </NuxtLink>

        <!-- Kafelek: Zarządzanie Użytkownikami (tylko dla adminów) -->
        <NuxtLink 
          v-if="userRole === 'admin'"
          to="/dashboard/user-management" 
          class="p-6 bg-indigo-600 hover:bg-indigo-500 shadow rounded-lg flex flex-col justify-center items-center text-white 
                 transition-colors duration-200 aspect-square"
        >
          <span class="text-3xl mb-2">🔑</span> <!-- Emotikona klucza/zarządzania -->
          <span class="text-xl font-semibold mb-2 text-center">Zarządzanie Użytkownikami</span>
          <span class="text-gray-200 text-sm text-center">Panel administracyjny</span>
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
