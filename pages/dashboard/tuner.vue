<template>
  <div class="flex flex-col items-center min-h-screen bg-gray-100 p-4 pt-8">
    <h1 class="text-4xl font-extrabold text-gray-900 mb-10">Stroik Gitarowy</h1>

    <div class="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full text-center space-y-6">
      <p v-if="!microphoneAccessGranted" class="text-red-600 font-semibold text-lg">
        Aby użyć stroika, musisz zezwolić na dostęp do mikrofonu.
      </p>
      <p v-else-if="!isListening" class="text-gray-600 font-semibold text-lg">
        Kliknij "Start Stroik", aby rozpocząć nasłuchiwanie.
      </p>

      <div v-else class="space-y-4">
        <!-- Wyświetlanie aktualnie wykrytej nuty -->
        <div class="text-7xl font-bold" :class="noteColorClass">
          {{ currentNote }}
        </div>

        <!-- Wizualny wskaźnik strojenia -->
        <div class="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
          <div
            class="h-full rounded-full absolute transition-all duration-100 ease-linear"
            :class="indicatorColorClass"
            :style="indicatorStyle"
          ></div>
          <div class="absolute inset-y-0 left-1/2 w-0.5 bg-gray-500 transform -translate-x-1/2"></div>
        </div>
        <p class="text-xl font-semibold text-gray-700">
          {{ centsDeviationText }}
        </p>
      </div>

      <!-- Przycisk Start/Stop Stroika -->
      <button
        @click="toggleTuner"
        :class="[
          'w-full py-4 rounded-xl text-xl font-bold transition duration-300 ease-in-out transform hover:scale-105 shadow-lg',
          isListening ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
        ]"
      >
        {{ isListening ? 'Stop Stroik' : 'Start Stroik' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import * as Tone from 'tone';

// Definiujemy layout dla strony
definePageMeta({
  layout: 'default'
});

const microphoneAccessGranted = ref(false);
const isListening = ref(false);
const currentNote = ref('--');
const centsDeviation = ref(0); // Odchylenie w centach od idealnej nuty
const animationFrameId = ref<number | null>(null); // Do kontroli pętli requestAnimationFrame

// Web Audio API obiekty
let audioContext: AudioContext | null = null;
let analyserNode: AnalyserNode | null = null;
let mediaStreamSource: MediaStreamAudioSourceNode | null = null;
let microphoneStream: MediaStream | null = null;
let freqByteData: Uint8Array | null = null;

// Standardowe strojenie gitary (E-A-D-G-B-E) i ich częstotliwości (Hz)
// Oparty na A4 = 440 Hz
const standardTuningNotes = [
  { name: 'E2', frequency: 82.41 },
  { name: 'A2', frequency: 110.00 },
  { name: 'D3', frequency: 146.83 },
  { name: 'G3', frequency: 196.00 },
  { name: 'B3', frequency: 246.94 },
  { name: 'E4', frequency: 329.63 },
];

// Cała skala chromatyczna w oktawie od C1 do C6 (przykładowo, można rozszerzyć)
// Do dokładniejszego wyliczania najbliższej nuty
const noteFrequencies = (function() {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const baseA4 = 440; // Hz
  const noteList: { name: string; frequency: number }[] = [];
  // Obliczamy częstotliwości dla kilku oktaw (np. od C0 do C8)
  for (let octave = 0; octave <= 8; octave++) {
    for (let i = 0; i < notes.length; i++) {
      const n = (octave - 4) * 12 + (i - 9); // Odniesienie do A4 (index 9 w notes array)
      const freq = baseA4 * Math.pow(2, n / 12);
      noteList.push({ name: notes[i] + octave, frequency: freq });
    }
  }
  return noteList;
})();


// Oblicza klasę koloru dla nuty na podstawie odchylenia
const noteColorClass = computed(() => {
  if (Math.abs(centsDeviation.value) <= 5) { // +/- 5 centów to "w stroju"
    return 'text-green-600';
  } else if (centsDeviation.value > 5) {
    return 'text-red-600'; // Za wysoko
  } else {
    return 'text-blue-600'; // Za nisko
  }
});

// Oblicza klasę koloru dla wskaźnika
const indicatorColorClass = computed(() => {
  if (Math.abs(centsDeviation.value) <= 5) {
    return 'bg-green-500';
  } else {
    return 'bg-yellow-400'; // Niestrojone
  }
});

// Oblicza styl dla wskaźnika pozycji
const indicatorStyle = computed(() => {
  // Mapowanie centów (-50 do +50) na pozycję (0% do 100%)
  // Wskaźnik ma 100% szerokości diva
  // 50 centów to półton, więc chcemy skalować to na wskaźniku
  const maxCents = 50; // Zakładamy, że interesuje nas odchylenie do +/- 50 centów
  const normalizedDeviation = Math.min(Math.max(centsDeviation.value, -maxCents), maxCents) / maxCents; // Od -1 do 1

  // Oblicz szerokość i pozycję left.
  // Jeśli jest w stroju (+/- 5 centów), wskaźnik będzie na środku i szerokości 10%.
  // Poza tym, jego środek będzie przesuwał się od lewej do prawej.
  const baseWidth = 10; // procent
  let width = baseWidth;
  let leftPosition = 50 - (width / 2); // Start na środku

  if (Math.abs(centsDeviation.value) > 5) { // Jeśli poza zakresem "w stroju"
    // przesuwamy wskaźnik proporcjonalnie do odchylenia
    // Zakładamy, że 50 centów odchylenia to przesunięcie o około 45% od środka w każdą stronę
    // Czyli normalizedDeviation od -1 do 1, a skala ruchu od -45 do +45
    const moveRange = 45; // Maksymalne przesunięcie w % od centrum
    leftPosition = 50 + (normalizedDeviation * moveRange) - (baseWidth / 2);
  }

  // Upewnij się, że wskaźnik pozostaje w granicach (0-100)
  leftPosition = Math.max(0, Math.min(leftPosition, 100 - baseWidth));

  return {
    width: `${width}%`,
    left: `${leftPosition}%`
  };
});


// Tekst opisujący odchylenie w centach
const centsDeviationText = computed(() => {
  if (Math.abs(centsDeviation.value) <= 5) {
    return `W stroju! (${centsDeviation.value.toFixed(1)} ct)`;
  } else if (centsDeviation.value > 5) {
    return `Za wysoko (${centsDeviation.value.toFixed(1)} ct)`;
  } else {
    return `Za nisko (${centsDeviation.value.toFixed(1)} ct)`;
  }
});

// Funkcja do wykrywania najbliższej nuty i odchylenia w centach
const getNoteAndCents = (frequency: number) => {
  if (frequency === 0) { // Brak dźwięku lub zbyt cichy
    return { noteName: '--', cents: 0 };
  }

  let closestNote = null;
  let minDiff = Infinity;

  // Znajdź najbliższą nutę w całej skali chromatycznej
  for (const note of noteFrequencies) {
    const diff = Math.abs(frequency - note.frequency);
    if (diff < minDiff) {
      minDiff = diff;
      closestNote = note;
    }
  }

  if (closestNote) {
    // Oblicz odchylenie w centach
    // cents = 1200 * log2(wykryta_częstotliwość / idealna_częstotliwość)
    const cents = 1200 * (Math.log(frequency / closestNote.frequency) / Math.log(2));
    return { noteName: closestNote.name, cents: cents };
  }

  return { noteName: '--', cents: 0 };
};


// Główna pętla analizy audio
const analyzeAudio = () => {
  if (!analyserNode || !freqByteData) {
    return;
  }

  // Pobierz dane z AnalyserNode
  analyserNode.getByteFrequencyData(freqByteData); // Zastąpiono getFloatFrequencyData na Byte

  // Prosta detekcja piku częstotliwości
  // Szukamy najsilniejszej częstotliwości w zakresie interesującym gitarę (np. 70Hz - 400Hz)
  let maxVolume = 0;
  let maxFrequency = 0;
  const sampleRate = audioContext!.sampleRate;
  const fftSize = analyserNode.fftSize;
  const frequencyBinWidth = sampleRate / fftSize;

  // Przeszukaj odpowiedni zakres częstotliwości (np. od E2 do E4 gitary)
  // Przeliczamy indeksy tablicy freqByteData na podstawie zakresu częstotliwości
  const minFreqIndex = Math.floor(70 / frequencyBinWidth); // Ok. E2
  const maxFreqIndex = Math.ceil(400 / frequencyBinWidth);  // Ok. E4

  for (let i = minFreqIndex; i <= maxFreqIndex; i++) {
    const volume = freqByteData[i];
    if (volume > maxVolume) {
      maxVolume = volume;
      maxFrequency = i * frequencyBinWidth;
    }
  }

  // Ustaw próg głośności, aby ignorować ciszę
  const volumeThreshold = 60; // Możesz dostosować tę wartość
  if (maxVolume > volumeThreshold) {
    const { noteName, cents } = getNoteAndCents(maxFrequency);
    currentNote.value = noteName;
    centsDeviation.value = parseFloat(cents.toFixed(1)); // Zaokrągl do 1 miejsca po przecinku
  } else {
    currentNote.value = '--';
    centsDeviation.value = 0;
  }

  animationFrameId.value = requestAnimationFrame(analyzeAudio);
};

// Funkcja przełączająca stroik (Start/Stop)
const toggleTuner = async () => {
  if (isListening.value) {
    // Stop stroik
    if (animationFrameId.value) {
      cancelAnimationFrame(animationFrameId.value);
      animationFrameId.value = null;
    }
    if (microphoneStream) {
      microphoneStream.getTracks().forEach(track => track.stop());
      microphoneStream = null;
    }
    if (mediaStreamSource) {
      mediaStreamSource.disconnect();
      mediaStreamSource = null;
    }
    if (analyserNode) {
      analyserNode.disconnect();
      analyserNode = null;
    }
    if (audioContext) {
      // AudioContext.close() to zwalnianie zasobów
      if (audioContext.state !== 'closed') {
        await audioContext.close();
      }
      audioContext = null;
    }
    isListening.value = false;
    currentNote.value = '--';
    centsDeviation.value = 0;
    console.log('Tuner stopped. Audio resources released.');

  } else {
    // Start stroik
    try {
      // Ważne: Tone.start() inicjalizuje AudioContext, co jest wymagane przez przeglądarki
      // musi być wywołane po interakcji użytkownika.
      if (Tone.context.state !== 'running') {
        await Tone.start();
        console.log('Tone.js AudioContext started.');
      }

      // Upewnij się, że używamy tego samego AudioContext, co Tone.js
      audioContext = Tone.context.rawContext as AudioContext;
      if (!audioContext) {
        console.error('Tone.context.rawContext is not available.');
        alert('Błąd: Kontekst audio nie jest dostępny. Spróbuj odświeżyć stronę.');
        return;
      }

      microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphoneAccessGranted.value = true;
      console.log('Microphone access granted.');

      mediaStreamSource = audioContext.createMediaStreamSource(microphoneStream);
      analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 2048; // Rozmiar FFT, większa wartość = większa precyzja częstotliwości, ale wolniej
      freqByteData = new Uint8Array(analyserNode.frequencyBinCount); // Dane częstotliwości jako Uint8Array

      mediaStreamSource.connect(analyserNode);
      // AnalyserNode nie musi być podłączony do destination, jeśli tylko analizujemy
      // analyserNode.connect(audioContext.destination);

      isListening.value = true;
      console.log('Tuner started. Listening to microphone...');
      analyzeAudio(); // Rozpocznij pętlę analizy
    } catch (err: any) {
      console.error('Error starting tuner:', err);
      microphoneAccessGranted.value = false;
      isListening.value = false;
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        alert('Brak dostępu do mikrofonu. Upewnij się, że przeglądarka ma uprawnienia.');
      } else {
        alert('Wystąpił błąd przy uruchamianiu stroika. Sprawdź konsolę.');
      }
    }
  }
};

// Hooki cyklu życia Vue
onMounted(() => {
  // Nic nie robimy od razu, czekamy na kliknięcie "Start Stroik"
});

onUnmounted(() => {
  // Upewnij się, że wszystko jest zatrzymane i zwolnione przy opuszczeniu strony
  if (isListening.value) {
    toggleTuner(); // Wywołaj funkcję zatrzymującą
  }
  // Dodatkowe czyszczenie na wypadek, gdyby toggleTuner nie zadziałał w pełni
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value);
  }
  if (microphoneStream) {
    microphoneStream.getTracks().forEach(track => track.stop());
  }
  if (mediaStreamSource) {
    mediaStreamSource.disconnect();
  }
  if (analyserNode) {
    analyserNode.disconnect();
  }
  if (audioContext && audioContext.state !== 'closed') {
    audioContext.close();
  }
  console.log('Tuner component unmounted. All audio resources released.');
});
</script>

<style scoped>
/* Dodatkowe style Tailwind i niestandardowe dla wskaźnika */
.range-thumb-blue::-webkit-slider-thumb {
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

.range-thumb-blue::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3B82F6; /* blue-500 */
  cursor: pointer;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.4); /* ring-blue-500 with opacity */
  transition: background .15s ease-in-out, box-shadow .15s ease-in-out;
}

.range-thumb-blue:focus::-webkit-slider-thumb {
  background: #2563EB; /* blue-600 */
}

.range-thumb-blue:focus::-moz-range-thumb {
  background: #2563EB; /* blue-600 */
}
</style>
