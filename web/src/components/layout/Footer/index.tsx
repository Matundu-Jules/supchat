// src/components/Footer/Footer.tsx

import { useSelector } from "react-redux";
import { RootState } from "@store/store";
import styles from "./Footer.module.scss";

type FooterProps = {
  theme: "light" | "dark";
  toggleTheme: () => void;
};

const Footer: React.FC<FooterProps> = ({ theme, toggleTheme }) => {
  const user = useSelector((state: RootState) => state.auth.user);

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
      </div>{" "}
      {/* Le bouton de thème est maintenant directement dans les pages login/register 
          pour une meilleure visibilité et accessibilité */}
      <p>© 2025 Tous droits réservés.</p>
    </footer>
  );
};

export default Footer;
