import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChannels } from "@hooks/useChannels";
import { useAppSelector, useAppDispatch } from "@hooks/redux";
import ChannelList from "@components/messaging/Channel/ChannelList";
import ChannelCreateForm from "@components/messaging/Channel/ChannelCreateForm";
import ChannelEditForm from "@components/messaging/Channel/ChannelEditForm";
import EmptyChannelsState from "./EmptyChannelsState";
import Loader from "@components/core/ui/Loader";
import styles from "./ChannelsPage.module.scss";
import type { Channel } from "../../../types/channel";
import {
  joinChannel,
  leaveChannel,
  editChannel,
  removeChannel,
} from "@store/channelsSlice";
import { useChannelPermissions } from "@hooks/useChannelPermissions";
import { useSocketEvents } from "@hooks/useSocketEvents";

const ChannelsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editModal, setEditModal] = useState<{ channel: Channel } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    channel: Channel;
  } | null>(null);
  const { channels, loading, error, handleCreateChannel } = useChannels(id!);
  const user = useAppSelector((s) => s.auth.user);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Contrôle création canal : seuls admin/membre peuvent créer
  const canCreateChannel =
    user && (user.role === "admin" || user.role === "membre");

  const filteredChannels = useMemo(() => {
    if (!search) return channels;
    return channels.filter(
      (c: Channel) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.description || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [channels, search]);

  // Redirection/erreur si accès non autorisé à un canal privé
  const handleOpenChannel = (channel: Channel) => {
    const isMember = channel.members?.some((m) => m._id === user?.id);
    if (channel.type === "private" && !isMember) {
      setActionError(
        "Accès refusé : vous n'êtes pas membre de ce canal privé."
      );
      return;
    }
    navigate(`/workspaces/${id}/channels/${channel._id}`);
  };

  const handleJoinChannel = async (channel: Channel) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await dispatch(
        joinChannel({ channelId: channel._id, workspaceId: id! })
      ).unwrap();
    } catch (err: any) {
      setActionError(err.message || "Erreur lors de la jointure");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveChannel = async (channel: Channel) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await dispatch(
        leaveChannel({ channelId: channel._id, workspaceId: id! })
      ).unwrap();
    } catch (err: any) {
      setActionError(err.message || "Erreur lors du quit");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditChannel = (channel: Channel) => {
    setEditModal({ channel });
  };

  const handleEditChannelSubmit = async (
    data: Partial<Omit<Channel, "workspaceId" | "_id">>
  ) => {
    if (!editModal) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await dispatch(
        editChannel({
          channelId: editModal.channel._id,
          workspaceId: id!,
          data,
        })
      ).unwrap();
      setEditModal(null);
    } catch (err: any) {
      setActionError(err.message || "Erreur lors de la mise à jour");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteChannel = (channel: Channel) => {
    setDeleteConfirm({ channel });
  };

  const handleDeleteChannelConfirm = async () => {
    if (!deleteConfirm) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await dispatch(
        removeChannel({
          channelId: deleteConfirm.channel._id,
          workspaceId: id!,
        })
      ).unwrap();
      setDeleteConfirm(null);
      // Redirection si besoin : navigate(`/workspaces/${id}/channels`)
    } catch (err: any) {
      setActionError(err.message || "Erreur lors de la suppression");
    } finally {
      setActionLoading(false);
    }
  };

  useSocketEvents(id!);

  return (
    <div className={styles["channelsPage"]}>
      <aside
        className={styles["sidebar"]}
        aria-label="Navigation des canaux"
        style={{ display: showSidebar ? "block" : undefined }}
      >
        <div className={styles["header"]}>
          <h1 id="channels-title">Canaux</h1>
          {canCreateChannel && (
            <button
              aria-label="Créer un canal"
              className="btn"
              onClick={() => setShowCreate((v) => !v)}
            >
              + Nouveau
            </button>
          )}
        </div>
        <input
          type="search"
          className={styles["searchBar"]}
          placeholder="Rechercher un canal..."
          aria-label="Rechercher un canal"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {showCreate && (
          <ChannelCreateForm
            workspaceId={id!}
            onCreate={handleCreateChannel}
            onCreated={() => setShowCreate(false)}
          />
        )}
        {loading ? (
          <Loader />
        ) : error ? (
          <div className={styles["emptyState"]} style={{ color: "#d32f2f" }}>
            {error}
          </div>
        ) : filteredChannels.length === 0 ? (
          <EmptyChannelsState onCreateChannel={() => setShowCreate(true)} />
        ) : (
          <ChannelList
            channels={filteredChannels}
            filter={search}
            userId={user?.id || ""}
            onAccess={handleOpenChannel}
            onJoin={handleJoinChannel}
            onLeave={handleLeaveChannel}
            onEdit={handleEditChannel}
            onDelete={handleDeleteChannel}
          />
        )}
        {actionError && (
          <div className={styles["emptyState"]} style={{ color: "#d32f2f" }}>
            {actionError}
          </div>
        )}
      </aside>
      <main className={styles["content"]} aria-labelledby="channels-title">
        <button
          className="btn"
          aria-label="Afficher/masquer la navigation"
          onClick={() => setShowSidebar((v) => !v)}
          style={{ marginBottom: 16, display: "block" }}
        >
          {showSidebar ? "Masquer" : "Afficher"} la navigation
        </button>
        {/* Modals édition/suppression */}
        {editModal && (
          <div className={styles["modalOverlay"]}>
            <div className={styles["modal"]}>
              <ChannelEditForm
                channel={editModal.channel}
                onEdit={handleEditChannelSubmit}
                onCancel={() => setEditModal(null)}
                loading={actionLoading}
                error={actionError}
              />
            </div>
          </div>
        )}
        {deleteConfirm && (
          <div className={styles["modalOverlay"]}>
            <div className={styles["modal"]}>
              <h2>Supprimer le canal</h2>
              <p>
                Voulez-vous vraiment supprimer le canal{" "}
                <b>{deleteConfirm.channel.name}</b> ?
              </p>
              <button
                className="btn"
                onClick={handleDeleteChannelConfirm}
                disabled={actionLoading}
              >
                Confirmer
              </button>
              <button className="btn" onClick={() => setDeleteConfirm(null)}>
                Annuler
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChannelsPage;
