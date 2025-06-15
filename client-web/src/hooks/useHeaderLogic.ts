import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@store/store';
import { logout } from '@store/authSlice';
import { setStatus, setTheme, Status, Theme } from '@store/preferencesSlice';
import { logoutApi } from '@services/authApi';
import { updatePreferences } from '@services/userApi';

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
      await logoutApi();
    } catch (e) {
      console.error('Erreur lors de la déconnexion :', e);
      // Tu pourrais aussi afficher une notification d'erreur ici
    }
    dispatch(logout());
    navigate('/login');
  };
  const handleStatusChange = async (newStatus: Status) => {
    dispatch(setStatus(newStatus));
    await updatePreferences({ status: newStatus });
    setStatusDropdownOpen(false);
  };

  const handleThemeToggle = async () => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
    dispatch(setTheme(newTheme));
    await updatePreferences({ theme: newTheme });
    document.body.setAttribute('data-theme', newTheme);
    setStatusDropdownOpen(false);
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
