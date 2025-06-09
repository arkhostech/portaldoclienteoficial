import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { useLogoutHandler } from '@/contexts/NotificationContext';

export function LogoutHandler() {
  const { user } = useAuth();
  const { saveLogoutTime } = useLogoutHandler();

  // Detectar quando o usuário sai (muda de logado para deslogado)
  useEffect(() => {
    let wasLoggedIn = !!user;
    
    return () => {
      // Se estava logado e agora o componente está sendo desmontado, salvar logout
      if (wasLoggedIn) {
        saveLogoutTime();
      }
    };
  }, [user, saveLogoutTime]);

  // Salvar no beforeunload e visibilitychange
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user) {
        saveLogoutTime();
      }
    };

    const handleVisibilityChange = () => {
      if (user && document.visibilityState === 'hidden') {
        saveLogoutTime();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, saveLogoutTime]);

  // Detectar mudança de estado de login para logout
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Se detectar mudança no estado de auth, salvar logout
      if (e.key?.includes('supabase.auth.token') && !e.newValue && user) {
        saveLogoutTime();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user, saveLogoutTime]);

  return null; // Este componente não renderiza nada
} 