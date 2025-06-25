<template>
  <div class="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
    <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 text-center">Zarządzanie Użytkownikami</h1>

    <div v-if="loading" class="text-center text-blue-600 text-xl py-10">Ładowanie użytkowników...</div>
    <div v-else-if="!hasAdminRole" class="text-center text-red-600 text-xl py-10">
      Brak uprawnień. Tylko administratorzy mogą przeglądać tę stronę.
    </div>
    <div v-else class="bg-white p-6 rounded-lg shadow-lg">
      <ul class="space-y-4">
        <li
          v-for="user in users"
          :key="user.id"
          class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-200 rounded-md shadow-sm"
        >
          <div class="flex-grow mb-2 sm:mb-0">
            <p class="font-semibold text-lg text-gray-900">{{ user.email }}</p>
            <p class="text-sm text-gray-600">ID: {{ user.id }}</p>
          </div>
          <div class="flex items-center space-x-2">
            <label :for="`role-select-${user.id}`" class="sr-only">Rola</label>
            <select
              v-model="user.role"
              @change="updateUserRole(user.id, user.role)"
              :id="`role-select-${user.id}`"
              class="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              :disabled="user.id === currentUserId"
            >
              <option value="user">Użytkownik</option>
              <option value="leader">Prowadzący</option>
              <option value="admin">Administrator</option>
            </select>
            <span v-if="user.id === currentUserId" class="text-sm text-gray-500">(Twoja rola)</span>
          </div>
        </li>
      </ul>
      <p v-if="users.length === 0 && !loading" class="text-gray-500 text-center text-lg mt-8">Brak użytkowników.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useNuxtApp } from '#app';
import { useUserRole } from '~/composables/useUserRole'; // Upewnij się, że ten composable istnieje i działa poprawnie
import { navigateTo } from '#imports';

definePageMeta({
  layout: 'default',
  middleware: 'admin-only' as any 
});

interface UserProfile {
  id: string;
  email: string;
  role: 'user' | 'leader' | 'admin';
}

const { $supabase } = useNuxtApp();
const users = ref<UserProfile[]>([]);
const loading = ref(true);
const userRole = useUserRole(); // Globalna rola zalogowanego użytkownika
const currentUserId = ref<string | null>(null);

// Sprawdzenie, czy zalogowany użytkownik ma rolę admina
const hasAdminRole = computed(() => userRole.value === 'admin');

async function fetchUsers() {
  loading.value = true;
  try {
    // Sprawdź sesję, aby uzyskać ID aktualnego użytkownika
    const { data: sessionData } = await $supabase.auth.getSession();
    currentUserId.value = sessionData.session?.user?.id || null;

    // Pobierz wszystkie profile użytkowników
    const { data: profilesData, error: profilesError } = await $supabase
      .from('profiles')
      .select('user_id, role'); 

    if (profilesError) {
      console.error('Błąd pobierania profili:', profilesError);
      throw profilesError;
    }

    // Dla każdego profilu pobierz email z `auth.admin.getUserById` (dostępne tylko po stronie serwera/za pośrednictwem klucza serwisowego)
    // UWAGA: `auth.admin.getUserById` NIE JEST dostępne po stronie klienta bez klucza serwisowego.
    // Jeśli to jest komponent po stronie klienta (co jest typowe dla `pages/`), musisz to zmienić.
    // Najbezpieczniejszym sposobem na pobranie listy użytkowników z ich emailami i rolami
    // po stronie klienta jest stworzenie funkcji RPC (Remote Procedure Call) w Supabase
    // lub widoku (VIEW) w bazie danych, który łączy `auth.users` z `public.profiles`.

    // Na potrzeby demonstracji, jeśli zakładamy, że `auth.admin.getUserById` jest jakimś cudem dostępne,
    // albo że uruchamiasz to w kontekście serwerowym (np. w API route w Nuxt),
    // to poniższy kod by działał.
    // W REALNYM scenariuszu klienckim, MUSISZ ZASTĄPIĆ TO FUNKCJĄ RPC.

    // Przykład z użyciem auth.admin (które w kliencie nie działa)
    // Zmieniamy na prostsze podejście, gdzie pobieramy profiles i zakładamy, że email nie jest potrzebny,
    // albo że role są wystarczające do wyświetlenia listy, lub że email jest w tabeli profiles.
    // Zakładając, że `email` mógłby być kolumną w `profiles` dla uproszczenia
    // LUB, że Supabase zwraca nam email w jakiś inny sposób poprzez RLS na `profiles`.

    // Realistyczne rozwiązanie: Tworzymy funkcję w Supabase, która to robi.
    // Tymczasowo, dla uproszczenia i pokazania struktury:
    // Musimy uzyskać email. Najłatwiej to zrobić, jeśli email jest w tabeli profiles.
    // Jeśli nie, to ta metoda wymaga funkcji RPC.

    // Zamiast `auth.admin.getUserById`, zakładamy, że `profiles` zawiera email
    // lub używamy `supabaseClient.auth.getUser()` dla każdego, ale to nie zadziała na liście.
    // Spróbujmy najpierw z `select('user_id, role, email')` - jeśli masz email w profiles.
    // Jeśli nie, to trzeba by pobierać listę user_id z profili i robić `auth.getUser()` dla każdego,
    // co jest nieefektywne i zapewne przekroczy limit zapytań RLS.

    // Prawdopodobnie najlepsza opcja: użyć user_id z profili i wyświetlać tylko ID,
    // lub jeśli email jest faktycznie przechowywany w `user_metadata` w Supabase,
    // to można próbować go stamtąd wyciągnąć, ale to wymaga specjalnej konfiguracji
    // JWT w Supabase, żeby `user_metadata` było widoczne.

    // Najprostsze rozwiązanie, bez dodatkowych zapytań o email:
    users.value = (profilesData || []).map((profile: any) => ({
      id: profile.user_id,
      email: `Użytkownik ID: ${profile.user_id.substring(0, 8)}...`, // Wyświetlaj tylko ID, jeśli email nie jest łatwo dostępny
      role: profile.role,
    }));

    // Alternatywnie, jeśli masz widok w bazie danych, który łączy users z profiles:
    /*
    const { data: usersWithEmail, error: viewError } = await $supabase
      .from('users_with_roles_view') // Nazwa widoku w Twojej bazie Supabase
      .select('id, email, role');
    if (viewError) throw viewError;
    users.value = usersWithEmail as UserProfile[];
    */

  } catch (err: any) {
    console.error('Błąd pobierania użytkowników:', err.message);
    alert('Błąd pobierania użytkowników: ' + err.message);
  } finally {
    loading.value = false;
  }
}

async function updateUserRole(userIdToUpdate: string, newRole: 'user' | 'leader' | 'admin') {
  if (!hasAdminRole.value) {
    alert('Brak uprawnień do zmiany roli.');
    return;
  }
  if (userIdToUpdate === currentUserId.value) {
    alert('Nie możesz zmienić swojej własnej roli z tego panelu.');
    return;
  }

  try {
    const { error } = await $supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('user_id', userIdToUpdate); // Użyj user_id, ponieważ to jest klucz zewnętrzny

    if (error) {
      console.error('Błąd aktualizacji roli:', error);
      alert('Błąd aktualizacji roli: ' + error.message);
      // Opcjonalnie: odśwież listę użytkowników w razie błędu
      await fetchUsers();
    } else {
      alert(`Rola użytkownika ${userIdToUpdate.substring(0, 8)}... została zmieniona na ${newRole}.`);
    }
  } catch (err: any) {
    console.error('Nieoczekiwany błąd przy aktualizacji roli:', err.message);
    alert('Wystąpił nieoczekiwany błąd. Sprawdź konsolę.');
  }
}

onMounted(async () => {
  // Ponieważ middleware 'admin-only' zajmie się przekierowaniem,
  // tutaj po prostu próbujemy pobrać użytkowników.
  // Jeśli użytkownik nie jest adminem, fetchUsers może zwrócić błąd lub puste dane z RLS,
  // a `hasAdminRole` obsłuży wyświetlanie komunikatu.
  if (hasAdminRole.value) {
    await fetchUsers();
  } else {
    loading.value = false; // Zakończ ładowanie, jeśli nie jest adminem
    console.warn('Access denied: User is not an admin.');
  }
});

// Watch userRole from composable in case it changes dynamically
watch(userRole, (newRole) => {
  if (newRole === 'admin' && users.value.length === 0 && !loading.value) {
    fetchUsers(); // Fetch if admin role is granted later and users list is empty
  }
});
</script>

<style scoped>
/* Możesz dodać dodatkowe style Tailwind lub niestandardowe tutaj */
</style>