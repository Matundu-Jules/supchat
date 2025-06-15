// src/components/PasswordStatus/index.tsx

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@store/store";
import styles from "./PasswordStatus.module.scss";

const PasswordStatus: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  // Ne pas afficher si l'utilisateur n'est pas connecté
  if (!user) return null;

  // Ne pas afficher si l'utilisateur a un mot de passe
  const hasPassword = user.hasPassword ?? true;
  if (hasPassword) return null;

  // Afficher seulement si l'utilisateur n'a pas de mot de passe (connexion sociale)
  return (
    <div className={styles["passwordStatus"]}>
      <div className={styles["notice"]}>
        <i className="fa-solid fa-info-circle"></i>
        <span>
          Vous vous êtes connecté via {user.googleId ? "Google" : "Facebook"}.
          <a href="/settings">Définissez un mot de passe</a> pour vous connecter
          avec votre email.
        </span>
      </div>
    </div>
  );
};

export default PasswordStatus;
