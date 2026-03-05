const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Upload a single file via the backend's Cloudinary-backed endpoint.
 * Backend route: POST /api/upload (multipart/form-data, field: file)
 * @param {{file: File, folder?: string}} params
 * @returns {Promise<{url: string, public_id: string, resource_type: string}>}
 */
export async function uploadFile({ file, folder }) {
  if (!file) throw new Error('No file provided');

  const formData = new FormData();
  formData.append('file', file);
  if (folder) formData.append('folder', folder);

  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || 'Upload failed');
  }

  return data;
}
