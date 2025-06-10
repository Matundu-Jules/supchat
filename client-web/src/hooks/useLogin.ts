// src/hooks/useLogin.ts

// Dépendances externes
import { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

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
      navigate('/');
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
      const res = await googleLogin(credentialResponse.credential);
      if (res && res.user) {
        dispatch(reduxLogin(res.user));
        navigate('/');
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
        dispatch(reduxLogin(res.user));
        navigate('/');
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
