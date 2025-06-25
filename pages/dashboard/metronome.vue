<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
    <h1 class="text-4xl font-extrabold text-gray-900 mb-8">Metronom</h1>

    <div class="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center space-y-6">
      <!-- Wyświetlanie BPM -->
      <div class="text-6xl font-bold text-blue-600 mb-4">{{ bpm }}</div>

      <!-- Suwak do ustawiania BPM -->
      <div>
        <label for="bpm-slider" class="block text-lg font-semibold text-gray-700 mb-2">Ustaw Tempo (BPM)</label>
        <input
          id="bpm-slider"
          type="range"
          min="40"
          max="240"
          v-model.number="bpm"
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-thumb-blue"
          @input="updateBpm"
        />
      </div>

      <!-- Przyciski +/- dla BPM -->
      <div class="flex justify-center space-x-4">
        <button @click="adjustBpm(-5)" class="text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition duration-200">-5</button>
        <button @click="adjustBpm(5)" class="text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition duration-200">+5</button>
      </div>

      <!-- Przycisk Start/Stop -->
      <button
        @click="toggleMetronome"
        :class="[
          'w-full py-4 rounded-xl text-xl font-bold transition duration-300 ease-in-out transform hover:scale-105 shadow-lg',
          isPlaying ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
        ]"
      >
        {{ isPlaying ? 'Stop' : 'Start' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import * as Tone from 'tone'; // Importujemy całą bibliotekę Tone.js

// Definiujemy layout dla strony
definePageMeta({
  layout: 'default'
});

const bpm = ref(120); // Aktualne tempo w BPM
const isPlaying = ref(false); // Stan odtwarzania metronomu

// Zmienne dla obiektów Tone.js
let clickSynth: Tone.MembraneSynth | null = null;
let metronomeLoop: Tone.Loop | null = null;

// Funkcja inicjalizująca Tone.js
const initTone = async () => {
  if (!clickSynth) {
    // Tworzymy prosty syntezator perkusyjny dla dźwięku kliknięcia
    clickSynth = new Tone.MembraneSynth().toDestination();
    clickSynth.volume.value = -10; // Lekkie zmniejszenie głośności

    // Tworzymy pętlę metronomu
    // Tone.Loop wywołuje callback w określonych odstępach czasu
    metronomeLoop = new Tone.Loop(time => {
      // Gramy dźwięk kliknięcia
      if (clickSynth) {
        clickSynth.triggerAttackRelease('E4', '6n', time); // 'C4' to wysokość, '8n' to czas trwania
      }
    }, '4n'); // '4n' oznacza, że pętla będzie wywoływana co ćwierćnutę (czyli na każdy beat)

    // Ustawiamy początkowe BPM dla transportu Tone.js
    Tone.Transport.bpm.value = bpm.value;
    Tone.Transport.loop = true; // Ustawiamy, aby transport zapętlał się
    Tone.Transport.loopEnd = '1m'; // Długość pętli, np. 1 minuta (można dostosować)

    // Startujemy pętlę, ale nie transport jeszcze (dopiero po kliknięciu Start)
    metronomeLoop.start(0); 
  }
};

// Funkcja aktualizująca BPM w Tone.js
const updateBpm = () => {
  if (Tone.Transport) {
    Tone.Transport.bpm.value = bpm.value;
  }
};

// Funkcja do dostosowania BPM o daną wartość
const adjustBpm = (delta: number) => {
  let newBpm = bpm.value + delta;
  if (newBpm < 40) newBpm = 40;
  if (newBpm > 240) newBpm = 240;
  bpm.value = newBpm;
  updateBpm();
};

// Funkcja przełączająca metronom (Start/Stop)
const toggleMetronome = async () => {
  // Ważne: Tone.start() inicjalizuje AudioContext, co jest wymagane przez przeglądarki
  // i musi być wywołane po interakcji użytkownika.
  if (Tone.context.state !== 'running') {
    await Tone.start();
    console.log('AudioContext started');
  }

  if (isPlaying.value) {
    // Zatrzymaj metronom
    Tone.Transport.stop();
    isPlaying.value = false;
    console.log('Metronome stopped');
  } else {
    // Rozpocznij metronom
    Tone.Transport.start();
    isPlaying.value = true;
    console.log('Metronome started');
  }
};

// Hook wywoływany po zamontowaniu komponentu
onMounted(async () => {
  await initTone();
});

// Hook wywoływany przed odmontowaniem komponentu
// Ważne do zwolnienia zasobów Tone.js
onUnmounted(() => {
  if (metronomeLoop) {
    metronomeLoop.dispose();
    metronomeLoop = null;
  }
  if (clickSynth) {
    clickSynth.dispose();
    clickSynth = null;
  }
  // Nie zatrzymujemy globalnego Tone.Transport, bo może być używany przez inne komponenty (np. AlphaTab)
  // Tone.Transport.stop(); 
  // Tone.Transport.cancel(); // Anuluje wszystkie zaplanowane zdarzenia
  console.log('Tone.js resources disposed for Metronome component.');
});
</script>

<style scoped>
/* Dodatkowe style dla suwaka, aby pasował do Tailwind */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3B82F6; /* blue-500 */
  cursor: pointer;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.4); /* ring-blue-500 with opacity */
  transition: background .15s ease-in-out, box-shadow .15s ease-in-out;
}

input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3B82F6; /* blue-500 */
  cursor: pointer;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.4); /* ring-blue-500 with opacity */
  transition: background .15s ease-in-out, box-shadow .15s ease-in-out;
}

input[type="range"]:focus::-webkit-slider-thumb {
  background: #2563EB; /* blue-600 */
}

input[type="range"]:focus::-moz-range-thumb {
  background: #2563EB; /* blue-600 */
}
</style>
