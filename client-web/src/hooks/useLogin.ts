// src/hooks/useLogin.ts

// Dépendances externes
import { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

// Alias projet
import { login as reduxLogin } from '@store/authSlice';
import { loginApi } from '@services/authApi';
import { loginSchema } from '@utils/validation';
import { googleLogin } from '@services/authApi';
import { facebookLogin } from '@services/authApi';

type LoginFormFields = {
  email: string;
  password: string;
};
type Errors = Partial<Record<keyof LoginFormFields, string>>;

export function useLogin() {
  const [form, setForm] = useState<LoginFormFields>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // form validation
    try {
      await loginSchema.validate(form, { abortEarly: false });
    } catch (validationErr: any) {
      const fieldErrors: Errors = {};
      if (validationErr.inner) {
        validationErr.inner.forEach((err: any) => {
          if (err.path)
            fieldErrors[err.path as keyof LoginFormFields] = err.message;
        });
      }
      setErrors(fieldErrors);
      if (fieldErrors.email && emailRef.current) emailRef.current.focus();
      else if (fieldErrors.password && passwordRef.current)
        passwordRef.current.focus();
      return;
    }
    setLoading(true);
    try {
      const data = await loginApi(form);
      dispatch(reduxLogin(data.user));
      // localStorage.setItem("token", data.token);
      const redirect =
        location.state?.redirect ||
        sessionStorage.getItem('redirectAfterAuth') ||
        '/';
      navigate(redirect, { replace: true });
      sessionStorage.removeItem('redirectAfterAuth');
    } catch (err: any) {
      const msg = err.message || 'Erreur de connexion';
      const normalized = msg.toLowerCase();

      if (
        normalized.includes('utilisateur') || // User not found
        normalized.includes('email') || // Email incorrect/non-existent/already used
        normalized.includes('adresse') // email address
      ) {
        setErrors({ email: msg });
        if (emailRef.current) emailRef.current.focus();
      } else if (
        normalized.includes('mot de passe') ||
        normalized.includes('password')
      ) {
        setErrors({ password: msg });
        if (passwordRef.current) passwordRef.current.focus();
      } else {
        // Other errors = generic under password
        setErrors({ password: msg });
      }
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      console.log('🚀 Starting Google login...');
      const res = await googleLogin(credentialResponse.credential);
      console.log('📋 Google login response:', res);

      if (res && res.user) {
        console.log('👤 User object:', res.user);
        console.log('🔍 Has googleId:', !!res.user.googleId);
        console.log('🔐 hasPassword value:', res.user.hasPassword);

        dispatch(reduxLogin(res.user)); // Rediriger les utilisateurs Google vers set-password SEULEMENT s'ils n'ont pas de mot de passe
        if (res.user.googleId && res.user.hasPassword === false) {
          console.log(
            '🔄 Redirecting Google user without password to /set-password'
          );
          navigate('/set-password', { replace: true });
          console.log('✅ Navigation to /set-password completed');
        } else {
          console.log(
            '🏠 Normal redirect - Google user with password or non-Google user'
          );
          // Redirection normale
          const redirect =
            location.state?.redirect ||
            sessionStorage.getItem('redirectAfterAuth') ||
            '/';
          console.log('🏠 Normal redirect to:', redirect);
          navigate(redirect, { replace: true });
          sessionStorage.removeItem('redirectAfterAuth');
        }
      } else {
        console.log('❌ No user in response');
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
        console.log('Facebook login response:', res.user); // Debug
        dispatch(reduxLogin(res.user)); // Vérifier si l'utilisateur connecté via Facebook a un mot de passe
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
    emailRef,
    passwordRef,
    handleGoogleSuccess,
    handleFacebookSuccess,
  };
}
