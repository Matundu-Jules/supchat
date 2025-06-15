import React, { useEffect, useState } from "react";
import {
  getJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
} from "@services/workspaceApi";
import styles from "./JoinRequestsManager.module.scss";

interface JoinRequest {
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
}

const JoinRequestsManager: React.FC<JoinRequestsManagerProps> = ({
  workspaceId,
  isOwnerOrAdmin,
}) => {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    if (!isOwnerOrAdmin) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getJoinRequests(workspaceId);
      setRequests(data);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des demandes");
    } finally {
      setLoading(false);
    }
  };
  const handleApprove = async (requestUserId: string) => {
    try {
      console.log("🔍 Frontend - Approbation demande:", {
        workspaceId,
        requestUserId,
      });
      await approveJoinRequest(workspaceId, requestUserId);
      await fetchRequests(); // Rafraîchir la liste
      alert("Demande approuvée avec succès !");
    } catch (err: any) {
      console.error("❌ Frontend - Erreur approbation:", err);
      alert(err.message || "Erreur lors de l'approbation");
    }
  };

  const handleReject = async (requestUserId: string) => {
    try {
      await rejectJoinRequest(workspaceId, requestUserId);
      await fetchRequests(); // Rafraîchir la liste
      alert("Demande rejetée.");
    } catch (err: any) {
      alert(err.message || "Erreur lors du rejet");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [workspaceId, isOwnerOrAdmin]);

  if (!isOwnerOrAdmin) {
    return null;
  }

  if (loading) {
    return <div>Chargement des demandes...</div>;
  }

  if (error) {
    return <div className={styles["error"]}>Erreur: {error}</div>;
  }

  if (requests.length === 0) {
    return (
      <div className={styles["container"]}>
        <h3>Demandes de rejoindre</h3>
        <p className={styles["empty"]}>Aucune demande en attente.</p>
      </div>
    );
  }

  return (
    <div className={styles["container"]}>
      <h3>Demandes de rejoindre ({requests.length})</h3>
      <div className={styles["requestsList"]}>
        {requests.map((request) => (
          <div key={request.userId._id} className={styles["requestItem"]}>
            <div className={styles["userInfo"]}>
              <strong>{request.userId.name || request.userId.email}</strong>
              <span className={styles["email"]}>{request.userId.email}</span>
              <span className={styles["date"]}>
                {new Date(request.requestedAt).toLocaleDateString("fr-FR")}
              </span>
            </div>
            {request.message && (
              <div className={styles["message"]}>"{request.message}"</div>
            )}
            <div className={styles["actions"]}>
              <button
                onClick={() => handleApprove(request.userId._id)}
                className={`${styles["button"]} ${styles["approve"]}`}
              >
                Accepter
              </button>
              <button
                onClick={() => handleReject(request.userId._id)}
                className={`${styles["button"]} ${styles["reject"]}`}
              >
                Rejeter
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JoinRequestsManager;
