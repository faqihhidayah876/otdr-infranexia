import axios from 'axios';

// Pastikan VITE_API_URL ini sudah di-set di Vercel: https://theresa-2sid.alwaysdata.net/api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Accept': 'application/json',
  },
});

export const uploadOtdrFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Terjadi kesalahan saat menghubungi server.';
  }
};

export const getHistoryData = async () => {
  try {
    const response = await api.get('/history');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Gagal mengambil data riwayat.';
  }
};

export default api;