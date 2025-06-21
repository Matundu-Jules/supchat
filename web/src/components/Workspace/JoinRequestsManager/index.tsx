import React, { useEffect, useState } from "react";
import {
  getJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
} from "@services/workspaceApi";
import UserAvatar from "@components/user/UserAvatar";
import styles from "./JoinRequestsManager.module.scss";

interface JoinRequest {
  userId: {
    _id: string;
    name?: string;
    email: string;
    avatar?: string;
  } | null; // userId peut être null si l'utilisateur a été supprimé
  requestedAt: string;
  message: string;
}

interface ValidJoinRequest {
  userId: {
    _id: string;
    name?: string;
    email: string;
    avatar?: string;
  };
  requestedAt: string;
  message: string;
}

interface JoinRequestsManagerProps {
  workspaceId: string;
  isOwnerOrAdmin: boolean;
  onRequestsChange?: () => void; // Callback pour notifier les changements
}

const JoinRequestsManager: React.FC<JoinRequestsManagerProps> = ({
  workspaceId,
  isOwnerOrAdmin,
  onRequestsChange,
}) => {
  const [requests, setRequests] = useState<ValidJoinRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fetchRequests = async () => {
    if (!isOwnerOrAdmin) return;

    setLoading(true);
    // Ne pas réinitialiser error ici pour ne pas effacer les messages de succès
    try {
      const data = await getJoinRequests(workspaceId);
      // Filtrer les demandes avec des utilisateurs supprimés (userId null)
      const validRequests = data.filter(
        (request: JoinRequest): request is ValidJoinRequest =>
          request.userId !== null && request.userId._id !== undefined
      );
      setRequests(validRequests);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des demandes");
    } finally {
      setLoading(false);
    }
  };
  const handleApprove = async (requestUserId: string) => {
    setApproving(requestUserId);
    setError(null);
    try {
      await approveJoinRequest(workspaceId, requestUserId);
      setSuccessMessage("Demande approuvée avec succès !");
      await fetchRequests(); // Rafraîchir la liste locale

      // Retarder l'appel du callback parent pour ne pas réinitialiser l'état
      setTimeout(() => {
        onRequestsChange?.(); // Notifier le parent des changements
      }, 100);
    } catch (err: any) {
      console.error("Erreur lors de l'approbation:", err);
      setError(err.message || "Erreur lors de l'approbation");
    } finally {
      setApproving(null);
    }
  };
  const handleReject = async (requestUserId: string) => {
    setRejecting(requestUserId);
    setError(null);
    try {
      await rejectJoinRequest(workspaceId, requestUserId);
      setSuccessMessage("Demande rejetée avec succès.");
      await fetchRequests(); // Rafraîchir la liste locale

      // Retarder l'appel du callback parent pour ne pas réinitialiser l'état
      setTimeout(() => {
        onRequestsChange?.(); // Notifier le parent des changements
      }, 100);
    } catch (err: any) {
      console.error("Erreur lors du rejet:", err);
      setError(err.message || "Erreur lors du rejet");
    } finally {
      setRejecting(null);
    }
  };
  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, isOwnerOrAdmin]);
  // Effacer les messages de succès après 5 secondes
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  if (!isOwnerOrAdmin) {
    return null;
  }
  if (loading) {
    return (
      <div className={styles["container"]}>
        <h3>Demandes de rejoindre</h3>
        {/* Messages de succès/erreur */}
        {successMessage && (
          <div className={styles["success"]}>
            <i className="fa-solid fa-check-circle"></i>
            {successMessage}
          </div>
        )}
        {error && (
          <div className={styles["error"]}>
            <i className="fa-solid fa-exclamation-circle"></i>
            {error}
          </div>
        )}
        <div>Chargement des demandes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles["container"]}>
        <h3>Demandes de rejoindre</h3>
        <div className={styles["error"]}>Erreur: {error}</div>
      </div>
    );
  }
  if (requests.length === 0) {
    return (
      <div className={styles["container"]}>
        <h3>Demandes de rejoindre</h3>
        {/* Messages de succès/erreur */}
        {successMessage && (
          <div className={styles["success"]}>
            <i className="fa-solid fa-check-circle"></i>
            {successMessage}
          </div>
        )}
        {error && (
          <div className={styles["error"]}>
            <i className="fa-solid fa-exclamation-circle"></i>
            {error}
          </div>
        )}
        <p className={styles["empty"]}>Aucune demande en attente.</p>
      </div>
    );
  }
  return (
    <div className={styles["container"]}>
      <h3>Demandes de rejoindre ({requests.length})</h3>
      {/* Messages de succès/erreur */}
      {successMessage && (
        <div className={styles["success"]}>
          <i className="fa-solid fa-check-circle"></i>
          {successMessage}
        </div>
      )}
      {error && (
        <div className={styles["error"]}>
          <i className="fa-solid fa-exclamation-circle"></i>
          {error}
        </div>
      )}{" "}
      <div className={styles["requestsList"]}>
        {requests.map((request) => (
          <div key={request.userId._id} className={styles["requestItem"]}>
            <div className={styles["userInfo"]}>
              {/* Avatar de l'utilisateur */}
              <UserAvatar
                avatar={request.userId.avatar}
                username={request.userId.name}
                email={request.userId.email}
                height="3.2rem"
                size="custom"
                className={styles["requestAvatar"]}
              />

              <div className={styles["userDetails"]}>
                <strong>{request.userId.name || request.userId.email}</strong>
                <span className={styles["email"]}>{request.userId.email}</span>
                <span className={styles["date"]}>
                  {new Date(request.requestedAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
            </div>
            {request.message && (
              <div className={styles["message"]}>"{request.message}"</div>
            )}
            <div className={styles["actions"]}>
              <button
                onClick={() => handleApprove(request.userId._id)}
                className={`${styles["button"]} ${styles["approve"]}`}
                disabled={
                  approving === request.userId._id ||
                  rejecting === request.userId._id
                }
              >
                {approving === request.userId._id ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Approbation...
                  </>
                ) : (
                  "Accepter"
                )}
              </button>
              <button
                onClick={() => handleReject(request.userId._id)}
                className={`${styles["button"]} ${styles["reject"]}`}
                disabled={
                  approving === request.userId._id ||
                  rejecting === request.userId._id
                }
              >
                {rejecting === request.userId._id ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Rejet...
                  </>
                ) : (
                  "Rejeter"
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JoinRequestsManager;
