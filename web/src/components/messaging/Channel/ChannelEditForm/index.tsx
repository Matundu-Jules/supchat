import React, { useState } from "react";
import * as yup from "yup";
import styles from "../ChannelCreateForm/ChannelCreateForm.module.scss";
import type { Channel } from "@ts_types/channel";

interface ChannelEditFormProps {
  channel: Channel;
  onEdit: (
    data: Partial<
      Omit<
        Channel,
        "_id" | "workspaceId" | "members" | "createdAt" | "updatedAt"
      >
    >
  ) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}

const channelEditSchema = yup.object({
  name: yup.string().min(3).max(50).required("Le nom est requis"),
  description: yup.string().max(200),
  type: yup.string().oneOf(["public", "private"]).required(),
});

const ChannelEditForm: React.FC<ChannelEditFormProps> = ({
  channel,
  onEdit,
  onCancel,
  loading,
  error,
}) => {
  const [name, setName] = useState(channel.name);
  const [description, setDescription] = useState(channel.description || "");
  const [type, setType] = useState(channel.type);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await channelEditSchema.validate({ name, description, type });
      await onEdit({ name, description, type });
    } catch (validationError: any) {
      setFormError(validationError.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles["form"]}>
      <h2 className={styles["title"]}>Éditer le canal</h2>
      <label htmlFor="edit-channel-name">
        Nom&nbsp;:
        <input
          id="edit-channel-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`${styles["input"]} ${
            formError?.includes("nom") ? styles["inputError"] : ""
          }`}
          disabled={loading}
          required
        />
        {formError?.includes("nom") && (
          <p className={styles["error"]}>{formError}</p>
        )}
      </label>
      <label
        htmlFor="edit-channel-description"
        className={styles["label-description"]}
      >
        Description&nbsp;:
        <input
          id="edit-channel-description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${styles["input"]} ${
            formError?.includes("description") ? styles["inputError"] : ""
          }`}
          disabled={loading}
        />
        {formError?.includes("description") && (
          <p className={styles["error"]}>{formError}</p>
        )}
      </label>
      <label htmlFor="edit-channel-type">
        Type&nbsp;:
        <select
          id="edit-channel-type"
          value={type}
          onChange={(e) => setType(e.target.value as Channel["type"])}
          className={styles["input"]}
          disabled={loading}
          required
        >
          <option value="public">Public</option>
          <option value="private">Privé</option>
        </select>
      </label>
      {error && <div className={styles["error"]}>{error}</div>}
      <div className={styles["actions"]}>
        <button type="submit" className="btn" disabled={loading}>
          Enregistrer
        </button>
        <button
          type="button"
          className="btn"
          onClick={onCancel}
          disabled={loading}
        >
          Annuler
        </button>
      </div>
    </form>
  );
};

export default ChannelEditForm;
