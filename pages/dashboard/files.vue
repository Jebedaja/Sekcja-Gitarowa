<template>
    <div>
      <h2 class="text-2xl font-bold mb-4">Wspólna przestrzeń plików</h2>
  
      <!-- Formularz do wrzucania pliku -->
      <form @submit.prevent="uploadFile" class="mb-6">
        <label class="block mb-2 font-semibold">Wybierz plik do wrzucenia:</label>
        <input type="file" ref="fileInput" class="mb-4" />
  
        <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500">
          Wyślij
        </button>
      </form>
  
      <!-- Lista plików -->
      <div v-if="filesList.length">
        <h3 class="text-xl font-semibold mb-2">Dostępne pliki:</h3>
        <ul class="space-y-2">
          <li v-for="file in filesList" :key="file.name" class="flex items-center justify-between">
            <span>{{ file.name }}</span>
            <div class="flex gap-2">
              <a
                v-if="file.publicUrl"
                :href="file.publicUrl"
                target="_blank"
                class="text-blue-600 underline"
              >
                Otwórz
              </a>
              <button
                v-if="canDelete"
                @click="deleteFile(file.name)"
                class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-400"
              >
                Usuń
              </button>
            </div>
          </li>
        </ul>
      </div>
      <p v-else class="text-gray-500">Brak plików</p>
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
  const userRole = ref<'uczestnik' | 'user'>('uczestnik')  // Przykład
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
  