import { useState } from 'react';
import { workspaceCreateSchema } from '@utils/validation';

export function useWorkspaceCreateForm(
  onCreate: (formData: {
    name: string;
    description?: string;
    isPublic: boolean;
  }) => Promise<void>,
  onCreated?: () => void
) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await workspaceCreateSchema.validate({ name, description, isPublic });
    } catch (validationError: any) {
      setError(validationError.message);
      return;
    }

    if (!name.trim()) {
      setError("Le nom de l'espace est requis.");
      return;
    }
    setLoading(true);
    try {
      await onCreate({ name, description, isPublic });
      setName('');
      setDescription('');
      setIsPublic(true);
      if (onCreated) onCreated();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création.');
    } finally {
      setLoading(false);
    }
  };

  return {
    name,
    setName,
    description,
    setDescription,
    isPublic,
    setIsPublic,
    loading,
    error,
    handleSubmit,
  };
}
