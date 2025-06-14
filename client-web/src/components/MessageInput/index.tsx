import React, { useState } from "react";
import styles from "./MessageInput.module.scss";

interface MessageInputProps {
  onSend: (text: string, file?: File | null) => Promise<void> | void;
  loading?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, loading }) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !file) return;
    await onSend(text.trim(), file);
    setText("");
    setFile(null);
  };

  return (
    <form onSubmit={handleSubmit} className={styles["form"]}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
      />
      <input
        type="file"
        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        Envoyer
      </button>
    </form>
  );
};

export default MessageInput;
