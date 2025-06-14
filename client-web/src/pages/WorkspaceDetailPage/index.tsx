import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useWorkspaceDetails } from "@hooks/useWorkspaceDetails";
import styles from "./WorkspaceDetailPage.module.scss";
import Loader from "@components/Loader";
import { useSelector } from "react-redux";
import type { RootState } from "@store/store";
import ChannelList from "@components/Channel/ChannelList";
import ChannelCreateForm from "@components/Channel/ChannelCreateForm";
import { useChannels } from "@hooks/useChannels";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@hooks/usePermissions";
import RoleSelector from "@components/Permissions/RoleSelector";

const WorkspaceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const user = useSelector((state: RootState) => state.auth.user);
  const {
    workspace,
    loading,
    error,
    inviteEmail,
    setInviteEmail,
    inviteLoading,
    inviteError,
    inviteSuccess,
    setInviteSuccess,
    handleInvite,
  } = useWorkspaceDetails(id || "");
  const navigate = useNavigate();
  const {
    channels,
    loading: channelsLoading,
    error: channelsError,
    fetchChannels,
    handleCreateChannel,
  } = useChannels(id || "");
  const [search, setSearch] = useState("");
  const { permissions, setRole, loading: permLoading } = usePermissions(id || "");

  if (loading) {
    return (
      <div className={styles["container"]}>
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles["container"]}>
        <p className={styles["error"]}>{error}</p>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className={styles["container"]}>
        <p className={styles["error"]}>Workspace introuvable.</p>
      </div>
    );
  }

  // Vérifie si l'utilisateur est admin ou owner du workspace
  const isAdminOrOwner =
    user &&
    workspace.owner &&
    (user.role === "admin" || user.email === workspace.owner.email);

  const handleChannelAccess = (channel: any) => {
    navigate(`/message?channel=${channel._id}`);
  };

  return (
    <section className={styles["container"]}>
      <div className={styles["header"]}>
        <h1 className={styles["title"]}>{workspace.name}</h1>
        {workspace.isPublic !== undefined && (
          <span
            className={
              workspace.isPublic
                ? styles["badgePublic"]
                : styles["badgePrivate"]
            }
          >
            {workspace.isPublic ? "Public" : "Privé"}
          </span>
        )}
      </div>
      {workspace.description && (
        <p className={styles["description"]}>{workspace.description}</p>
      )}

      {/* Section membres */}
      <div className={styles["sectionGrid"]}>
        <div className={styles["section"]}>
          <h2>Membres</h2>
          <ul className={styles["list"]}>
            {workspace.members && workspace.members.length > 0 ? (
              workspace.members.map((member: any) => (
                <li key={member._id} className={styles["memberName"]}>
                  {member.username || member.email}
                </li>
              ))
            ) : (
              <li className={styles["empty"]}>Aucun membre</li>
            )}
          </ul>
          {isAdminOrOwner && (
            <div>
              <h3>Rôles du workspace</h3>
              {permLoading ? (
                <Loader />
              ) : (
                <ul className={styles["list"]}>
                  {permissions.map((p) => (
                    <li key={p._id} className={styles["memberName"]}>
                      {p.userId.email}
                      <RoleSelector
                        value={p.role}
                        onChange={(r) => setRole(p._id, { role: r })}
                      />
                      {channels.map((c) => {
                        const chRole =
                          p.channelRoles.find((cr) => cr.channelId === c._id)
                            ?.role || p.role;
                        return (
                          <div key={c._id} className={styles["channelRole"]}>
                            {c.name}
                            <RoleSelector
                              value={chRole}
                              onChange={(r) => {
                                const roles = p.channelRoles.filter(
                                  (cr) => cr.channelId !== c._id
                                );
                                roles.push({ channelId: c._id, role: r });
                                setRole(p._id, { channelRoles: roles });
                              }}
                            />
                          </div>
                        );
                      })
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Section invitation (visible seulement pour owner/admin) */}
        {isAdminOrOwner && (
          <div className={styles["section"]}>
            <h2>Inviter un membre</h2>
            <form
              className={styles["form"]}
              onSubmit={(e) => {
                e.preventDefault();
                handleInvite();
              }}
              autoComplete="off"
            >
              <input
                type="email"
                placeholder="Email du membre"
                value={inviteEmail}
                onChange={(e) => {
                  setInviteEmail(e.target.value);
                  // Réinitialise le message de succès à chaque saisie
                  if (inviteSuccess) setInviteSuccess(null);
                }}
                className={
                  styles["input"] +
                  (inviteError ? " " + styles["inputError"] : "")
                }
                required
                disabled={inviteLoading}
              />
              <button
                type="submit"
                className={styles["button"]}
                disabled={inviteLoading}
              >
                {inviteLoading ? "Envoi..." : "Inviter"}
              </button>
            </form>
            {inviteError && (
              <div className={styles["error"]}>{inviteError}</div>
            )}
            {inviteSuccess && !inviteError && (
              <div className={styles["success"]}>{inviteSuccess}</div>
            )}
          </div>
        )}
      </div>

      {/* Section canaux */}
      <div className={styles["sectionGrid"]}>
        <div className={styles["section"]}>
          <h2>Canaux</h2>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className={styles["searchInput"]}
          />
          {channelsLoading ? (
            <Loader />
          ) : channelsError ? (
            <p className={styles["error"]}>{channelsError}</p>
          ) : (
            <ChannelList
              channels={channels}
              filter={search}
              onAccess={handleChannelAccess}
            />
          )}
        </div>
        {isAdminOrOwner && (
          <div className={styles["section"]}>
            <ChannelCreateForm
              workspaceId={id || ""}
              onCreate={handleCreateChannel}
              onCreated={fetchChannels}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default WorkspaceDetailPage;
