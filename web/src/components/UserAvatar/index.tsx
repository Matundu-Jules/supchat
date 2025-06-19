import React from "react";
import { getAvatarUrl } from "@utils/avatarUtils";
import styles from "./UserAvatar.module.scss";

interface UserAvatarProps {
  /**
   * URL ou chemin de l'avatar
   */
  avatar?: string | null;

  /**
   * Nom d'utilisateur pour le fallback
   */
  username?: string;

  /**
   * Email pour le fallback si pas de username
   */
  email?: string;

  /**
   * Taille de l'avatar
   */
  size?: "small" | "medium" | "large" | "custom";

  /**
   * Hauteur personnalisée (si size='custom')
   */
  height?: string;

  /**
   * Classe CSS supplémentaire
   */
  className?: string;

  /**
   * Si true, ajoute un timestamp pour forcer le rechargement
   */
  bustCache?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  avatar,
  username,
  email,
  size = "medium",
  height,
  className = "",
  bustCache = false,
}) => {
  // Détermine la lettre de fallback
  const getFallbackLetter = () => {
    if (username && username.trim()) {
      return username.charAt(0).toUpperCase();
    }
    if (email && email.trim()) {
      return email.charAt(0).toUpperCase();
    }
    return "?";
  };

  // Classes CSS pour la taille
  const sizeClass = size === "custom" ? "" : styles[`size-${size}`];

  // Style inline pour taille personnalisée
  const customStyle =
    size === "custom" && height ? { height, width: height } : {};

  const avatarUrl = avatar ? getAvatarUrl(avatar, bustCache) : null;
  return (
    <div
      className={`${styles["userAvatar"]} ${sizeClass} ${className}`}
      style={customStyle}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`Avatar de ${username || email || "utilisateur"}`}
          className={styles["avatarImage"]}
        />
      ) : (
        <div className={styles["avatarPlaceholder"]}>{getFallbackLetter()}</div>
      )}
    </div>
  );
};

export default UserAvatar;
