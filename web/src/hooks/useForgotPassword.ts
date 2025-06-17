// /src/hooks/useForgotPassword.ts

import { useState } from 'react';
import { forgotPasswordSchema } from '@utils/validation';
import { forgotPassword } from '@services/authApi';

export const useForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setIsError(false);
    setLoading(true);
    try {
      await forgotPasswordSchema.validate({ email });
      await forgotPassword(email);
      setMsg('Mail de réinitialisation envoyé ! Vérifie la console serveur.');
      setIsError(false);
    } catch (err: any) {
      setMsg(err.response?.data?.message || 'Erreur serveur');
      setIsError(true);
    }
    setLoading(false);
  };

  return {
    email,
    setEmail,
    msg,
    isError,
    loading,
    handleSubmit,
  };
};
