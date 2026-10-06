<template>
  <div>
    <h2 class="text-h5 text-weight-bold text-white q-mb-md">Cronograma</h2>

    <div v-if="cargando" class="text-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-md text-grey-4">Cargando tu cronograma...</div>
    </div>

    <CalendarioEventos v-else :eventos="eventos" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api/axios.js'
import { useAuthStore } from '../stores/auth.js'
import CalendarioEventos from '../components/CalendarioEventos.vue'

const auth = useAuthStore()

const trabajos = ref([])
const eventosBD = ref([])
const cargando = ref(true)

function toKey(fecha) {
  const d = new Date(fecha)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

// Eventos = trabajos (fecha límite) + eventos creados por los docentes
const eventos = computed(() => {
  const deTrabajos = trabajos.value
    .filter((t) => t.fechaLimite)
    .map((t) => ({
      tipo: 'trabajo',
      titulo: t.titulo,
      curso: t.curso?.nombre || t.cursoNombre || '',
      fecha: toKey(t.fechaLimite),
      entregado: !!t.entregado,
    }))

  const deEventos = eventosBD.value.map((e) => ({
    tipo: e.tipo || 'clase',
    titulo: e.titulo,
    curso: e.cursoNombre || '',
    fecha: String(e.fecha).slice(0, 10),
    horaInicio: e.horaInicio,
    horaFin: e.horaFin,
    descripcion: e.descripcion,
  }))

  return [...deTrabajos, ...deEventos]
})

onMounted(async () => {
  try {
    const [resDash, resEv] = await Promise.all([
      api.get(`/aprendices/${auth.usuario.cedula}/dashboard`),
      api.get(`/eventos/aprendiz/${auth.usuario.cedula}`),
    ])
    trabajos.value = resDash.data.trabajos || []
    eventosBD.value = resEv.data || []
  } catch (e) {
    console.error(e)
  } finally {
    cargando.value = false
  }
})
</script>
