import { api } from '../lib/api';

export const accountApi = {
  async export(): Promise<Blob> {
    const { data } = await api.get<unknown>('/account/export');
    return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  },
  async delete(password: string): Promise<void> {
    await api.post('/account/delete', { password });
  },
};
