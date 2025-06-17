import React, { useState } from "react";
import styles from "./EditWorkspaceModal.module.scss";

interface EditWorkspaceModalProps {
  workspace: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: {
    name: string;
    description?: string;
    isPublic: boolean;
  }) => void;
  loading?: boolean;
}

const EditWorkspaceModal: React.FC<EditWorkspaceModalProps> = ({
  workspace,
  isOpen,
  onClose,
  onSave,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: workspace?.name || "",
    description: workspace?.description || "",
    isPublic: workspace?.isPublic || false,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation simple
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      newErrors["name"] = "Le nom est requis";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSave(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles["modalOverlay"]}>
      <div className={styles["modalContent"]}>
        <div className={styles["modalHeader"]}>
          <h2>Modifier le workspace</h2>
          <button
            className={styles["closeButton"]}
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles["form"]}>
          <div className={styles["formGroup"]}>
            <label htmlFor="workspace-name">Nom du workspace *</label>
            <input
              id="workspace-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={`${styles["input"]} ${
                errors["name"] ? styles["inputError"] : ""
              }`}
              disabled={loading}
              placeholder="Nom du workspace"
            />
            {errors["name"] && (
              <span className={styles["error"]}>{errors["name"]}</span>
            )}
          </div>

          <div className={styles["formGroup"]}>
            <label htmlFor="workspace-description">Description</label>
            <textarea
              id="workspace-description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className={styles["textarea"]}
              disabled={loading}
              placeholder="Description du workspace (optionnel)"
              rows={3}
            />
          </div>

          <div className={styles["formGroup"]}>
            <label className={styles["checkboxLabel"]}>
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => handleChange("isPublic", e.target.checked)}
                disabled={loading}
              />
              <span className={styles["checkboxText"]}>Workspace public</span>
            </label>
            <p className={styles["helpText"]}>
              {formData.isPublic
                ? "Ce workspace sera visible par tous les utilisateurs et ils pourront demander à le rejoindre."
                : "Ce workspace sera privé et accessible uniquement sur invitation."}
            </p>
          </div>

          <div className={styles["modalActions"]}>
            <button
              type="button"
              onClick={onClose}
              className={styles["cancelButton"]}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className={styles["saveButton"]}
              disabled={loading}
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditWorkspaceModal;
