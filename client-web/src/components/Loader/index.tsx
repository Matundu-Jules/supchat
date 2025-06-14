import React from "react";
import styles from "./Loader.module.scss";

interface LoaderProps {
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ className }) => {
  return (
    <div className={`${styles["loader"]} ${className || ""}`.trim()} role="status" aria-label="Chargement">
      <div className={styles["spinner"]} />
    </div>
  );
};

export default Loader;
