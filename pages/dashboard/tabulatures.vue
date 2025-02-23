<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Tabulatury - Podgląd i Odtwarzanie</h1>

    <!-- Input do wczytania pliku z dysku -->
    <div class="mb-4">
      <label class="block mb-2 font-semibold">Wybierz plik (.gp3, .gp4, .gp5):</label>
      <input type="file" accept=".gp3,.gp4,.gp5,.gpx" @change="handleFileSelect" />
    </div>

    <!-- Miejsce na przyciski sterujące -->
    <div class="mb-4 flex gap-4" v-if="api">
      <button @click="playPause" class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-400">Play/Pause</button>
      <button @click="stop" class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-400">Stop</button>
    </div>

    <!-- Kontener AlphaTab -->
    <div ref="element" class="border border-gray-300 p-2"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { AlphaTabApi, Settings } from '@coderline/alphatab';

// Referencja do elementu DOM
const element = ref<HTMLElement | null>(null);
const api = ref<AlphaTabApi | null>(null);

// Funkcja inicjalizująca AlphaTab
function initAlphaTab() {
  if (!element.value) {
    console.error('Element ref is not attached to DOM.');
    return;
  }

  api.value = new AlphaTabApi(element.value, {
    core: {
      file: null, // Domyślnie brak pliku
      fontDirectory: 'https://cdn.jsdelivr.net/npm/@coderline/alphatab@1.3.1/dist/font/',
    },
    player: {
      enablePlayer: true,
      enableCursor: true,
      enableUserInteraction: true,
      soundFont: 'https://cdn.jsdelivr.net/npm/@coderline/alphatab@1.3.1/dist/soundfont/sonivox.sf2',
    },
  });

  console.log('AlphaTabApi initialized:', api.value);

  // Podłącz zdarzenia
  api.value.scoreLoaded.on(() => {
    console.log('Nowa tabulatura została załadowana.');
  });

  api.value.renderFinished.on(() => {
    console.log('Renderowanie tabulatury zakończone.');
  });
}

// Funkcja obsługi wyboru pliku
async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) {
    return;
  }
  const file = input.files[0];
  console.log('Wybrano plik:', file.name);

  // Odczytaj plik w formie ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();

  // Przekaż plik do AlphaTab API
  if (api.value) {
    try {
      api.value.load({
        data: arrayBuffer,
        dataType: 'binary',
      });

      console.log('Tabulatura została załadowana.');
    } catch (error) {
      console.error('Błąd ładowania tabulatury:', error);
    }
  } else {
    console.error('AlphaTab API nie jest zainicjowane.');
  }
}

// Sterowanie odtwarzaniem
function playPause() {
  if (api.value) {
    api.value.playPause();
  }
}

function stop() {
  if (api.value) {
    api.value.stop();
  }
}

// Lifecycle hooks
onMounted(() => {
  initAlphaTab();
});

onUnmounted(() => {
  api.value?.destroy();
  api.value = null;
});
</script>

<style scoped>
/* Stylowanie kontenera */
</style>
