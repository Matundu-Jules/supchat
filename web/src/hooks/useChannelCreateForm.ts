import { useState } from 'react';
import { channelCreateSchema } from '@utils/validation';
import type { ChannelFormData } from '@services/channelApi';

export function useChannelCreateForm(
  onCreate: (formData: ChannelFormData) => Promise<void>,
  workspaceId: string,
  onCreated?: () => void
) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await channelCreateSchema.validate({ name, description, type });
    } catch (validationError: any) {
      setError(validationError.message);
      return;
    }
    setLoading(true);
    try {
      await onCreate({ name, description, workspaceId, type });
      setName('');
      setDescription('');
      setType('');
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
    type,
    setType,
    loading,
    error,
    handleSubmit,
  };
}
