// src/hooks/useRegister.ts

import { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

import { login as reduxLogin } from '@store/authSlice';
import { register, googleLogin, facebookLogin } from '@services/authApi';
import { registerSchema } from '@utils/validation';

type RegisterFormFields = {
  name: string;
  email: string;
  password: string;
};
type Errors = Partial<Record<keyof RegisterFormFields, string>>;

export function useRegister() {
  const [form, setForm] = useState<RegisterFormFields>({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const reset = () => {
    setForm({ name: '', email: '', password: '' });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Form validation
    try {
      await registerSchema.validate(form, { abortEarly: false });
    } catch (validationErr: any) {
      const fieldErrors: Errors = {};
      if (validationErr.inner) {
        validationErr.inner.forEach((err: any) => {
          if (err.path)
            fieldErrors[err.path as keyof RegisterFormFields] = err.message;
        });
      }
      setErrors(fieldErrors);

      // Focus on the first field in error
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
        sessionStorage.getItem('redirectAfterAuth') ||
        null;

      if (redirect) {
        navigate('/login', { state: { redirect } });
      } else {
        navigate('/login');
      }
    } catch (err: any) {
      const errorMessage = err.message || "Erreur lors de l'inscription.";
      if (errorMessage.toLowerCase().includes('email')) {
        setErrors({ email: errorMessage });
        if (emailRef.current) emailRef.current.focus();
      } else if (errorMessage.toLowerCase().includes('mot de passe')) {
        setErrors({ password: errorMessage });
        if (passwordRef.current) passwordRef.current.focus();
      } else if (
        errorMessage.toLowerCase().includes('identifiant') ||
        errorMessage.toLowerCase().includes('name')
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
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await googleLogin(credentialResponse.credential);
      if (res && res.user) {
        console.log('Google register response:', res.user); // Debug
        dispatch(reduxLogin(res.user)); // Vérifier si l'utilisateur connecté via Google a un mot de passe
        if (res.user.googleId && res.user.hasPassword === false) {
          console.log(
            'Redirecting Google user without password to set-password page'
          );
          // Rediriger vers la page de création de mot de passe
          navigate('/set-password', { replace: true });
        } else {
          // Redirection normale
          const redirect =
            location.state?.redirect ||
            sessionStorage.getItem('redirectAfterAuth') ||
            '/';
          navigate(redirect, { replace: true });
          sessionStorage.removeItem('redirectAfterAuth');
        }
      } else {
        alert('Erreur lors de la connexion Google : utilisateur non trouvé');
      }
    } catch (err) {
      alert('Erreur lors de la connexion Google');
    }
  };
  const handleFacebookSuccess = async (response: any) => {
    try {
      const res = await facebookLogin(response.accessToken);
      if (res && res.user) {
        console.log('Facebook register response:', res.user); // Debug        dispatch(reduxLogin(res.user)); // Vérifier si l'utilisateur connecté via Facebook a un mot de passe
        if (res.user.facebookId && res.user.hasPassword === false) {
          console.log(
            'Redirecting Facebook user without password to set-password page'
          );
          // Rediriger vers la page de création de mot de passe
          navigate('/set-password', { replace: true });
        } else {
          // Redirection normale
          const redirect =
            location.state?.redirect ||
            sessionStorage.getItem('redirectAfterAuth') ||
            '/';
          navigate(redirect, { replace: true });
          sessionStorage.removeItem('redirectAfterAuth');
        }
      } else {
        alert('Erreur lors de la connexion Facebook : utilisateur non trouvé');
      }
    } catch (err) {
      alert('Erreur lors de la connexion Facebook');
    }
  };

  return {
    form,
    handleChange,
    handleSubmit,
    errors,
    loading,
    nameRef,
    emailRef,
    passwordRef,
    handleGoogleSuccess,
    handleFacebookSuccess,
  };
}
