import React, { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@store/store";
import { useReactions } from "@hooks/useReactions";
import styles from "./ReactionBar.module.scss";

interface ReactionBarProps {
  messageId: string;
}

const ReactionBar: React.FC<ReactionBarProps> = ({ messageId }) => {
  const { reactions, react } = useReactions(messageId);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [isAnimating, setIsAnimating] = useState(false);

  // Compter les likes (emoji 👍)
  const likes = reactions.filter((r: any) => r.emoji === "👍");
  const likeCount = likes.length;

  // Vérifier si l'utilisateur actuel a liké
  const userHasLiked = currentUser
    ? likes.some((r: any) => {
        const userId = (currentUser as any).id || (currentUser as any)._id;
        return r.userId === userId;
      })
    : false;

  // Grouper les autres réactions (pour rétrocompatibilité)
  const otherReactions: Record<string, number> = {};
  reactions.forEach((r: any) => {
    if (r.emoji !== "👍") {
      otherReactions[r.emoji] = (otherReactions[r.emoji] || 0) + 1;
    }
  });
  const handleLikeClick = async () => {
    if (isAnimating) return;

    setIsAnimating(true);

    try {
      await react("👍");
    } catch (error) {
      console.error("Erreur lors de la gestion du like:", error);
    }

    // Réinitialiser l'animation après un délai
    setTimeout(() => {
      setIsAnimating(false);
    }, 400);
  };

  return (
    <div className={styles["bar"]}>
      {/* Bouton de like principal */}
      <button
        type="button"
        className={`${styles["likeBtn"]} ${
          userHasLiked ? styles["liked"] : ""
        } ${
          isAnimating
            ? userHasLiked
              ? styles["unanimating"]
              : styles["animating"]
            : ""
        }`}
        onClick={handleLikeClick}
        title={userHasLiked ? "Retirer le like" : "Liker ce message"}
      >
        <span className={styles["likeIcon"]}>{userHasLiked ? "❤️" : "🤍"}</span>
        {likeCount > 0 && (
          <span className={styles["likeCount"]}>{likeCount}</span>
        )}
      </button>

      {/* Autres réactions pour rétrocompatibilité */}
      {Object.entries(otherReactions).map(([emoji, count]) => (
        <button
          key={emoji}
          type="button"
          className={styles["btn"]}
          onClick={() => react(emoji)}
          title={`Réagir avec ${emoji}`}
        >
          {emoji} {count}
        </button>
      ))}

      {/* Bouton d'ajout d'autres réactions */}
      <button
        type="button"
        className={styles["addBtn"]}
        onClick={() => react("👍")}
        title="Ajouter une réaction"
      >
        +
      </button>
    </div>
  );
};

export default ReactionBar;
