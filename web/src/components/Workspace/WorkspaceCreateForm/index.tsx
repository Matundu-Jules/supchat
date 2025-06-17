import React from "react";
import { useWorkspaceCreateForm } from "@hooks/useWorkspaceCreateForm";

import styles from "./WorkspaceCreateForm.module.scss";

type WorkspaceCreateFormProps = {
  onCreate: (formData: {
    name: string;
    description?: string;
    isPublic: boolean;
  }) => Promise<void>;
  onCreated?: () => void;
};

const WorkspaceCreateForm: React.FC<WorkspaceCreateFormProps> = ({
  onCreate,
  onCreated,
}) => {
  const {
    name,
    setName,
    description,
    setDescription,
    isPublic,
    setIsPublic,
    loading,
    error,
    handleSubmit,
  } = useWorkspaceCreateForm(onCreate, onCreated);

  return (
    <form onSubmit={handleSubmit} className={styles["form"]}>
      <h2 className={styles["title"]}>Créer un nouvel espace</h2>

      <label className={styles["label-name"]} htmlFor="name">
        Nom&nbsp;:
        <input
          type="text"
          name="name"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
          className={`${styles["input"]} ${
            error?.includes("nom") ? styles["inputError"] : ""
          }`}
        />
        {error?.includes("nom") && <p className={styles["error"]}>{error}</p>}
      </label>

      <label className={styles["label-description"]} htmlFor="description">
        Description&nbsp;:
        <input
          type="text"
          value={description}
          name="description"
          id="description"
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          className={`${styles["input"]} ${
            error?.includes("description") ? styles["inputError"] : ""
          }`}
        />
        {error?.includes("description") && (
          <p className={styles["error"]}>{error}</p>
        )}
      </label>

      <label className={styles["label-ispublic"]} htmlFor="ispublic">
        <input
          type="checkbox"
          name="ispublic"
          id="ispublic"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          disabled={loading}
          className={styles["checkbox"]}
        />
        &nbsp;Espace public
      </label>

      {error && !error.includes("nom") && !error.includes("description") && (
        <p className={styles["error"]}>{error}</p>
      )}

      <div className={styles["container-btn"]}>
        <button
          type="submit"
          disabled={loading}
          className={`btn ${styles["submitButton"]}`}
        >
          {loading ? "Création..." : "Créer l'espace"}
        </button>
      </div>
    </form>
  );
};

export default WorkspaceCreateForm;
