import axios from 'axios';
import toast from 'react-hot-toast';
import { supabase } from './supabase';

export const api = axios.create({
  baseURL:
    (import.meta.env.VITE_API_URL as string) ??
    'https://alwrsadiqcectzqhmgli.supabase.co/functions/v1',
  timeout: 20000,
});

api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['apikey'] = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ?? '';
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    const msg = error.response?.data?.message || error.message || 'Erro desconhecido';
    if (error.response?.status === 401) {
      toast.error('Sessão expirada');
    } else if (error.response?.status >= 500) {
      toast.error('Erro no servidor');
    } else {
      toast.error(msg);
    }
    return Promise.reject(error);
  }
);
