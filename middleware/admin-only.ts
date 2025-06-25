// middleware/admin-only.ts
import { defineNuxtRouteMiddleware, navigateTo } from '#imports';
import { useNuxtApp } from '#app';

export default defineNuxtRouteMiddleware(async (to, from) => {
  const nuxtApp = useNuxtApp() as unknown as { $supabase: any };
  const supabaseClient = nuxtApp.$supabase;

  if (!supabaseClient) {
    console.error("Supabase client not found in nuxtApp.");
    // Zaloguj błąd i być może przekieruj do strony błędu lub logowania
    return navigateTo('/');
  }

  const { data: { user } } = await supabaseClient.auth.getUser();

  if (!user) {
    // Użytkownik nie jest zalogowany, przekieruj do strony głównej
    return navigateTo('/');
  }

  // Pobierz rolę użytkownika z bazy danych
  try {
    const { data: profile, error } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.id) // Upewnij się, że to user_id odpowiada Twojej tabeli profiles
      .single();

    if (error || !profile) {
      console.error('Error fetching user role for middleware:', error?.message || 'Profile not found');
      // Przekieruj, jeśli rola nie może być pobrana (np. profil nie istnieje)
      alert('Nie udało się pobrać danych profilu. Brak dostępu.');
      return navigateTo('/dashboard'); // lub inną bezpieczną stronę
    }

    if (profile.role !== 'admin') {
      // Użytkownik nie jest adminem, zablokuj dostęp
      console.warn(`Access denied: User ${user.id} with role "${profile.role}" tried to access admin panel.`);
      alert('Brak uprawnień. Tylko administratorzy mogą uzyskać dostęp do tej strony.');
      return navigateTo('/dashboard'); // Przekieruj na dashboard
    }
  } catch (e: any) {
    console.error('Unexpected error in admin-only middleware:', e.message);
    alert('Wystąpił błąd weryfikacji roli. Spróbuj ponownie.');
    return navigateTo('/dashboard');
  }
});