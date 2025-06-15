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
    handleInviteModalSubmit,
    handleClearInviteMessages,
    handleEdit,
    handleEditWorkspace,
    handleDelete,
    handleRequestJoin,
    inviteError,
    inviteSuccess,
    setInviteSuccess,
    setInviteError,
    requestJoinLoading,
    handleJoin,
  } = useWorkspacePageLogic();
  const [search, setSearch] = useState("");
  const [acceptInviteLoading, setAcceptInviteLoading] = useState<string | null>(
    null
  );
  const [acceptInviteError, setAcceptInviteError] = useState<string | null>(
    null
  );
  const [acceptInviteSuccess, setAcceptInviteSuccess] = useState<string | null>(
    null
  );

  // Organiser les workspaces en catégories
  const filteredWorkspaces = workspaces.filter(
    (workspace) =>
      workspace.name.toLowerCase().includes(search.toLowerCase()) ||
      (workspace.description || "").toLowerCase().includes(search.toLowerCase())
  );

  // Mes workspaces (que j'ai créés)
  const ownedWorkspaces = filteredWorkspaces.filter(
    (ws) => ws.userStatus?.isOwner
  );

  // Workspaces dont je suis membre (mais pas propriétaire)
  const memberWorkspaces = filteredWorkspaces.filter(
    (ws) => ws.userStatus?.isMember && !ws.userStatus?.isOwner
  );
  // Workspaces publics disponibles (que je n'ai pas encore rejoints)
  const availableWorkspaces = filteredWorkspaces.filter(
    (ws) => ws.isPublic && !ws.userStatus?.isMember && !ws.userStatus?.isOwner
  );

  // Handler pour accepter une invitation à un workspace
  const handleAcceptInvite = async (workspace: any) => {
    setAcceptInviteLoading(workspace._id);
    setAcceptInviteError(null);
    setAcceptInviteSuccess(null);
    try {
      await handleJoin(workspace._id);
      setAcceptInviteSuccess(
        `Vous avez rejoint le workspace "${workspace.name}" !`
      );
      fetchWorkspaces();
    } catch (err: any) {
      setAcceptInviteError(err?.message || "Erreur lors de la jointure");
    } finally {
      setAcceptInviteLoading(null);
    }
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
        placeholder="Rechercher un espace de travail..."
        className={styles["searchInput"]}
      />
      {/* Messages de notification */}
      {(inviteSuccess ||
        inviteError ||
        acceptInviteSuccess ||
        acceptInviteError) && (
        <div className={styles["notification"]}>
          {inviteSuccess && (
            <div className={styles["notificationSuccess"]}>
              <i className="fa-solid fa-check-circle"></i>
              {inviteSuccess}
              <button
                onClick={() => setInviteSuccess(null)}
                className={styles["notificationClose"]}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
          )}
          {inviteError && (
            <div className={styles["notificationError"]}>
              <i className="fa-solid fa-exclamation-circle"></i>
              {inviteError}
              <button
                onClick={() => setInviteError(null)}
                className={styles["notificationClose"]}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
          )}
          {acceptInviteSuccess && (
            <div className={styles["notificationSuccess"]}>
              <i className="fa-solid fa-check-circle"></i>
              {acceptInviteSuccess}
              <button
                onClick={() => setAcceptInviteSuccess(null)}
                className={styles["notificationClose"]}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
          )}
          {acceptInviteError && (
            <div className={styles["notificationError"]}>
              <i className="fa-solid fa-exclamation-circle"></i>
              {acceptInviteError}
              <button
                onClick={() => setAcceptInviteError(null)}
                className={styles["notificationClose"]}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
          )}
        </div>
      )}{" "}
      {/* Modales */}
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
          onSave={async (formData) => {
            try {
              await handleEditWorkspace(formData);
              setEditModal(null);
            } catch (error) {
              console.error("Erreur lors de la modification:", error);
            }
          }}
          loading={false}
        />
      )}
      {loading ? (
        <Loader />
      ) : error ? (
        <p className={styles["error"]}>{error}</p>
      ) : (
        <div className={styles["workspaceSections"]}>
          {/* Mes Workspaces - Ceux que j'ai créés */}
          {ownedWorkspaces.length > 0 && (
            <section className={styles["workspaceCategory"]}>
              <h2 className={styles["categoryTitle"]}>
                <i className="fa-solid fa-crown"></i> Mes espaces de travail (
                {ownedWorkspaces.length})
              </h2>
              <p className={styles["categoryDescription"]}>
                Les espaces de travail que vous avez créés et que vous gérez
              </p>
              <WorkspaceList
                workspaces={ownedWorkspaces}
                filter=""
                user={user ?? undefined}
                onAccess={handleAccess}
                onInvite={handleInviteClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRequestJoin={handleRequestJoin}
                onAcceptInvite={handleAcceptInvite}
                showOnlyJoinActions={false}
                requestJoinLoading={requestJoinLoading}
                acceptInviteLoading={acceptInviteLoading}
              />
            </section>
          )}

          {/* Workspaces où je suis membre */}
          {memberWorkspaces.length > 0 && (
            <section className={styles["workspaceCategory"]}>
              <h2 className={styles["categoryTitle"]}>
                <i className="fa-solid fa-users"></i> Espaces rejoints (
                {memberWorkspaces.length})
              </h2>
              <p className={styles["categoryDescription"]}>
                Les espaces de travail dont vous êtes membre
              </p>
              <WorkspaceList
                workspaces={memberWorkspaces}
                filter=""
                user={user ?? undefined}
                onAccess={handleAccess}
                onInvite={handleInviteClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRequestJoin={handleRequestJoin}
                onAcceptInvite={handleAcceptInvite}
                showOnlyJoinActions={false}
                requestJoinLoading={requestJoinLoading}
                acceptInviteLoading={acceptInviteLoading}
              />
            </section>
          )}

          {/* Workspaces publics disponibles */}
          {availableWorkspaces.length > 0 && (
            <section className={styles["workspaceCategory"]}>
              <h2 className={styles["categoryTitle"]}>
                <i className="fa-solid fa-globe"></i> Espaces publics
                disponibles ({availableWorkspaces.length})
              </h2>
              <p className={styles["categoryDescription"]}>
                Découvrez et rejoignez des espaces de travail publics
              </p>
              <WorkspaceList
                workspaces={availableWorkspaces}
                filter=""
                user={user ?? undefined}
                onAccess={handleAccess}
                onInvite={handleInviteClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRequestJoin={handleRequestJoin}
                onAcceptInvite={handleAcceptInvite}
                showOnlyJoinActions={true}
                requestJoinLoading={requestJoinLoading}
                acceptInviteLoading={acceptInviteLoading}
              />
            </section>
          )}

          {/* Message si aucun workspace dans la recherche */}
          {search &&
            ownedWorkspaces.length === 0 &&
            memberWorkspaces.length === 0 &&
            availableWorkspaces.length === 0 && (
              <div className={styles["emptyState"]}>
                <i className="fa-solid fa-search"></i>
                <h3>Aucun résultat trouvé</h3>
                <p>
                  Aucun espace de travail ne correspond à votre recherche "
                  {search}".
                </p>
              </div>
            )}

          {/* Message si aucun workspace du tout */}
          {!search &&
            ownedWorkspaces.length === 0 &&
            memberWorkspaces.length === 0 &&
            availableWorkspaces.length === 0 && (
              <div className={styles["emptyState"]}>
                <i className="fa-solid fa-folder-open"></i>
                <h3>Aucun espace de travail trouvé</h3>
                <p>
                  Commencez par créer votre premier espace de travail ou
                  attendez qu'un collègue vous invite dans le sien.
                </p>
              </div>
            )}
        </div>
      )}
    </section>
  );
};

export default WorkspacesPage;
