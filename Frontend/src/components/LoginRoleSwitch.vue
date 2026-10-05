<template>
  <div class="rol-switch">
    <button
      type="button"
      class="rol-btn"
      :class="{ 'rol-btn--active': rolActivo === 'alumno' }"
      :aria-pressed="rolActivo === 'alumno'"
      @click="cambiar('alumno')"
    >
      <q-icon name="school" size="18px" />
      <span>Aprendiz</span>
    </button>

    <button
      type="button"
      class="rol-btn"
      :class="{ 'rol-btn--active': rolActivo === 'profesor' }"
      :aria-pressed="rolActivo === 'profesor'"
      @click="cambiar('profesor')"
    >
      <q-icon name="assignment_ind" size="18px" />
      <span>Docente</span>
    </button>

    <button
      type="button"
      class="rol-btn"
      :class="{ 'rol-btn--active': rolActivo === 'coordinador' }"
      :aria-pressed="rolActivo === 'coordinador'"
      @click="cambiar('coordinador')"
    >
      <q-icon name="admin_panel_settings" size="18px" />
      <span>Coordinador</span>
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const RUTAS = {
  alumno: '/login/alumno',
  profesor: '/login/docente',
  coordinador: '/login/coordinador',
}

// Rol según la ruta actual (más fiable que depender de un prop)
function rolDeRuta() {
  if (route.path.startsWith('/login/alumno')) return 'alumno'
  if (route.path.startsWith('/login/coordinador')) return 'coordinador'
  return 'profesor'
}

// Estado local para que el color cambie al instante al hacer clic
const rolActivo = ref(rolDeRuta())

watch(
  () => route.path,
  () => {
    rolActivo.value = rolDeRuta()
  }
)

function cambiar(tipo) {
  if (tipo === rolActivo.value) return
  rolActivo.value = tipo // feedback inmediato
  router.push(RUTAS[tipo])
}
</script>

<style scoped>
.rol-switch {
  display: flex;
  gap: 6px;
  padding: 6px;
  background: #0b1c3a;
  border-radius: 12px;
  margin-bottom: 24px;
}

.rol-btn {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: none;
  cursor: pointer;
  padding: 9px 6px;
  border-radius: 8px;
  background-color: transparent;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  transition: background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease,
    transform 0.15s ease;
}

.rol-btn span {
  overflow: hidden;
  text-overflow: ellipsis;
}

.rol-btn:hover {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.08);
}

.rol-btn:active {
  transform: scale(0.97);
}

/* Botón seleccionado: azul principal, texto blanco y sombra */
.rol-btn--active,
.rol-btn--active:hover {
  background-color: var(--color-principal, #2064e3);
  color: #ffffff;
  box-shadow: 0 6px 14px rgba(32, 100, 227, 0.45);
}
</style>
