import React, { useState } from "react";
import styles from "./GuestInviteManager.module.scss";
import { inviteGuestToWorkspace } from "@services/workspaceApi";

interface Channel {
  _id: string;
  name: string;
  type: string;
}

interface GuestInviteManagerProps {
  workspaceId: string;
  channels: Channel[];
  onInviteSuccess?: () => void;
}

const GuestInviteManager: React.FC<GuestInviteManagerProps> = ({
  workspaceId,
  channels,
  onInviteSuccess,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChannelToggle = (channelId: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channelId)
        ? prev.filter((id) => id !== channelId)
        : [...prev, channelId]
    );
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || selectedChannels.length === 0) {
      setError("Veuillez saisir un email et sélectionner au moins un canal");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await inviteGuestToWorkspace(workspaceId, email, selectedChannels);

      setSuccess("Invité ajouté avec succès");
      setEmail("");
      setSelectedChannels([]);
      onInviteSuccess?.();

      // Fermer le modal après 2 secondes
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(null);
      }, 2000);
    } catch (err: any) {
      console.error("Erreur lors de l'invitation d'invité:", err);
      const msg = err?.message || "";
      if (
        msg.includes("utilisateur") ||
        msg.includes("aucun utilisateur inscrit") ||
        msg.toLowerCase().includes("n'existe")
      ) {
        setError(
          "Cette adresse email ne correspond à aucun utilisateur inscrit. Seuls les utilisateurs ayant un compte peuvent être invités."
        );
      } else {
        setError(msg || "Erreur lors de l'invitation");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setError(null);
    setSuccess(null);
    setEmail("");
    setSelectedChannels([]);
  };
  return (
    <>
      <button className={styles["openButton"]} onClick={() => setIsOpen(true)}>
        Inviter un invité
      </button>

      {isOpen && (
        <div className={styles["overlay"]}>
          <div className={styles["modal"]}>
            <div className={styles["header"]}>
              <h3>Inviter un invité au workspace</h3>
              <button className={styles["closeButton"]} onClick={handleClose}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles["form"]}>
              <div className={styles["field"]}>
                <label htmlFor="email">Email de l'invité :</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@email.com"
                  required
                />
              </div>

              <div className={styles["field"]}>
                <label>Canaux autorisés :</label>
                <div className={styles["channelList"]}>
                  {channels.map((channel) => (
                    <label key={channel._id} className={styles["channelItem"]}>
                      <input
                        type="checkbox"
                        checked={selectedChannels.includes(channel._id)}
                        onChange={() => handleChannelToggle(channel._id)}
                      />
                      <span className={styles["channelName"]}>
                        #{channel.name}
                        <span className={styles["channelType"]}>
                          ({channel.type})
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {error && <div className={styles["error"]}>{error}</div>}
              {success && <div className={styles["success"]}>{success}</div>}

              <div className={styles["actions"]}>
                <button
                  type="button"
                  onClick={handleClose}
                  className={styles["cancelButton"]}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading || !email || selectedChannels.length === 0}
                  className={styles["submitButton"]}
                >
                  {loading ? "Invitation..." : "Inviter"}
                </button>
              </div>
            </form>

            <div className={styles["info"]}>
              <h4>ℹ️ À propos des invités :</h4>
              <ul>
                <li>Les invités n'ont accès qu'aux canaux sélectionnés</li>
                <li>Ils ne peuvent pas voir la liste complète des membres</li>
                <li>Ils ne peuvent pas créer de nouveaux canaux</li>
                <li>
                  Ils ne peuvent pas voir les canaux publics non autorisés
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GuestInviteManager;
