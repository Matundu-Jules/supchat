import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@store/store';
import { logout } from '@store/authSlice';
import { logoutApi } from '@services/authApi';

export function useHeaderLogic() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        hamburgerRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !hamburgerRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

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

  return {
    isMenuOpen,
    setMenuOpen,
    menuRef,
    hamburgerRef,
    toggleMenu,
    handleLogout,
    user,
    navigate,
  };
}
