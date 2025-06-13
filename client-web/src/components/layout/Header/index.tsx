// src/components/Header/Header.tsx

import { NavLink } from "react-router-dom";
import { useHeaderLogic } from "@hooks/useHeaderLogic";

import styles from "./Header.module.scss";

type HeaderProps = {
  theme: "light" | "dark";
  toggleTheme: () => void;
};

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  const {
    isMenuOpen,
    setMenuOpen,
    menuRef,
    hamburgerRef,
    toggleMenu,
    handleLogout,
    user,
    navigate,
  } = useHeaderLogic();

  return (
    <header className={styles["header"]}>
      {/* Logo section (left) - ready for logo image */}
      <NavLink to="/" className={styles["logo"]} title="Back to dashboard">
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
