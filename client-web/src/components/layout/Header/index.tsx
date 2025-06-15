// src/components/Header/Header.tsx

import { NavLink } from "react-router-dom";
import { useHeaderLogic } from "@hooks/useHeaderLogic";
import { getAvatarUrl } from "@utils/avatarUtils";

import styles from "./Header.module.scss";

const Header: React.FC = () => {
  const {
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
  } = useHeaderLogic();

  return (
    <header className={styles["header"]}>
      {/* Logo section (left) - ready for logo image */}
      <NavLink
        to="/workspace"
        className={styles["logo"]}
        title="Go to workspace"
      >
        <img
          src="/assets/images/logo-supchat-simplified-without-text-primary.png"
          alt="SupChat Logo"
        />{" "}
        SUPCHAT
      </NavLink>
      {/* Navigation desktop centrée (≥1024px) */}
      <nav className={styles["desktopNav"]}>
        <NavLink
          to="/workspace"
          className={({ isActive }) =>
            `${styles["navLinkDesktop"]} ${isActive ? styles["active"] : ""}`
          }
        >
          Workspace
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `${styles["navLinkDesktop"]} ${isActive ? styles["active"] : ""}`
          }
        >
          Paramètres
        </NavLink>
      </nav>
      {/* Hamburger menu button (mobile only) */}
      <button
        ref={hamburgerRef}
        className={`${styles["hamburger"]} ${isMenuOpen ? styles["open"] : ""}`}
        aria-label="Menu"
        onClick={toggleMenu}
      >
        <i className="fa-solid fa-bars"></i>
      </button>{" "}
      {/* Hamburger dropdown menu (mobile only) */}
      <nav
        ref={menuRef}
        className={`${styles["menu"]} ${isMenuOpen ? styles["open"] : ""}`}
      >
        <NavLink
          to="/workspace"
          className={({ isActive }) =>
            `${styles["navLink"]} ${isActive ? styles["active"] : ""}`
          }
          onClick={() => setMenuOpen(false)}
        >
          Workspace
        </NavLink>{" "}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `${styles["navLink"]} ${isActive ? styles["active"] : ""}`
          }
          onClick={() => setMenuOpen(false)}
        >
          Paramètres
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
      </nav>{" "}
      {/* User section (right) */}
      <div className={styles["userSection"]}>
        {" "}
        {user ? (
          <>
            {/* Avatar simple (visible seulement sous 1300px) */}
            <div className={styles["simpleAvatar"]}>
              {user.avatar ? (
                <img src={getAvatarUrl(user.avatar) || ""} alt="Avatar" />
              ) : (
                <div className={styles["simpleAvatarPlaceholder"]}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* User info with status dropdown (visible seulement au-dessus de 1300px) */}
            <div className={styles["userInfo"]} ref={statusDropdownRef}>
              <div
                className={styles["userNameStatus"]}
                onClick={toggleStatusDropdown}
              >
                {" "}
                {/* Avatar */}
                <div className={styles["userAvatar"]}>
                  {user.avatar ? (
                    <img src={getAvatarUrl(user.avatar) || ""} alt="Avatar" />
                  ) : (
                    <div className={styles["avatarPlaceholder"]}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className={styles["userDetails"]}>
                  <div className={styles["userNameRow"]}>
                    <span className={styles["username"]}>{user.name}</span>
                    <span className={styles["dropdownArrow"]}>
                      {isStatusDropdownOpen ? "▲" : "▼"}
                    </span>
                  </div>
                  <div className={styles["statusRow"]}>
                    <span className={styles["statusIndicator"]}>
                      {status === "online"
                        ? "🟢"
                        : status === "away"
                        ? "🟡"
                        : status === "busy"
                        ? "🔴"
                        : "⚫"}
                    </span>
                    <span className={styles["statusText"]}>
                      {status === "online"
                        ? "En ligne"
                        : status === "away"
                        ? "Absent"
                        : status === "busy"
                        ? "Occupé"
                        : "Hors ligne"}
                    </span>
                  </div>
                </div>
              </div>{" "}
              {/* Status dropdown */}
              {isStatusDropdownOpen && (
                <div className={styles["statusDropdown"]}>
                  <div
                    className={`${styles["statusOption"]} ${
                      status === "online" ? styles["active"] : ""
                    }`}
                    onClick={() => handleStatusChange("online")}
                  >
                    <span className={styles["statusIcon"]}>🟢</span>
                    <span>En ligne</span>
                  </div>
                  <div
                    className={`${styles["statusOption"]} ${
                      status === "away" ? styles["active"] : ""
                    }`}
                    onClick={() => handleStatusChange("away")}
                  >
                    <span className={styles["statusIcon"]}>🟡</span>
                    <span>Absent</span>
                  </div>
                  <div
                    className={`${styles["statusOption"]} ${
                      status === "busy" ? styles["active"] : ""
                    }`}
                    onClick={() => handleStatusChange("busy")}
                  >
                    <span className={styles["statusIcon"]}>🔴</span>
                    <span>Occupé</span>
                  </div>
                  <div
                    className={`${styles["statusOption"]} ${
                      status === "offline" ? styles["active"] : ""
                    }`}
                    onClick={() => handleStatusChange("offline")}
                  >
                    <span className={styles["statusIcon"]}>⚫</span>
                    <span>Hors ligne</span>
                  </div>

                  {/* Séparateur */}
                  <div className={styles["dropdownDivider"]}></div>

                  {/* Bouton de thème */}
                  <div
                    className={styles["statusOption"]}
                    onClick={handleThemeToggle}
                  >
                    <span className={styles["statusIcon"]}>
                      {theme === "light" ? "🌙" : "☀️"}
                    </span>
                    <span>
                      {theme === "light" ? "Mode sombre" : "Mode clair"}
                    </span>
                  </div>
                </div>
              )}
            </div>

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
