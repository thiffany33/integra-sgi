import { api } from '../lib/api';

export type ContactMessage = { name: string; email: string; message: string; website?: string };

export const contactApi = {
  async status(): Promise<{ available: boolean }> {
    const { data } = await api.get<{ available: boolean }>('/contact');
    return data;
  },
  async send(message: ContactMessage): Promise<void> {
    await api.post('/contact', message);
  },
};
