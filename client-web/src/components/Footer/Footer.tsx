// src/components/Footer/Footer.tsx

import styles from "./Footer.module.scss";

type FooterProps = {
  theme: "light" | "dark";
  toggleTheme: () => void;
};

const Footer: React.FC<FooterProps> = ({ theme, toggleTheme }) => {
  return (
    <footer className={styles["footer"]}>
      <div className={styles["footer-social"]}>
        <a
          href="https://github.com/JuloushVolley/3PROJ"
          className={styles["github"]}
        >
          <i className="fa-brands fa-github"></i>
        </a>
        <a href="https://www.linkedin.com/school/supinfo-ecoleinformatique/">
          <i className="fa-brands fa-linkedin"></i>
        </a>
        <a href="https://www.supinfo.com" className={styles["supinfo"]}>
          <i className={styles["supinfo-logo"]}></i>
        </a>
      </div>

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

      <p>© 2025 Tous droits réservés.</p>
    </footer>
  );
};

export default Footer;
