import axios from 'axios'

// Instancia única de axios para consumir la API del backend.
// La URL base sale de la variable de entorno VITE_API_URL (ver .env).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api
