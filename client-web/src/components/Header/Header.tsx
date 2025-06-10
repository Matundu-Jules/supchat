// src/components/Header/Header.tsx

import api from "@utils/axiosInstance";
import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { RootState, AppDispatch } from "@store/store";
import { logout } from "@store/authSlice";

import styles from "./Header.module.scss";

type HeaderProps = {
  theme: "light" | "dark";
  toggleTheme: () => void;
};

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
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
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMenuOpen]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error("Erreur lors de la connexion :", e);
    }
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header className={styles["header"]}>
      {/* Logo section (left) - ready for logo image */}
      <NavLink to="/" className={styles["logo"]} title="Back to dashboard">
        {/* If you want to add an image, just uncomment below */}
        <img
          src="/assets/images/logo-supchat-simplified-without-text-primary.png"
          alt="SupChat Logo"
        />
        SUPCHAT
      </NavLink>

      {/* Hamburger menu button (mobile only) */}
      <button
        ref={hamburgerRef}
        className={`${styles["hamburger"]} ${isMenuOpen ? styles["open"] : ""}`}
        aria-label="Menu"
        onClick={toggleMenu}
      >
        <i className="fa-solid fa-bars"></i>
      </button>

      {/* Hamburger dropdown menu (mobile only) */}
      <nav
        ref={menuRef}
        className={`${styles["menu"]} ${isMenuOpen ? styles["open"] : ""}`}
      >
        <NavLink
          to="/"
          className={({ isActive }) =>
            `${styles["navLink"]} ${isActive ? styles["active"] : ""}`
          }
          onClick={() => setMenuOpen(false)}
          end
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/workspace"
          className={({ isActive }) =>
            `${styles["navLink"]} ${isActive ? styles["active"] : ""}`
          }
          onClick={() => setMenuOpen(false)}
        >
          Workspace
        </NavLink>
        <NavLink
          to="/message"
          className={({ isActive }) =>
            `${styles["navLink"]} ${isActive ? styles["active"] : ""}`
          }
          onClick={() => setMenuOpen(false)}
        >
          Messages
        </NavLink>
        {/* Logout button only visible in the hamburger menu on mobile */}
        <div className={styles["logoutMobile"]}>
          {user && (
            <button
              onClick={handleLogout}
              className={styles["logoutHamburgerBtn"]}
            >
              Se déconnecter
            </button>
          )}
        </div>
      </nav>

      {/* User section (right) */}
      <div className={styles["userSection"]}>
        {/* Toggle Dark/Light */}
        <button
          className={styles["themeToggleBtn"]}
          onClick={toggleTheme}
          title={
            theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"
          }
          aria-label="Changer de thème"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        {user ? (
          <>
            {/* Username is only visible on desktop */}
            <span className={styles["username"]}>{user.name}</span>
            {/* Logout button only visible on desktop (see CSS media queries) */}
            <button
              className={styles["logoutBtn"] + " " + styles["logoutDesktop"]}
              onClick={handleLogout}
            >
              Se déconnecter
            </button>
          </>
        ) : (
          <button
            className={styles["loginBtn"]}
            onClick={() => navigate("/login")}
          >
            Se connecter
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
