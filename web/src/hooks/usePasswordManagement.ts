// src/hooks/usePasswordManagement.ts

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@store/store';
import { changePassword, setPassword } from '@services/authApi';

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function usePasswordManagement() {
  const user = useSelector((state: RootState) => state.auth.user);
  const hasPassword = user?.hasPassword ?? true; // Par défaut, on assume qu'il y a un mot de passe

  const [form, setForm] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<PasswordFormData>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Effacer l'erreur du champ modifié
    if (errors[name as keyof PasswordFormData]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };
  const validateForm = (): boolean => {
    const newErrors: Partial<PasswordFormData> = {};

    // Vérifier le mot de passe actuel (seulement si l'utilisateur en a un)
    if (hasPassword && !form.currentPassword.trim()) {
      newErrors.currentPassword = 'Le mot de passe actuel est requis';
    }

    // Vérifier le nouveau mot de passe
    if (!form.newPassword.trim()) {
      newErrors.newPassword = 'Le nouveau mot de passe est requis';
    } else if (form.newPassword.length < 8) {
      newErrors.newPassword =
        'Le mot de passe doit contenir au moins 8 caractères';    } else if (form.newPassword.length > 128) {
      newErrors.newPassword =
        'Le mot de passe ne peut pas dépasser 128 caractères';    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/.test(form.newPassword)) {
      newErrors.newPassword =
        'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial (@$!%*?&#)';
    }

    // Vérifier la confirmation
    if (!form.confirmPassword.trim()) {
      newErrors.confirmPassword = 'La confirmation est requise';
    } else if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    // Vérifier que le nouveau mot de passe est différent de l'ancien
    if (
      hasPassword &&
      form.currentPassword &&
      form.currentPassword === form.newPassword
    ) {
      newErrors.newPassword =
        "Le nouveau mot de passe doit être différent de l'ancien";
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
    setSuccess(false);

    try {
      if (hasPassword) {
        // Utilisateur avec mot de passe existant : changer le mot de passe
        await changePassword({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        });
      } else {
        // Utilisateur sans mot de passe (connexion sociale) : définir un mot de passe
        await setPassword(form.newPassword);
      }

      setSuccess(true);
      setForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      const errorMessage =
        error.message || 'Erreur lors de la modification du mot de passe';

      // Gérer les erreurs spécifiques
      if (
        errorMessage.toLowerCase().includes('mot de passe actuel') ||
        errorMessage.toLowerCase().includes('incorrect') ||
        errorMessage.toLowerCase().includes('ancien')
      ) {
        setErrors({ currentPassword: errorMessage });
      } else {
        setErrors({ newPassword: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setErrors({});
    setSuccess(false);
  };

  return {
    form,
    errors,
    loading,
    success,
    hasPassword,
    handleChange,
    handleSubmit,
    reset,
  };
}
