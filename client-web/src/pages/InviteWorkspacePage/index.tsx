import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@store/store";
import { joinWorkspace } from "@services/workspaceApi";

const InvitePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const user = useSelector((state: RootState) => state.auth.user);
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);
  const navigate = useNavigate();
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Pas connecté : rien à faire ici
      } else if (id) {
        // Connecté, on tente de rejoindre le workspace
        joinWorkspace(id)
          .then(() => {
            setInviteSuccess("Vous avez rejoint l'espace de travail !");
            setTimeout(() => navigate("/workspace"), 1200);
          })
          .catch((err) => {
            setInviteError(
              err?.message ||
                "Erreur lors de la tentative de rejoindre l'espace. Le lien d'invitation est peut-être expiré ou invalide."
            );
          });
      } else {
        setInviteError("Lien d'invitation invalide ou manquant.");
      }
    }
  }, [user, isLoading, navigate, id]);

  if (isLoading) {
    return <p>Chargement...</p>;
  }

  if (!user) {
    return (
      <div style={{ maxWidth: 400, margin: "4rem auto", textAlign: "center" }}>
        <h2>Invitation à rejoindre un espace</h2>
        <p>Pour rejoindre cet espace, vous devez avoir un compte.</p>
        <p>
          <b>Vous avez déjà un compte ?</b>
        </p>
        <button
          style={{ margin: "1rem", padding: "0.7rem 1.5rem", fontWeight: 600 }}
          onClick={() =>
            navigate("/login", { state: { redirect: `/invite/${id}` } })
          }
        >
          Se connecter
        </button>
        <p>
          <b>Vous n'avez pas de compte ?</b>
        </p>
        <button
          style={{ margin: "1rem", padding: "0.7rem 1.5rem", fontWeight: 600 }}
          onClick={() =>
            navigate("/register", { state: { redirect: `/invite/${id}` } })
          }
        >
          Créer un compte
        </button>
        <p style={{ color: "#c00", marginTop: "2rem" }}>
          Vous devez être connecté pour accepter l'invitation.
        </p>
        {inviteError && (
          <div style={{ color: "#c00", marginTop: "1.2rem" }}>
            {inviteError}
          </div>
        )}
      </div>
    );
  }

  // Utilisateur connecté : affichage du résultat
  return (
    <div style={{ maxWidth: 400, margin: "4rem auto", textAlign: "center" }}>
      <h2>Traitement de l'invitation...</h2>
      {inviteSuccess && (
        <div style={{ color: "#22c55e", marginTop: "1.2rem" }}>
          {inviteSuccess}
        </div>
      )}
      {inviteError && (
        <div style={{ color: "#c00", marginTop: "1.2rem" }}>{inviteError}</div>
      )}
    </div>
  );
};

export default InvitePage;
