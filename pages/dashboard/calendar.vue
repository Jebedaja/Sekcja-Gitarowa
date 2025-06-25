<template>
  <div class="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
    <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 text-center">Mój Kalendarz</h1>

    <!-- Formularz dodawania wydarzenia -->
    <div class="bg-white p-6 rounded-lg shadow-lg mb-8">
      <h2 class="text-2xl font-semibold mb-4 text-gray-800">Dodaj nowe wydarzenie</h2>
      <form @submit.prevent="addEvent" class="space-y-4">
        <div>
          <label for="event-title" class="block text-sm font-medium text-gray-700">Tytuł wydarzenia</label>
          <input
            type="text"
            id="event-title"
            v-model="newEvent.title"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            placeholder="Np. Spotkanie z Zespołem"
          />
        </div>
        <div>
          <label for="event-start-date" class="block text-sm font-medium text-gray-700">Data rozpoczęcia</label>
          <input
            type="date"
            id="event-start-date"
            v-model="newEvent.startDate"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
          />
        </div>
        <div>
          <label for="event-end-date" class="block text-sm font-medium text-gray-700">Data zakończenia (opcjonalnie)</label>
          <input
            type="date"
            id="event-end-date"
            v-model="newEvent.endDate"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
          />
        </div>
        <div>
          <label for="event-description" class="block text-sm font-medium text-gray-700">Opis (opcjonalnie)</label>
          <textarea
            id="event-description"
            v-model="newEvent.description"
            rows="3"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            placeholder="Dodatkowe szczegóły wydarzenia"
          ></textarea>
        </div>
        <button
          type="submit"
          class="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out shadow-md font-semibold"
        >
          Dodaj wydarzenie
        </button>
      </form>
    </div>

    <!-- Sekcja kalendarza -->
    <div class="bg-white p-6 rounded-lg shadow-lg">
      <h2 class="text-2xl font-semibold mb-4 text-gray-800 text-center">Wydarzenia</h2>
      
      <!-- Nagłówek nawigacji kalendarza -->
      <div class="flex justify-between items-center mb-4">
        <button @click="moveCalendar(-1)" class="p-2 rounded-full hover:bg-gray-200">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <span class="text-xl font-bold text-gray-800">{{ calendarTitle }}</span>
        <button @click="moveCalendar(1)" class="p-2 rounded-full hover:bg-gray-200">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>

      <!-- Komponent v-calendar -->
      <!-- Używamy propsu `attributes` do przekazania wydarzeń do kalendarza -->
      <!-- Zmieniono VCalendar na Calendar -->
      <Calendar
        expanded
        :attributes="calendarAttributes"
        :from-page="calendarPage"
        @update:from-page="updateCalendarPage"
        class="custom-calendar-style"
      >
        <!-- Możesz użyć slotów do dostosowania wyglądu dni, jeśli chcesz -->
        <template #day-content="{ day, attributes }">
          <div class="flex flex-col h-full z-10">
            <span class="day-label text-xs sm:text-sm font-medium text-gray-600 self-end pr-1 pt-1">{{ day.day }}</span>
            <div class="flex-grow overflow-y-auto p-1 text-left">
              <p
                v-for="{ key, customData } in attributes"
                :key="key"
                class="text-xs font-semibold rounded px-1 py-0.5 mb-0.5 text-white whitespace-nowrap overflow-hidden text-ellipsis"
                :class="customData.isCompleted ? 'bg-gray-500' : 'bg-blue-500'"
                @click.stop="showEventDetails(customData)"
              >
                {{ customData.title }}
              </p>
            </div>
          </div>
        </template>
      </Calendar>

      <p v-if="events.length === 0 && !loading" class="text-gray-500 text-center text-lg mt-4">Brak zaplanowanych wydarzeń.</p>
      <p v-if="loading" class="text-blue-500 text-center text-lg mt-4">Ładowanie wydarzeń...</p>
    </div>

    <!-- Modal do wyświetlania szczegółów wydarzenia i usuwania -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
        <h3 class="text-xl font-bold mb-4 text-gray-900">{{ selectedEvent?.title }}</h3>
        <p class="text-gray-700 mb-2"><strong>Od:</strong> {{ selectedEvent?.start_date ? new Date(selectedEvent.start_date).toLocaleDateString() : 'N/A' }}</p>
        <p v-if="selectedEvent?.end_date" class="text-gray-700 mb-2"><strong>Do:</strong> {{ new Date(selectedEvent.end_date).toLocaleDateString() }}</p>
        <p v-if="selectedEvent?.description" class="text-gray-700 mb-4"><strong>Opis:</strong> {{ selectedEvent?.description }}</p>
        
        <div class="flex justify-end space-x-3">
          <button @click="closeModal" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Zamknij</button>
          <button @click="deleteEvent(selectedEvent!.id)" class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">Usuń</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useNuxtApp } from '#app';
// Importujemy komponent VCalendar i Utility functions z v-calendar
// WAŻNA ZMIANA: Zmieniono VCalendar na Calendar
import { Calendar, DatePicker } from 'v-calendar'; // Usunięto VCalendar, dodano Calendar
import 'v-calendar/dist/style.css'; // Styl domyślny v-calendar, który będziemy nadpisywać

// Definiujemy layout dla strony
definePageMeta({
  layout: 'default'
});

const { $supabase } = useNuxtApp();
let userId: string | null = null; // Zmieniono na let, aby móc przypisać wartość

// Stan dla formularza dodawania wydarzenia
const newEvent = ref({
  title: '',
  startDate: '',
  endDate: '',
  description: '',
});

// Stan dla listy wydarzeń pobranych z Supabase
const events = ref<any[]>([]); // Będziemy przechowywać surowe dane z Supabase
const loading = ref(true); // Stan ładowania danych

// Stan dla kalendarza v-calendar
const calendarPage = ref({
  month: new Date().getMonth() + 1, // Miesiąc aktualny
  year: new Date().getFullYear(),  // Rok aktualny
});

// Zmienne dla modala szczegółów wydarzenia
const showModal = ref(false);
const selectedEvent = ref<any | null>(null);

// Komputowane właściwości dla v-calendar attributes
const calendarAttributes = computed(() => {
  return events.value.map(event => ({
    key: event.id, // Unikalny klucz wydarzenia
    dates: {
      start: new Date(event.start_date),
      end: event.end_date ? new Date(event.end_date) : new Date(event.start_date),
    },
    // Customowe dane, które można przekazać do slotu day-content
    customData: {
      id: event.id,
      title: event.title,
      description: event.description,
      start_date: event.start_date,
      end_date: event.end_date,
      isCompleted: false, // Dodaj to, jeśli masz stan ukończenia wydarzenia (jak w Todo)
    },
    // Kolory wydarzeń - możesz dostosować w zależności od kategorii/statusu
    highlight: {
      color: 'blue', // Kolor tła wydarzenia
      fillMode: 'solid',
    } as any, // WAŻNA ZMIANA: Dodano as any do obiektu highlight
    // Tekst wydarzenia widoczny w kalendarzu
    popover: {
      label: event.title,
      visibility: 'hover',
    },
  }));
});

// Komputowany tytuł kalendarza (np. "Czerwiec 2025")
const calendarTitle = computed(() => {
  const date = new Date(calendarPage.value.year, calendarPage.value.month - 1, 1);
  return date.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
});

// Funkcja do pobierania wydarzeń z Supabase
async function fetchEvents() {
  loading.value = true;
  try {
    if (!userId) {
      console.warn('User not logged in, cannot fetch events.');
      events.value = [];
      return;
    }

    const { data, error } = await $supabase
      .from('events')
      .select('*') // Pobieramy wszystkie kolumny
      .eq('user_id', userId) // Filtrujemy po ID użytkownika
      .order('start_date', { ascending: true }); // Sortujemy po dacie

    if (error) {
      console.error('Błąd pobierania wydarzeń:', error);
      alert('Błąd pobierania wydarzeń: ' + error.message);
      events.value = [];
      return;
    }
    events.value = data || [];
  } catch (err) {
    console.error('Nieoczekiwany błąd przy pobieraniu wydarzeń:', err);
    alert('Wystąpił nieoczekiwany błąd. Sprawdź konsolę.');
    events.value = [];
  } finally {
    loading.value = false;
  }
}

// Funkcja do dodawania wydarzenia do Supabase
async function addEvent() {
  if (!userId) {
    alert('Musisz być zalogowany, aby dodawać wydarzenia.');
    return;
  }
  if (!newEvent.value.title.trim() || !newEvent.value.startDate) {
    alert('Wprowadź tytuł i datę rozpoczęcia wydarzenia.');
    return;
  }

  try {
    const { data, error } = await $supabase
      .from('events')
      .insert({
        user_id: userId,
        title: newEvent.value.title.trim(),
        start_date: newEvent.value.startDate,
        end_date: newEvent.value.endDate || null, // Ustawiamy null jeśli pusta
        description: newEvent.value.description.trim() || null, // Ustawiamy null jeśli pusta
      })
      .select('*')
      .single();

    if (error) {
      console.error('Błąd dodawania wydarzenia:', error);
      alert('Błąd dodawania wydarzenia: ' + error.message);
      return;
    }

    alert('Wydarzenie dodane pomyślnie!');
    newEvent.value = { title: '', startDate: '', endDate: '', description: '' }; // Wyczyść formularz
    fetchEvents(); // Odśwież listę wydarzeń
  } catch (err) {
    console.error('Nieoczekiwany błąd przy dodawaniu wydarzenia:', err);
    alert('Wystąpił nieoczekiwany błąd. Sprawdź konsolę.');
  }
}

// Funkcja do usuwania wydarzenia z Supabase
async function deleteEvent(eventId: string) {
  // UWAGA: Zastąp to niestandardowym modalem potwierdzenia
  if (!confirm('Na pewno usunąć to wydarzenie?')) return;

  try {
    const { error } = await $supabase
      .from('events')
      .delete()
      .match({ id: eventId, user_id: userId }); // Upewnij się, że usuwasz tylko swoje wydarzenia

    if (error) {
      console.error('Błąd usuwania wydarzenia:', error);
      alert('Błąd usuwania wydarzenia: ' + error.message);
      return;
    }

    alert('Wydarzenie usunięte pomyślnie!');
    closeModal(); // Zamknij modal po usunięciu
    fetchEvents(); // Odśwież listę wydarzeń
  } catch (err) {
    console.error('Nieoczekiwany błąd przy usuwaniu wydarzenia:', err);
    alert('Wystąpił nieoczekiwany błąd. Sprawdź konsolę.');
  }
}

// Funkcje do obsługi modala
function showEventDetails(event: any) {
  selectedEvent.value = event;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  selectedEvent.value = null;
}

// Funkcje nawigacji kalendarza
function moveCalendar(direction: number) {
  const currentMonth = calendarPage.value.month;
  const currentYear = calendarPage.value.year;

  let newMonth = currentMonth + direction;
  let newYear = currentYear;

  if (newMonth > 12) {
    newMonth = 1;
    newYear++;
  } else if (newMonth < 1) {
    newMonth = 12;
    newYear--;
  }
  calendarPage.value = { month: newMonth, year: newYear };
}

function updateCalendarPage(page: { month: number; year: number }) {
  calendarPage.value = page;
}

// Sprawdź ID użytkownika przy montowaniu komponentu i pobierz wydarzenia
onMounted(async () => {
  const { data: sessionData } = await $supabase.auth.getSession();
  if (sessionData.session?.user?.id) {
    userId = sessionData.session.user.id;
    await fetchEvents();
  } else {
    console.warn('No user session found for calendar. Events will not be loaded.');
    loading.value = false;
  }
});

// Reaguj na zmiany strony kalendarza, aby załadować wydarzenia dla nowego zakresu, jeśli to konieczne
// W tej prostej implementacji pobieramy wszystkie wydarzenia należące do użytkownika.
// Dla bardzo dużej liczby wydarzeń należałoby filtrować zapytanie Supabase po zakresie dat
// widocznym w kalendarzu. Na razie jest to pomijane dla uproszczenia.
watch(calendarPage, () => {
  // console.log('Calendar page changed to:', calendarPage.value);
  // Jeśli chcemy ładować wydarzenia tylko dla aktualnie widocznego miesiąca:
  // fetchEventsForMonth(calendarPage.value.year, calendarPage.value.month);
  // Na potrzeby tego tutoriala, fetchEvents() pobiera wszystkie dla danego użytkownika.
});
</script>

<style>
/* Customowe style dla v-calendar, aby nadpisać domyślne i użyć Tailwind */
/* Ogólne style dla komponentu kalendarza */
.custom-calendar-style {
  --vc-font-family: 'Inter', sans-serif; /* Użyj czcionki Inter */
  border-radius: 0.5rem; /* Zaokrąglone rogi */
  border-width: 1px; /* Cienkie obramowanie */
  border-color: #e5e7eb; /* Kolor borderu gray-200 */
}

/* Style dla nagłówków tygodni (pon, wt, ...) */
.custom-calendar-style .vc-header {
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.custom-calendar-style .vc-weeks {
  padding-top: 1rem;
}

.custom-calendar-style .vc-weekday {
  font-weight: 600; /* semi-bold */
  color: #4b5563; /* gray-700 */
  font-size: 0.875rem; /* text-sm */
}

/* Style dla numerów dni */
.custom-calendar-style .vc-day-content {
  display: flex;
  flex-direction: column;
  height: 100%; /* Upewnij się, że content zajmuje całą wysokość dnia */
}

.custom-calendar-style .vc-day-content .day-label {
  font-weight: 500; /* medium */
  color: #6b7280; /* gray-600 */
  align-self: flex-end; /* Wyrównanie numeru dnia do prawego górnego rogu */
  padding-right: 0.25rem;
  padding-top: 0.25rem;
}

/* Style dla wydarzeń w kalendarzu */
.custom-calendar-style .vc-highlight-content {
  /* Domyślny styl v-calendar dla podświetleń, dostosowany przez highlight w attributes */
  /* Tutaj możesz nadpisać, jeśli highlight w attributes nie wystarczy */
}

/* Styl dla aktywnego dnia (np. dzisiejszy dzień) */
.custom-calendar-style .vc-day.is-today .vc-day-content {
  background-color: #e0f2fe; /* light blue for today */
  border-radius: 0.375rem; /* rounded-md */
}

/* Nadpisanie domyślnych stylów v-calendar dla komórek dnia */
.custom-calendar-style .vc-day {
  min-height: 100px; /* Minimalna wysokość komórki dnia */
  padding: 0; /* Usuń domyślny padding, aby móc kontrolować go wewnętrznie */
}

/* Scrollowanie wydarzeń w dniu, jeśli jest ich wiele */
.custom-calendar-style .vc-day-content > div {
  max-height: 80px; /* Maksymalna wysokość kontenera wydarzeń w dniu */
  overflow-y: auto; /* Włącz scrollowanie dla wydarzeń w dniu */
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
/* Ukrycie scrollbara dla WebKit (Chrome, Safari) */
.custom-calendar-style .vc-day-content > div::-webkit-scrollbar {
  display: none;
}
</style>
