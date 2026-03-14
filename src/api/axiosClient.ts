import axios from 'axios';
const axiosClient = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true, // Luôn gửi kèm Cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;