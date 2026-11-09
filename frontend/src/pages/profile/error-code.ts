import axios from 'axios';

export function errorCode(error: unknown): string | undefined {
  if (!axios.isAxiosError(error)) return undefined;
  return error.response?.data?.error?.code;
}
