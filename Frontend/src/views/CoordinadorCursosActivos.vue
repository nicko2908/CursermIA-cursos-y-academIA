<template>
  <div>
    <div class="row items-center justify-between q-mb-md">
      <h2 class="text-h5 text-weight-bold text-white q-my-none">Cursos activos</h2>
      <q-btn
        outline
        color="white"
        no-caps
        icon="refresh"
        label="Refrescar"
        :loading="refrescando"
        @click="cargar(false)"
      />
    </div>

    <div v-if="cargando" class="text-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-md text-grey-4">Cargando cursos...</div>
    </div>

    <div v-else class="cursos-grid">
      <article
        v-for="curso in cursosConConteo"
        :key="curso.nombre"
        class="curso-card"
        @click="abrirCurso(curso)"
      >
        <div class="curso-head">
          <div class="curso-nombre">{{ curso.nombre }}</div>
          <span
            class="curso-modalidad"
            :class="curso.modalidad === 'virtual' ? 'mod-virtual' : 'mod-presencial'"
          >
            <q-icon
              :name="curso.modalidad === 'virtual' ? 'wifi' : 'location_on'"
              size="15px"
            />
            {{ curso.modalidad === 'virtual' ? 'Virtual' : 'Presencial' }}
          </span>
        </div>

        <div class="curso-docente">
          <q-icon name="person" size="18px" />
          Profe {{ curso.docente }}
        </div>

        <div class="curso-fechas">
          <span>
            <q-icon name="event" size="16px" />
            Inicio: {{ formatoFecha(curso.fechaInicio) }}
          </span>
          <span>
            <q-icon name="event_available" size="16px" />
            Fin: {{ formatoFecha(curso.fechaFin) }}
          </span>
        </div>

        <div class="curso-stats">
          <div class="stat">
            <div class="stat-label">Estudiantes inscritos</div>
            <div class="stat-value">{{ curso.estudiantes }}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Culminación</div>
            <div class="stat-value">{{ curso.porcentaje }}%</div>
            <q-linear-progress
              :value="curso.porcentaje / 100"
              rounded
              color="primary"
              track-color="grey-9"
              class="q-mt-sm"
            />
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/axios.js'
import { cursosCoordinador } from '../data/cursosCoordinador.js'

const router = useRouter()

function abrirCurso(curso) {
  router.push(`/dashboard/coordinador/curso/${curso.id}`)
}

const resumen = ref({}) // cursoNombre -> solicitudes aprobadas
const cargando = ref(true)
const refrescando = ref(false)

// Conteo = base estática + inscripciones aprobadas del backend
const cursosConConteo = computed(() =>
  cursosCoordinador.map((c) => ({
    ...c,
    estudiantes: (c.estudiantesBase || 0) + (resumen.value[c.nombre] || 0),
  }))
)

function formatoFecha(f) {
  if (!f) return ''
  return new Date(`${f}T00:00:00`).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

async function cargar(mostrarSpinner = true) {
  if (mostrarSpinner) cargando.value = true
  else refrescando.value = true

  try {
    const { data } = await api.get('/solicitudes/resumen')
    const map = {}
    for (const r of data || []) map[r.cursoNombre] = r.aprobadas || 0
    resumen.value = map
  } catch (e) {
    console.error(e)
  } finally {
    cargando.value = false
    refrescando.value = false
  }
}

onMounted(() => cargar(true))
</script>

<style scoped>
.cursos-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.curso-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 22px;
  border-radius: 16px;
  background: #0d1729;
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.curso-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.4);
  border-color: rgba(32, 100, 227, 0.5);
}

.curso-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.curso-nombre {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.3;
}

.curso-modalidad {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex: 0 0 auto;
  padding: 5px 11px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
}

.mod-virtual {
  background: rgba(32, 100, 227, 0.9);
  color: #ffffff;
}

.mod-presencial {
  background: rgba(0, 150, 136, 0.9);
  color: #ffffff;
}

.curso-docente {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

.curso-docente .q-icon {
  color: var(--color-terciario, #4f85f0);
}

.curso-fechas {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.curso-fechas span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.6);
}

.curso-fechas .q-icon {
  color: var(--color-terciario, #4f85f0);
}

.curso-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.4rem;
  font-weight: 800;
  color: #ffffff;
}

@media (min-width: 900px) {
  .cursos-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
