import React from "react";
import { useChannelCreateForm } from "@hooks/useChannelCreateForm";
import styles from "./ChannelCreateForm.module.scss";

interface ChannelCreateFormProps {
  workspaceId: string;
  onCreate: (
    formData: import("@services/channelApi").ChannelFormData
  ) => Promise<void>;
  onCreated?: () => void;
}

const ChannelCreateForm: React.FC<ChannelCreateFormProps> = ({
  workspaceId,
  onCreate,
  onCreated,
}) => {
  const {
    name,
    setName,
    description,
    setDescription,
    type,
    setType,
    loading,
    error,
    handleSubmit,
  } = useChannelCreateForm(onCreate, workspaceId, onCreated);

  return (
    <form onSubmit={handleSubmit} className={styles["form"]}>
      <h2 className={styles["title"]}>Créer un canal</h2>
      <label htmlFor="channel-name">
        Nom&nbsp;:
        <input
          id="channel-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`${styles["input"]} ${
            error?.includes("nom") ? styles["inputError"] : ""
          }`}
          disabled={loading}
          required
        />
        {error?.includes("nom") && <p className={styles["error"]}>{error}</p>}
      </label>
      <label
        htmlFor="channel-description"
        className={styles["label-description"]}
      >
        Description&nbsp;:
        <input
          id="channel-description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${styles["input"]} ${
            error?.includes("description") ? styles["inputError"] : ""
          }`}
          disabled={loading}
        />
        {error?.includes("description") && (
          <p className={styles["error"]}>{error}</p>
        )}
      </label>
      <label htmlFor="channel-type" className={styles["label-type"]}>
        Type&nbsp;:
        <select
          id="channel-type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className={styles["input-select"]}
          disabled={loading}
          required
        >
          <option value="">Sélectionner</option>
          <option value="public">Public</option>
          <option value="private">Privé</option>
        </select>
        {error?.includes("type") && <p className={styles["error"]}>{error}</p>}
      </label>
      {error &&
        !error.includes("nom") &&
        !error.includes("description") &&
        !error.includes("type") && <p className={styles["error"]}>{error}</p>}
      <div className={styles["container-btn"]}>
        <button
          type="submit"
          disabled={loading}
          className={`btn ${styles["submitButton"]}`}
        >
          {loading ? "Création..." : "Créer"}
        </button>
      </div>
    </form>
  );
};

export default ChannelCreateForm;
