// src/pages/ForgotPasswordPage/ForgotPasswordPage.tsx

import React from "react";
import { useForgotPassword } from "@hooks/useForgotPassword";
import styles from "./ForgotPasswordPage.module.scss";

const ForgotPasswordPage: React.FC = () => {
  const { email, setEmail, msg, loading, handleSubmit, isError } =
    useForgotPassword();

  return (
    <section className={styles["forgot-password-page"]}>
      <h1>Mot de passe oublié</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Ton email</label>
        <input
          type="email"
          id="email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />

        {msg && <p className={isError ? "error" : "success"}>{msg}</p>}

        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Envoi..." : "Recevoir le lien de réinitialisation"}
        </button>
      </form>

      <a href="/login">Revenir à l'accueil</a>
    </section>
  );
};

export default ForgotPasswordPage;
