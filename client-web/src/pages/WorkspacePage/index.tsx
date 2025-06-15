import React, { useState } from "react";
import WorkspaceList from "@components/Workspace/WorkspaceList";
import Loader from "@components/Loader";
import styles from "./WorkspacePage.module.scss";
import { useWorkspacePageLogic } from "@hooks/useWorkspacePageLogic";
import { useSelector } from "react-redux";
import type { RootState } from "@store/store";
import EditWorkspaceModal from "@components/Workspace/EditWorkspaceModal";
import CreateWorkspaceModal from "@components/Workspace/CreateWorkspaceModal";
import InviteWorkspaceModal from "@components/Workspace/InviteWorkspaceModal";

const WorkspacesPage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const {
    workspaces,
    loading,
    error,
    fetchWorkspaces,
    handleCreateWorkspace,
    showModal,
    setShowModal,
    inviteModal,
    setInviteModal,
    editModal,
    setEditModal,
    handleAccess,
    handleInviteClick,
    handleInvite,
    handleEdit,
    handleEditSubmit,
    handleDelete,
    handleRequestJoin,
    inviteError,
    inviteSuccess,
    setInviteSuccess,
  } = useWorkspacePageLogic();
  const [search, setSearch] = useState("");
  // Fonction pour gérer l'invitation avec la nouvelle modale
  const handleInviteModalSubmit = async (email: string) => {
    if (!inviteModal) return;

    console.log("Inviting:", email, "to workspace:", inviteModal.id);

    try {
      await handleInvite(inviteModal.id, email);
      setInviteSuccess("Invitation envoyée avec succès !");
    } catch (err: any) {
      console.error("Invitation error:", err);
      const msg = err?.response?.data?.message || err?.message || "";
      if (
        msg === "USER_NOT_FOUND" ||
        msg.includes("utilisateur") ||
        msg.toLowerCase().includes("n'existe")
      ) {
        // Cette erreur sera affichée dans la modale
        throw new Error(
          "L'adresse e-mail saisie ne correspond à aucun utilisateur inscrit. L'invitation n'a pas été envoyée."
        );
      } else {
        throw new Error(msg || "Erreur lors de l'invitation");
      }
    }
  };

  const handleClearInviteMessages = () => {
    if (inviteSuccess) setInviteSuccess(null);
  };

  return (
    <section className={styles["workspaceSection"]}>
      <h1 className={styles["title"]}>Espaces de travail</h1>
      <button
        className={styles["createButton"]}
        onClick={() => setShowModal(true)}
      >
        Créer un workspace
      </button>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher..."
        className={styles["searchInput"]}
      />{" "}
      {showModal && (
        <CreateWorkspaceModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={async (formData) => {
            await handleCreateWorkspace(formData);
            setShowModal(false);
            fetchWorkspaces();
          }}
          loading={false}
        />
      )}{" "}
      {inviteModal && (
        <InviteWorkspaceModal
          workspace={{
            _id: inviteModal.id,
            name: inviteModal.name,
          }}
          isOpen={!!inviteModal}
          onClose={() => setInviteModal(null)}
          onInvite={handleInviteModalSubmit}
          loading={false}
          error={inviteError}
          success={inviteSuccess}
          onClearMessages={handleClearInviteMessages}
        />
      )}{" "}
      {editModal && (
        <EditWorkspaceModal
          workspace={{
            _id: editModal.id,
            name: editModal.name,
            description: editModal.description,
            isPublic: editModal.isPublic,
          }}
          isOpen={!!editModal}
          onClose={() => setEditModal(null)}
          onSave={(formData) => {
            handleEditSubmit({
              preventDefault: () => {},
              target: {
                name: { value: formData.name },
                description: { value: formData.description || "" },
                isPublic: { checked: formData.isPublic },
              },
            } as any);
          }}
          loading={false}
        />
      )}
      {loading ? (
        <Loader />
      ) : error ? (
        <p className={styles["error"]}>{error}</p>
      ) : (
        <WorkspaceList
          workspaces={workspaces}
          filter={search}
          user={user ?? undefined}
          onAccess={handleAccess}
          onInvite={handleInviteClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRequestJoin={handleRequestJoin}
        />
      )}
    </section>
  );
};

export default WorkspacesPage;
