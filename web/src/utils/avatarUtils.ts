// src/utils/avatarUtils.ts

/**
 * Construit l'URL complète pour un avatar
 * @param avatarPath - Le chemin de l'avatar retourné par l'API (ex: "/uploads/...")
 * @param bustCache - Si true, ajoute un timestamp pour forcer le rechargement
 * @returns L'URL complète de l'avatar
 */
export function getAvatarUrl(
  avatarPath: string | undefined | null,
  bustCache: boolean = false
): string | null {
  if (!avatarPath || avatarPath.trim() === '') return null;

  // Si c'est déjà une URL complète, la retourner telle quelle
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return bustCache ? `${avatarPath}?t=${Date.now()}` : avatarPath;
  }

  // En développement, le proxy Vite redirige /uploads vers localhost:3000
  // En production, utiliser le même domaine que le client
  const baseUrl = avatarPath;
  return bustCache ? `${baseUrl}?t=${Date.now()}` : baseUrl;
}
