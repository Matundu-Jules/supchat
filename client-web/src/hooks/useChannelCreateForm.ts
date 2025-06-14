import { useState } from "react";
import { channelCreateSchema } from "@utils/validation";
import type { ChannelFormData } from "@services/channelApi";

export function useChannelCreateForm(
  onCreate: (formData: ChannelFormData) => Promise<void>,
  workspaceId: string,
  onCreated?: () => void
) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await channelCreateSchema.validate({ name, description });
    } catch (validationError: any) {
      setError(validationError.message);
      return;
    }
    setLoading(true);
    try {
      await onCreate({ name, description, workspaceId });
      setName("");
      setDescription("");
      if (onCreated) onCreated();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création.");
    } finally {
      setLoading(false);
    }
  };

  return {
    name,
    setName,
    description,
    setDescription,
    loading,
    error,
    handleSubmit,
  };
}
