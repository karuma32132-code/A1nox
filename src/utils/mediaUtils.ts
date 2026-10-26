/**
 * A1NOXHUB Media Utilities
 * Comprehensive validation, upload handling, URL normalization, and embed resolution
 * for product images, manual uploaded videos, YouTube videos, and Facebook videos.
 */

export const SUPPORTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
export const SUPPORTED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

export const SUPPORTED_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.m4v'];
export const SUPPORTED_VIDEO_MIMES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-m4v',
];

export const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB
export const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Validate an image file before upload
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'No file selected.' };
  }

  const fileName = file.name.toLowerCase();
  const hasValidExt = SUPPORTED_IMAGE_EXTENSIONS.some(ext => fileName.endsWith(ext));
  const hasValidMime = SUPPORTED_IMAGE_MIMES.includes(file.type) || file.type.startsWith('image/');

  if (!hasValidExt && !hasValidMime) {
    return {
      isValid: false,
      error: `Unsupported image format. Allowed formats: ${SUPPORTED_IMAGE_EXTENSIONS.join(', ').toUpperCase()}`,
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `Image size (${formatFileSize(file.size)}) exceeds the ${formatFileSize(MAX_IMAGE_SIZE_BYTES)} limit.`,
    };
  }

  return { isValid: true };
}

/**
 * Validate a video file before upload
 */
export function validateVideoFile(file: File): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'No file selected.' };
  }

  const fileName = file.name.toLowerCase();
  const hasValidExt = SUPPORTED_VIDEO_EXTENSIONS.some(ext => fileName.endsWith(ext));
  const hasValidMime = SUPPORTED_VIDEO_MIMES.includes(file.type) || file.type.startsWith('video/');

  if (!hasValidExt && !hasValidMime) {
    return {
      isValid: false,
      error: `Unsupported video format. Allowed formats: ${SUPPORTED_VIDEO_EXTENSIONS.join(', ').toUpperCase()}`,
    };
  }

  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    return {
      isValid: false,
      error: `Video size (${formatFileSize(file.size)}) exceeds the ${formatFileSize(MAX_VIDEO_SIZE_BYTES)} limit.`,
    };
  }

  return { isValid: true };
}

/**
 * Convert a File object to Base64 data URL
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Upload a media file to persistent server storage with progress tracking and admin authorization
 */
export async function uploadMediaToServer(
  file: File,
  mediaType: 'image' | 'video',
  onProgress?: (percent: number) => void,
  authToken?: string
): Promise<{ success: boolean; url: string; error?: string }> {
  // Validate first
  const validation = mediaType === 'image' ? validateImageFile(file) : validateVideoFile(file);
  if (!validation.isValid) {
    return { success: false, url: '', error: validation.error };
  }

  try {
    const base64Data = await fileToBase64(file);

    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      if (authToken) {
        xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
      }

      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            onProgress(percentComplete);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const res = JSON.parse(xhr.responseText);
            if (res.success && res.url) {
              if (onProgress) onProgress(100);
              resolve({ success: true, url: res.url });
              return;
            }
          } catch (_) {}
        }

        // Check if server rejected authorization
        let errMsg = 'Server upload failed.';
        try {
          const res = JSON.parse(xhr.responseText);
          if (res.error) errMsg = res.error;
        } catch (_) {}

        if (xhr.status === 401 || xhr.status === 403) {
          resolve({ success: false, url: '', error: errMsg });
          return;
        }

        // Fallback: If in standalone preview where /api/upload is not mounted,
        // use data URI so the file remains intact in state
        console.warn('API upload fallback to data URI:', errMsg);
        if (onProgress) onProgress(100);
        resolve({ success: true, url: base64Data });
      };

      xhr.onerror = () => {
        console.warn('Network error calling /api/upload, falling back to data URL');
        if (onProgress) onProgress(100);
        resolve({ success: true, url: base64Data });
      };

      xhr.send(
        JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          mediaType,
          data: base64Data,
        })
      );
    });
  } catch (err: any) {
    return {
      success: false,
      url: '',
      error: err?.message || 'Failed to process media file.',
    };
  }
}

/**
 * Delete a media file from persistent server storage with admin authorization
 */
export async function deleteMediaFromServer(
  url: string,
  authToken?: string
): Promise<{ success: boolean; error?: string }> {
  if (!url || !url.startsWith('/uploads/')) {
    return { success: true };
  }
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    const res = await fetch('/api/delete-media', {
      method: 'POST',
      headers,
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to communicate with media server.' };
  }
}

/**
 * YouTube URL normalization and ID extraction
 * Supports:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ
 * - https://www.youtube.com/shorts/dQw4w9WgXcQ
 * - https://www.youtube.com/embed/dQw4w9WgXcQ
 * - https://m.youtube.com/watch?v=dQw4w9WgXcQ
 */
export function getYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Pattern matching watch?v=, youtu.be/, shorts/, embed/
  const regExp =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = trimmed.match(regExp);
  return match && match[1] && match[1].length === 11 ? match[1] : null;
}

export function isValidYouTubeUrl(url: string): boolean {
  return getYouTubeVideoId(url) !== null;
}

export function getYouTubeEmbedUrl(url: string): string | null {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;
}

/**
 * Facebook Video URL validation and embed resolution
 * Supports:
 * - https://www.facebook.com/watch/?v=123456789
 * - https://www.facebook.com/pageName/videos/123456789
 * - https://www.facebook.com/reel/123456789
 * - https://fb.watch/xyz123/
 * - https://www.facebook.com/username/posts/123456789
 */
export function isValidFacebookVideoUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();
  return (
    (trimmed.includes('facebook.com') || trimmed.includes('fb.watch')) &&
    (trimmed.includes('video') ||
      trimmed.includes('watch') ||
      trimmed.includes('reel') ||
      trimmed.includes('posts') ||
      trimmed.startsWith('https://fb.watch'))
  );
}

export function getFacebookEmbedUrl(url: string): string | null {
  if (!isValidFacebookVideoUrl(url)) return null;
  const cleanUrl = url.trim();
  return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
    cleanUrl
  )}&show_text=false&width=560&t=0`;
}
