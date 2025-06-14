// src/pages/RegisterPage/RegisterPage.tsx

// Dépendances externes
import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Alias projet
import { useForm } from "@hooks/useForm";
import { register } from "@services/authApi";
import { registerSchema } from "@utils/validation";

// Import relatif (local au composant)
import styles from "./RegisterPage.module.scss";

type RegisterFormFields = {
  name: string;
  email: string;
  password: string;
};
type Errors = Partial<Record<keyof RegisterFormFields, string>>;

const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const navigate = useNavigate();
  const location = useLocation();

  // Auto focus refs
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const {
    values: form,
    handleChange,
    reset,
  } = useForm<RegisterFormFields>({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Form validation
    try {
      await registerSchema.validate(form, { abortEarly: false });
    } catch (validationErr: any) {
      // Turns errors into a field -> message
      const fieldErrors: Errors = {};
      if (validationErr.inner) {
        validationErr.inner.forEach((err: any) => {
          if (err.path)
            fieldErrors[err.path as keyof typeof form] = err.message;
        });
      }
      setErrors(fieldErrors);

      // Focus on the 1st field in error
      if (fieldErrors.name && nameRef.current) nameRef.current.focus();
      else if (fieldErrors.email && emailRef.current) emailRef.current.focus();
      else if (fieldErrors.password && passwordRef.current)
        passwordRef.current.focus();
      return;
    }

    setLoading(true);

    try {
      await register(form);
      reset();
      // Automatic redirection to login page after successful registration
      const redirect =
        location.state?.redirect ||
        sessionStorage.getItem("redirectAfterAuth") ||
        null;

      if (redirect) {
        navigate("/login", { state: { redirect } });
      } else {
        navigate("/login");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Erreur lors de l'inscription.";
      if (errorMessage.toLowerCase().includes("email")) {
        setErrors({ email: errorMessage });
        if (emailRef.current) emailRef.current.focus();
      } else if (errorMessage.toLowerCase().includes("mot de passe")) {
        setErrors({ password: errorMessage });
        if (passwordRef.current) passwordRef.current.focus();
      } else if (
        errorMessage.toLowerCase().includes("identifiant") ||
        errorMessage.toLowerCase().includes("name")
      ) {
        setErrors({ name: errorMessage });
        if (nameRef.current) nameRef.current.focus();
      } else {
        setErrors({});
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles["register-page"]}>
      <div className={styles["logo-title"]}>
        <img
          src="/assets/images/logo-supchat-complete-transparent-light-01.png"
          alt="Logo Supchat"
        />
      </div>
      <section className={styles["card-form"]}>
        <h1>Inscription</h1>

        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Identifiant</label>
          <input
            ref={nameRef}
            id="name"
            name="name"
            type="text"
            placeholder="Identifiant"
            value={form.name}
            onChange={handleChange}
            className={errors.name ? "inputError" : ""}
            required
          />
          {errors.name && <div className="error">{errors.name}</div>}

          <label htmlFor="email">Adresse e-mail</label>
          <input
            ref={emailRef}
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className={errors.email ? "inputError" : ""}
            required
          />
          {errors.email && <div className="error">{errors.email}</div>}

          <label htmlFor="password">Mot de passe</label>
          <div className={styles["passwordInputWrapper"]}>
            <input
              ref={passwordRef}
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={form.password}
              onChange={handleChange}
              className={errors.password ? "inputError" : ""}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              tabIndex={-1}
              className={styles["eyeButton"]}
              onMouseDown={() => setShowPassword(true)}
              onMouseUp={() => setShowPassword(false)}
              onMouseLeave={() => setShowPassword(false)}
              aria-label={
                showPassword
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
            >
              {showPassword ? (
                <i className="fa-solid fa-eye-slash"></i>
              ) : (
                <i className="fa-solid fa-eye"></i>
              )}
            </button>
          </div>
          {errors.password && <div className="error">{errors.password}</div>}

          <button
            className={`btn ${styles["submit"]}`}
            type="submit"
            disabled={loading}
          >
            {loading ? (
              "Chargement..."
            ) : (
              <>
                S’inscrire <i className="fa-solid fa-arrow-right" />
              </>
            )}
          </button>
        </form>

        <div className={styles["social-login"]}>
          <button className="gsi-material-button">
            <div className="gsi-material-button-state" />
            <div className="gsi-material-button-content-wrapper">
              <div className="gsi-material-button-icon">
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  style={{ display: "block" }}
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  ></path>
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  ></path>
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  ></path>
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  ></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
              <span className="gsi-material-button-contents">
                Continuer avec Google
              </span>
              <span style={{ display: "none" }}>Se connecter avec Google</span>
            </div>
          </button>

          <button className="facebook-button">
            <i className="fa-brands fa-facebook-f" />
            Continuer avec Facebook
          </button>
        </div>

        <p className={styles["link-login"]}>
          Vous avez déjà un compte ?{" "}
          <a href="/login" className={styles["link-create-account"]}>
            Connectez-vous
          </a>
        </p>
      </section>
    </section>
  );
};

export default RegisterPage;
