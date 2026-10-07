const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1').replace(/\/$/, '');

export const filesApi = {
  templateDownloadUrl(documentId: string): string {
    return `${API_URL}/files/templates/${encodeURIComponent(documentId)}`;
  },
};
