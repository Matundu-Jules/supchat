import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@store/store';
import { logout } from '@store/authSlice';
import {
  setStatus,
  setTheme,
  resetPreferences,
  Status,
  Theme,
} from '@store/preferencesSlice';
import { logoutApi } from '@services/authApi';
import { updatePreferences } from '@services/userApi';
import { logoutWithStatusUpdate } from '@utils/logoutUtils';

export function useHeaderLogic() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isStatusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const { status, theme } = useSelector(
    (state: RootState) => state.preferences
  );

  const menuRef = useRef<HTMLDivElement | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const statusDropdownRef = useRef<HTMLDivElement | null>(null);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const toggleStatusDropdown = () => setStatusDropdownOpen((prev) => !prev);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Handle menu dropdown
      if (
        isMenuOpen &&
        menuRef.current &&
        hamburgerRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !hamburgerRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }

      // Handle status dropdown
      if (
        isStatusDropdownOpen &&
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setStatusDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen, isStatusDropdownOpen]);
  const handleLogout = async () => {
    try {
      // 🔧 CORRECTION: Mettre à jour le statut à "offline" avant la déconnexion
      await logoutWithStatusUpdate();
      await logoutApi();
    } catch (e) {
      console.error('[useHeaderLogic] Erreur lors de la déconnexion :', e);
      // Continuer la déconnexion même en cas d'erreur API
    }
    dispatch(logout());
    dispatch(resetPreferences()); // Réinitialiser les préférences à la déconnexion
    navigate('/login');
  };
  const handleStatusChange = async (newStatus: Status) => {
    try {
      // Mettre à jour Redux immédiatement pour la réactivité de l'UI
      dispatch(setStatus(newStatus));

      // Synchroniser avec l'API
      await updatePreferences({ status: newStatus });

      setStatusDropdownOpen(false);
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      // En cas d'erreur, revenir au statut précédent
      dispatch(setStatus(status));
    }
  };

  const handleThemeToggle = async () => {
    try {
      const newTheme: Theme = theme === 'light' ? 'dark' : 'light';

      // Mettre à jour Redux et localStorage immédiatement
      dispatch(setTheme(newTheme));

      // Synchroniser avec l'API
      await updatePreferences({ theme: newTheme });

      setStatusDropdownOpen(false);
    } catch (error) {
      console.error('Erreur lors du changement de thème:', error);
      // En cas d'erreur API, garder le changement local
    }
  };
  return {
    isMenuOpen,
    setMenuOpen,
    menuRef,
    hamburgerRef,
    toggleMenu,
    handleLogout,
    user,
    navigate,
    status,
    theme,
    isStatusDropdownOpen,
    statusDropdownRef,
    toggleStatusDropdown,
    handleStatusChange,
    handleThemeToggle,
  };
}
