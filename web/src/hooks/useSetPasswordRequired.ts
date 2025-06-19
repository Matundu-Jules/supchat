// src/hooks/useSetPasswordRequired.ts

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@store/store';
import { updateUserProfile } from '@store/authSlice';
import { setPassword } from '@services/authApi';

interface SetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

export function useSetPasswordRequired() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState<SetPasswordFormData>({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<SetPasswordFormData>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Effacer l'erreur du champ modifié
    if (errors[name as keyof SetPasswordFormData]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<SetPasswordFormData> = {}; // Vérifier le nouveau mot de passe
    if (!form.newPassword.trim()) {
      newErrors.newPassword = 'Le mot de passe est requis';
    } else if (form.newPassword.length < 8) {
      newErrors.newPassword =
        'Le mot de passe doit contenir au moins 8 caractères';
    } else if (form.newPassword.length > 128) {
      newErrors.newPassword =
        'Le mot de passe ne peut pas dépasser 128 caractères';
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/.test(form.newPassword)
    ) {
      newErrors.newPassword =
        'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial (@$!%*?&#)';
    }

    // Vérifier la confirmation
    if (!form.confirmPassword.trim()) {
      newErrors.confirmPassword = 'La confirmation est requise';
    } else if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Appeler l'API pour définir le mot de passe
      await setPassword(form.newPassword);

      // Mettre à jour le store Redux pour indiquer que l'utilisateur a maintenant un mot de passe
      dispatch(updateUserProfile({ hasPassword: true }));

      // Rediriger vers la page d'accueil avec un message de succès
      navigate('/', {
        replace: true,
        state: {
          message:
            'Mot de passe créé avec succès ! Vous pouvez maintenant vous connecter avec votre email.',
          type: 'success',
        },
      });
    } catch (error: any) {
      const errorMessage =
        error.message || 'Erreur lors de la création du mot de passe';
      setErrors({ newPassword: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    errors,
    loading,
    user,
    handleChange,
    handleSubmit,
  };
}
