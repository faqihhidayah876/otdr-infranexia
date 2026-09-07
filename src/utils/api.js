import axios from 'axios';

// Default fallback menggunakan backend production Alwaysdata jika VITE_API_URL belum di-set di Vercel
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://theresa-2sid.alwaysdata.net/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
});

export const uploadOtdrFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    // Biarkan Axios mengatur header Content-Type beserta boundary multipart secara otomatis
    const response = await api.post('/upload', formData);
    return response.data;
  } catch (error) {
    console.error("Detail uploadOtdrFile error:", error);
    const serverMessage = 
      error.response?.data?.errors?.file?.[0] || 
      error.response?.data?.message || 
      error.message || 
      'Terjadi kesalahan saat menghubungi server.';
    throw serverMessage;
  }
};

export const getHistoryData = async () => {
  try {
    const response = await api.get('/history');
    return response.data;
  } catch (error) {
    console.error("Detail getHistoryData error:", error);
    const serverMessage = error.response?.data?.message || error.message || 'Gagal mengambil data riwayat.';
    throw serverMessage;
  }
};

export default api;