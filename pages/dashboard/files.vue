<template>
  <div class="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
    <h2 class="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 text-center">Wspólny Dysk</h2>

    <!-- Formularz do wrzucania pliku -->
    <form @submit.prevent="uploadFile" class="bg-white p-6 rounded-lg shadow-lg mb-8 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
      <label class="block text-lg font-semibold text-gray-700 flex-shrink-0">Wybierz plik do wrzucenia:</label>
      <input type="file" ref="fileInput" class="block w-full text-sm text-gray-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-full file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-blue-50 file:text-blue-700
                                                hover:file:bg-blue-100" />

      <button type="submit" class="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700
                                  transition duration-300 ease-in-out transform hover:scale-105 shadow-md">
        Wyślij
      </button>
    </form>

    <!-- Lista plików -->
    <div v-if="filesList.length">
      <h3 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 text-center">Dostępne pliki:</h3>
      <ul class="space-y-4">
        <li v-for="file in filesList" :key="file.name"
            class="bg-white p-4 rounded-lg shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between
                   hover:shadow-lg transition duration-300 ease-in-out border border-gray-200">
          <span class="font-medium text-lg text-gray-800 break-words w-full sm:w-auto sm:flex-grow mb-2 sm:mb-0 pr-4">{{ file.name }}</span>
          <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <a
              v-if="file.publicUrl"
              :href="file.publicUrl"
              target="_blank"
              class="inline-flex items-center justify-center px-4 py-2 text-blue-600 border border-blue-600 rounded-md
                     hover:bg-blue-50 transition duration-300 ease-in-out text-sm font-medium"
            >
              Otwórz
            </a>
            <button
              v-if="canDelete"
              @click="deleteFile(file.name)"
              class="inline-flex items-center justify-center bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600
                     transition duration-300 ease-in-out text-sm font-medium"
            >
              Usuń
            </button>
          </div>
        </li>
      </ul>
    </div>
    <p v-else class="text-gray-500 text-center text-lg py-8">Brak plików</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useNuxtApp } from '#app'

// Określ layout, np. default, żeby mieć navbar
definePageMeta({
  layout: 'default'
})

const { $supabase } = useNuxtApp()

// Referencja do input type="file"
const fileInput = ref<HTMLInputElement | null>(null)

// Tablica z informacjami o plikach (nazwa, publicUrl)
const filesList = ref<{ name: string; publicUrl?: string }[]>([])

// Ustal nazwę bucketu taką, jak w Supabase
const BUCKET_NAME = 'guitar-files'

// Czy użytkownik ma prawo usuwać pliki
// Możesz oprzeć to np. na roli z bazy, tutaj na sztywno true/false
const userRole = ref<'uczestnik' | 'user'>('uczestnik') // Przykład
const canDelete = computed(() => userRole.value === 'uczestnik')

/**
 * Funkcja: upload pliku do Supabase
 */
async function uploadFile() {
  if (!fileInput.value?.files?.[0]) {
    alert('Wybierz najpierw plik')
    return
  }
  const file = fileInput.value.files[0]

  try {
    // 1) Zbuduj ścieżkę w bucket (np. 'nazwa-pliku' lub foldery + nazwa)
    const filePath = `${Date.now()}-${file.name}`

    // 2) Wyślij plik do supabase storage
    // upload: (bucket, path, file)
    const { data, error } = await $supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file)

    if (error) {
      console.error(error)
      alert('Błąd przy uploadzie: ' + error.message)
      return
    }

    // Sukces, odśwież listę plików
    alert('Plik przesłany pomyślnie!')
    getFiles()
  } catch (err) {
    console.error(err)
    alert('Błąd przy uploadzie.')
  } finally {
    // Wyczyść input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

/**
 * Funkcja: pobiera listę plików z bucketu
 */
async function getFiles() {
  try {
    // 1) Zdobądź listę plików z supabase
    const { data, error } = await $supabase
      .storage
      .from(BUCKET_NAME)
      .list('', { limit: 100 }) // '' oznacza brak folderu (root)
    if (error) {
      console.error(error)
      return
    }

    // 2) Dla każdego pliku pobierz publicUrl (o ile bucket jest public)
    //    lub generuj signed url, jeśli bucket jest prywatny
    const result = data?.map(file => {
      const publicUrl = $supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(file.name)
        .data.publicUrl

        console.log('file url', publicUrl)
      return {
        name: file.name,
        publicUrl
      }
    }) ?? []

    filesList.value = result
  } catch (err) {
    console.error(err)
  }
}

/**
 * Funkcja: usuwa plik z bucketu
 */
async function deleteFile(fileName: string) {
  // UWAGA: Nie używaj `confirm()` w aplikacji, która ma być uruchamiana w Canvas.
  // Zastąp to niestandardowym modalem potwierdzenia dla lepszego UX.
  if (!confirm(`Na pewno usunąć plik ${fileName}?`)) return

  const { data, error } = await $supabase
    .storage
    .from(BUCKET_NAME)
    .remove([fileName])

  if (error) {
    alert('Błąd usuwania: ' + error.message)
    return
  }

  alert(`Plik ${fileName} usunięty.`)
  getFiles()
}

// Po załadowaniu komponentu pobierz listę plików
onMounted(() => {
  getFiles()
})
</script>

<style scoped>
/* Możesz dodać tutaj niestandardowe style CSS, jeśli Tailwind nie wystarczy */
/* Na przykład, jeśli chcesz niestandardowe ikony dla plików, albo bardziej złożone efekty */
</style>
