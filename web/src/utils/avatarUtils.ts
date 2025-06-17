// src/utils/avatarUtils.ts

/**
 * Construit l'URL complète pour un avatar
 * @param avatarPath - Le chemin de l'avatar retourné par l'API (ex: "/uploads/...")
 * @returns L'URL complète de l'avatar
 */
export function getAvatarUrl(
  avatarPath: string | undefined | null
): string | null {
  if (!avatarPath) return null;

  // Si c'est déjà une URL complète, la retourner telle quelle
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath;
  }

  // En développement, le proxy Vite redirige /uploads vers localhost:3000
  // En production, utiliser le même domaine que le client
  return avatarPath; // Le proxy Vite s'occupe de la redirection automatiquement
}
