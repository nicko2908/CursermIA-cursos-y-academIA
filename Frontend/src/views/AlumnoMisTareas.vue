<template>
  <div>
    <h2 class="text-h5 text-weight-bold text-white q-mb-md">Mis tareas</h2>

    <div v-if="cargando" class="text-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-md text-grey-4">Cargando tus tareas...</div>
    </div>

    <q-list v-else-if="trabajos.length" bordered separator class="tareas-lista">
      <q-item v-for="trabajo in trabajos" :key="trabajo._id">
        <q-item-section avatar>
          <q-icon
            :name="trabajo.entregado ? 'check_circle' : 'hourglass_empty'"
            :color="trabajo.entregado ? 'positive' : 'warning'"
            size="26px"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ trabajo.titulo }}</q-item-label>
          <q-item-label caption>
            Curso: {{ trabajo.curso?.nombre }} — Límite:
            {{ formatoFecha(trabajo.fechaLimite) }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-badge :color="trabajo.entregado ? 'positive' : 'warning'" rounded>
            {{ trabajo.entregado ? 'Entregado' : 'Pendiente' }}
          </q-badge>
        </q-item-section>
      </q-item>
    </q-list>

    <div v-else class="vacio">
      <q-icon name="assignment" size="42px" />
      <p>No hay tareas por ahora.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api/axios.js'
import { useAuthStore } from '../stores/auth.js'

const auth = useAuthStore()

const trabajos = ref([])
const cargando = ref(true)

function formatoFecha(f) {
  if (!f) return ''
  return new Date(f).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(async () => {
  try {
    const { data } = await api.get(`/aprendices/${auth.usuario.cedula}/dashboard`)
    trabajos.value = data.trabajos || []
  } catch (e) {
    console.error(e)
  } finally {
    cargando.value = false
  }
})
</script>

<style scoped>
.tareas-lista {
  max-width: 860px;
}

.vacio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 56px 16px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}

.vacio p {
  margin: 0;
}
</style>
