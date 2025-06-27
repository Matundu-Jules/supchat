import React, { useEffect, useState } from "react";

interface FeedbackToastProps {
  feedbacks: Record<string, string | null | undefined>;
}

const getType = (msg?: string | null) =>
  msg && msg.toLowerCase().includes("erreur") ? "error" : "success";

const FeedbackToast: React.FC<FeedbackToastProps> = ({ feedbacks }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [type, setType] = useState<"success" | "error">("success");

  useEffect(() => {
    // Affiche le premier feedback non nul trouvé
    const entry = Object.entries(feedbacks).find(([, v]) => v);
    if (entry) {
      setMessage(entry[1] || null);
      setType(getType(entry[1]));
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3500);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
      setMessage(null);
    }
  }, [feedbacks]);

  if (!visible || !message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 9999,
        minWidth: 260,
        maxWidth: 400,
        background: type === "error" ? "#ffeaea" : "#e6ffe6",
        color: type === "error" ? "#b30000" : "#217a36",
        border: `1px solid ${type === "error" ? "#ffb2b2" : "#b2e5b2"}`,
        borderRadius: 6,
        padding: "14px 22px",
        fontWeight: 500,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        transition: "opacity 0.3s",
        opacity: visible ? 1 : 0,
      }}
    >
      {message}
    </div>
  );
};

export default FeedbackToast;
