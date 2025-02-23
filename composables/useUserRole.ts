// composables/useUserRole.ts

/**
 * Zwraca globalny (reaktywny) stan roli użytkownika.
 * Może to być 'uczestnik', 'prowadzacy', 'admin', albo null (jeśli nie ustalono).
 */
export const useUserRole = () => useState<'uczestnik' | 'prowadzacy' | 'admin' | null>(
    'userRole', // klucz w globalnym stanie
    () => null   // domyślna wartość
  )
  