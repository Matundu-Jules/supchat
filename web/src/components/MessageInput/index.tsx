import React, { useState, useRef } from "react";
import {
  validateFile,
  getAllAcceptedTypes,
  getFileIcon,
  formatFileSize,
} from "@utils/fileConfig";
import styles from "./MessageInput.module.scss";

interface MessageInputProps {
  onSend: (text: string, file?: File | null) => Promise<void> | void;
  loading?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, loading }) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !file) return;
    await onSend(text.trim(), file);
    setText("");
    setFile(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validation avec la configuration centralisée
    const validation = validateFile(selectedFile);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    setFile(selectedFile);
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles["form"]}>
      <input
        className={styles["inputText"]}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Tapez votre message..."
        disabled={loading}
      />

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept={getAllAcceptedTypes().join(",")}
        disabled={loading}
        style={{ display: "none" }}
      />

      {/* Bouton rond pour sélectionner un fichier */}
      <button
        type="button"
        className={styles["fileButton"]}
        onClick={handleFileButtonClick}
        disabled={loading}
        title="Ajouter un fichier"
      >
        <i className="fa-solid fa-plus" />
      </button>

      {/* Affichage du fichier sélectionné */}
      {file && (
        <div className={styles["filePreview"]}>
          <div className={styles["fileInfo"]}>
            <i className={getFileIcon(file.type)} />
            <div className={styles["fileDetails"]}>
              <span className={styles["fileName"]}>{file.name}</span>
              <span className={styles["fileSize"]}>
                {formatFileSize(file.size)}
              </span>
            </div>
          </div>
          <button
            type="button"
            className={styles["removeFileButton"]}
            onClick={removeFile}
            title="Supprimer le fichier"
          >
            <i className="fa-solid fa-times" />
          </button>
        </div>
      )}

      <button className={styles["sendButton"]} type="submit" disabled={loading}>
        <i className="fa-solid fa-paper-plane" />
      </button>
    </form>
  );
};

export default MessageInput;
