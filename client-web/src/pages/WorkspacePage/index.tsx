import React from "react";
import WorkspaceCreateForm from "@components/Workspace/WorkspaceCreateForm";
import WorkspaceList from "@components/Workspace/WorkspaceList";
import styles from "./WorkspacePage.module.scss";
import { useWorkspacePageLogic } from "@hooks/useWorkspacePageLogic";
import { useSelector } from "react-redux";
import type { RootState } from "@store/store";

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
    inviteEmail,
    setInviteEmail,
    editModal,
    setEditModal,
    handleAccess,
    handleInviteClick,
    handleInviteSubmit,
    handleEdit,
    handleEditSubmit,
    handleDelete,
    editErrors,
    inviteError,
    inviteSuccess,
    setInviteSuccess,
  } = useWorkspacePageLogic();

  return (
    <section className={styles["workspaceSection"]}>
      <h1 className={styles["title"]}>Espaces de travail</h1>
      <button
        className={styles["createButton"]}
        onClick={() => setShowModal(true)}
      >
        Créer un workspace
      </button>

      {showModal && (
        <div className={styles["modalOverlay"]}>
          <div className={styles["modalContent"]}>
            <button
              onClick={() => setShowModal(false)}
              className={styles["closeButton"]}
              aria-label="Fermer"
            >
              x
            </button>
            <WorkspaceCreateForm
              onCreated={() => {
                setShowModal(false);
                fetchWorkspaces();
              }}
              onCreate={handleCreateWorkspace}
            />
          </div>
        </div>
      )}

      {inviteModal && (
        <div className={styles["modalOverlay"]}>
          <div className={styles["modalContent"]}>
            <button
              onClick={() => setInviteModal(null)}
              className={styles["closeButton"]}
              aria-label="Fermer"
            >
              ×
            </button>
            <h2>Inviter dans {inviteModal.name}</h2>
            <form
              onSubmit={handleInviteSubmit}
              className={styles["inviteForm"]}
            >
              <input
                type="email"
                placeholder="Email du membre"
                value={inviteEmail}
                onChange={(e) => {
                  setInviteEmail(e.target.value);
                  if (inviteSuccess) setInviteSuccess(null);
                }}
                required
                className={
                  styles["input"] +
                  (inviteError ? " " + styles["inputError"] : "")
                }
              />
              <button type="submit" className={styles["submitButton"]}>
                Envoyer l'invitation
              </button>
            </form>
            {inviteError && (
              <div className={styles["error"]}>{inviteError}</div>
            )}
            {inviteSuccess && !inviteError && (
              <div className={styles["success"]}>{inviteSuccess}</div>
            )}
          </div>
        </div>
      )}

      {editModal && (
        <div className={styles["modalOverlay"]}>
          <div className={styles["modalContent"]}>
            <button
              onClick={() => setEditModal(null)}
              className={styles["closeButton"]}
              aria-label="Fermer"
            >
              ×
            </button>
            <h2>Modifier {editModal.name}</h2>
            <form onSubmit={handleEditSubmit} className={styles["editForm"]}>
              <input
                type="text"
                name="name"
                defaultValue={editModal.name}
                className={
                  styles["input-name"] +
                  (editErrors?.name ? " " + styles["inputError"] : "")
                }
                required
              />
              {editErrors?.name && (
                <div className={styles["error"]}>{editErrors.name}</div>
              )}
              <input
                type="text"
                name="description"
                defaultValue={editModal.description}
                className={
                  styles["input-description"] +
                  (editErrors?.description ? " " + styles["inputError"] : "")
                }
              />
              {editErrors?.description && (
                <div className={styles["error"]}>{editErrors.description}</div>
              )}
              <label className={styles["checkboxLabel"]}>
                <input
                  type="checkbox"
                  name="isPublic"
                  defaultChecked={editModal.isPublic}
                />
                Espace public
              </label>
              <button type="submit" className={styles["submitButton"]}>
                Enregistrer
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p>Chargement...</p>
      ) : error ? (
        <p className={styles["error"]}>{error}</p>
      ) : (
        <WorkspaceList
          workspaces={workspaces}
          user={user ?? undefined}
          onAccess={handleAccess}
          onInvite={handleInviteClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </section>
  );
};

export default WorkspacesPage;
