import React, { useState } from "react";
import styles from "./CreateWorkspaceModal.module.scss";

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: {
    name: string;
    description?: string;
    isPublic: boolean;
  }) => void;
  loading?: boolean;
}

const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: false,
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

    // Reset form after save
    setFormData({
      name: "",
      description: "",
      isPublic: false,
    });
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles["modalOverlay"]}>
      <div className={styles["modalContainer"]}>
        <div className={styles["modalHeader"]}>
          <h2 className={styles["modalTitle"]}>
            Créer un nouvel espace de travail
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={styles["closeButton"]}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles["modalForm"]}>
          <div className={styles["formGroup"]}>
            <label htmlFor="name" className={styles["label"]}>
              Nom de l'espace *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Entrez le nom de l'espace"
              className={`${styles["input"]} ${
                errors["name"] ? styles["inputError"] : ""
              }`}
              disabled={loading}
              autoFocus
            />{" "}
            {errors["name"] && (
              <span className={styles["errorText"]}>{errors["name"]}</span>
            )}
          </div>

          <div className={styles["formGroup"]}>
            <label htmlFor="description" className={styles["label"]}>
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Description de l'espace (optionnel)"
              className={styles["textarea"]}
              disabled={loading}
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
              <span className={styles["checkboxText"]}>
                Espace de travail public
              </span>
            </label>
            <p className={styles["helpText"]}>
              {formData.isPublic
                ? "Cet espace sera visible par tous les utilisateurs et ils pourront demander à le rejoindre."
                : "Cet espace sera privé et accessible uniquement sur invitation."}
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
              {loading ? "Création..." : "Créer l'espace"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWorkspaceModal;
