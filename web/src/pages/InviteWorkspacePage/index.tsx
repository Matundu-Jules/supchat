import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@store/store";
import { joinWorkspace, getWorkspacePublicInfo } from "@services/workspaceApi";
import Loader from "@components/Loader";

const InviteWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const user = useSelector((state: RootState) => state.auth.user);
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);
  const navigate = useNavigate();
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [forceShow, setForceShow] = useState(false);
  const [publicInfo, setPublicInfo] = useState<{
    name: string;
    description?: string;
  } | null>(null);
  const [publicInfoLoading, setPublicInfoLoading] = useState(true);
  const [publicInfoError, setPublicInfoError] = useState<string | null>(null);
  // Récupère l'email invité depuis la session (si présent)
  const [invitedEmail, setInvitedEmail] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    // On peut stocker l'email dans sessionStorage après inscription/connexion
    const email = sessionStorage.getItem("inviteEmail") || undefined;
    setInvitedEmail(email);
  }, []);

  // Récupère les infos publiques du workspace dès le chargement
  useEffect(() => {
    if (id) {
      setPublicInfoLoading(true);
      getWorkspacePublicInfo(id, invitedEmail)
        .then((data) => {
          setPublicInfo({ name: data.name, description: data.description });
          setPublicInfoError(null);
        })
        .catch((err) => {
          setPublicInfoError(
            err.message || "Workspace introuvable ou lien invalide."
          );
        })
        .finally(() => setPublicInfoLoading(false));
    }
  }, [id, invitedEmail]);

  // Sécurité : si le loader dure trop longtemps, on affiche l'UI d'invitation
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => setForceShow(true), 3500);
      return () => clearTimeout(timeout);
    } else {
      setForceShow(false);
    }
  }, [isLoading]);

  const handleLoginClick = () => {
    sessionStorage.setItem("redirectAfterAuth", `/invite/${id}`);
    navigate("/login", { state: { redirect: `/invite/${id}` } });
  };
  const handleRegisterClick = () => {
    sessionStorage.setItem("redirectAfterAuth", `/invite/${id}`);
    navigate("/register", { state: { redirect: `/invite/${id}` } });
  };

  useEffect(() => {
    if (!isLoading && user && id) {
      joinWorkspace(id)
        .then(() => {
          setInviteSuccess("Vous avez rejoint l'espace !");
          setTimeout(() => navigate(`/workspaces/${id}`), 1200);
        })
        .catch((err) => {
          if (err.message?.includes("déjà membre")) {
            navigate(`/workspaces/${id}`);
          } else {
            setInviteError(
              err?.message ||
                "Erreur lors de la tentative de rejoindre l'espace. Le lien d'invitation est peut-être expiré ou invalide."
            );
          }
        });
    }
  }, [user, isLoading, id, navigate]);

  // Redirection automatique si non connecté
  useEffect(() => {
    if (!isLoading && !user) {
      // Affiche un message avant de rediriger
      setTimeout(() => {
        navigate("/login", { state: { redirect: `/invite/${id}` } });
      }, 1800);
    }
  }, [isLoading, user, navigate, id]);

  if (!isLoading && !user) {
    return (
      <div style={{ maxWidth: 400, margin: "4rem auto", textAlign: "center" }}>
        <h2>Invitation à rejoindre un espace</h2>
        <p>Vous devez être connecté pour accepter l'invitation.</p>
        <p>Redirection vers la page de connexion...</p>
      </div>
    );
  }

  // Affichage du loader uniquement si on n'est pas forcé d'afficher l'UI ou si publicInfo est en chargement
  if ((isLoading && !forceShow) || publicInfoLoading) {
    return <Loader />;
  }

  if (publicInfoError) {
    return (
      <div style={{ maxWidth: 400, margin: "4rem auto", textAlign: "center" }}>
        <h2>Invitation à rejoindre un espace</h2>
        <p style={{ color: "#c00" }}>{publicInfoError}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ maxWidth: 400, margin: "4rem auto", textAlign: "center" }}>
        <h2>
          Invitation à rejoindre&nbsp;:{" "}
          <span style={{ color: "#007bff" }}>
            {publicInfo?.name || "Espace"}
          </span>
        </h2>
        {publicInfo?.description && (
          <p style={{ color: "#555", fontStyle: "italic" }}>
            {publicInfo.description}
          </p>
        )}
        <p>Pour rejoindre cet espace, vous devez avoir un compte.</p>
        <p>
          <b>Vous avez déjà un compte ?</b>
        </p>
        <button
          style={{ margin: "1rem", padding: "0.7rem 1.5rem", fontWeight: 600 }}
          onClick={handleLoginClick}
        >
          Se connecter
        </button>
        <p>
          <b>Vous n'avez pas de compte ?</b>
        </p>
        <button
          style={{ margin: "1rem", padding: "0.7rem 1.5rem", fontWeight: 600 }}
          onClick={handleRegisterClick}
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
      <h2>
        Traitement de l'invitation pour&nbsp;:{" "}
        <span style={{ color: "#007bff" }}>{publicInfo?.name || "Espace"}</span>
      </h2>
      {publicInfo?.description && (
        <p style={{ color: "#555", fontStyle: "italic" }}>
          {publicInfo.description}
        </p>
      )}
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

export default InviteWorkspacePage;
