// Configuration des types de fichiers acceptés par l'application

export const FILE_CONFIG = {
  // Taille maximale : 10MB
  MAX_SIZE: 10 * 1024 * 1024,

  // Types MIME acceptés
  ACCEPTED_TYPES: {
    // Images
    IMAGES: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ],

    // Documents
    DOCUMENTS: [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
    ],

    // Feuilles de calcul
    SPREADSHEETS: [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],

    // Présentations
    PRESENTATIONS: [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ],

    // Archives
    ARCHIVES: [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
    ],

    // Audio
    AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'],

    // Vidéo
    VIDEO: ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo'],
  },
};

// Fonction pour obtenir tous les types acceptés
export const getAllAcceptedTypes = (): string[] => {
  return Object.values(FILE_CONFIG.ACCEPTED_TYPES).flat();
};

// Fonction pour valider un fichier
export const validateFile = (
  file: File
): { isValid: boolean; error?: string } => {
  // Vérifier la taille
  if (file.size > FILE_CONFIG.MAX_SIZE) {
    return {
      isValid: false,
      error: `Le fichier est trop volumineux. Taille maximale : ${
        FILE_CONFIG.MAX_SIZE / 1024 / 1024
      }MB`,
    };
  }

  // Vérifier le type MIME
  const acceptedTypes = getAllAcceptedTypes();
  if (!acceptedTypes.includes(file.type)) {
    return {
      isValid: false,
      error:
        'Type de fichier non supporté. Formats acceptés : images, documents PDF, Word, Excel, PowerPoint, archives, audio/vidéo.',
    };
  }

  return { isValid: true };
};

// Fonction pour obtenir l'icône selon le type de fichier
export const getFileIcon = (mimeType: string): string => {
  if (FILE_CONFIG.ACCEPTED_TYPES.IMAGES.includes(mimeType)) {
    return 'fa-solid fa-image';
  }
  if (FILE_CONFIG.ACCEPTED_TYPES.DOCUMENTS.includes(mimeType)) {
    return 'fa-solid fa-file-text';
  }
  if (FILE_CONFIG.ACCEPTED_TYPES.SPREADSHEETS.includes(mimeType)) {
    return 'fa-solid fa-file-excel';
  }
  if (FILE_CONFIG.ACCEPTED_TYPES.PRESENTATIONS.includes(mimeType)) {
    return 'fa-solid fa-file-powerpoint';
  }
  if (FILE_CONFIG.ACCEPTED_TYPES.ARCHIVES.includes(mimeType)) {
    return 'fa-solid fa-file-archive';
  }
  if (FILE_CONFIG.ACCEPTED_TYPES.AUDIO.includes(mimeType)) {
    return 'fa-solid fa-file-audio';
  }
  if (FILE_CONFIG.ACCEPTED_TYPES.VIDEO.includes(mimeType)) {
    return 'fa-solid fa-file-video';
  }
  return 'fa-solid fa-file';
};

// Fonction pour formater la taille du fichier
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
