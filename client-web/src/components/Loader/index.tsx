import React from "react";
import styles from "./Loader.module.scss";

interface LoaderProps {
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ className }) => {
  return (
    <div
      className={`${styles["loader"]} ${className || ""}`.trim()}
      role="status"
      aria-label="Chargement"
    >
      <div className={styles["logoContainer"]}>
        <img
          src="/assets/images/logo-supchat-simplified-without-text-primary.png"
          alt="SupChat Logo"
          className={styles["logo"]}
        />
        <div className={styles["loadingText"]}>SUPCHAT</div>
        <div className={styles["loadingDots"]}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default Loader;
