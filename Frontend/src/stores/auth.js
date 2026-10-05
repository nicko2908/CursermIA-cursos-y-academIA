import { defineStore } from 'pinia'

// Store de sesión: guarda el usuario logueado y persiste en localStorage.
export const useAuthStore = defineStore('auth', {
  state: () => ({
    // { rol: 'alumno' | 'profesor', cedula, nombre, apellido, correo, cursos }
    usuario: null,
  }),
  getters: {
    estaLogueado: (state) => !!state.usuario,
  },
  actions: {
    setUsuario(usuario) {
      this.usuario = usuario
    },
    logout() {
      this.usuario = null
    },
  },
  persist: true,
})
