// src/hooks/useResetPassword.ts

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resetPasswordSchema } from '@utils/validation';
import { resetPassword } from '@services/authApi';

export const useResetPassword = (token: string) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>(
    {}
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setIsError(false);
    setErrors({});

    setLoading(true);
    try {
      // Validation front (avec Yup) - récupère tous les messages d’un coup
      await resetPasswordSchema.validate(
        { password, confirm: confirmPassword },
        { abortEarly: false }
      );

      await resetPassword(token, password);
      setMsg('Mot de passe réinitialisé, tu peux te reconnecter !');
      setIsError(false);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      // Gère les erreurs de yup (structure ValidationError)
      if (err.name === 'ValidationError') {
        const newErrors: { password?: string; confirm?: string } = {};
        err.inner.forEach((e: any) => {
          if (e.path && !newErrors[e.path as 'password' | 'confirm']) {
            newErrors[e.path as 'password' | 'confirm'] = e.message;
          }
        });
        setErrors(newErrors);
        setIsError(true);
      } else {
        setMsg(err.response?.data?.message || err.message || 'Erreur serveur');
        setIsError(true);
      }
    }
    setLoading(false);
  };

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    msg,
    isError,
    loading,
    handleSubmit,
    errors,
  };
};
