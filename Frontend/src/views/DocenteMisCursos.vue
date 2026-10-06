<template>
  <div>
    <h2 class="text-h5 text-weight-bold text-white q-mb-md">Mis cursos</h2>

    <div v-if="!misCursos.length" class="vacio">
      <q-icon name="menu_book" size="42px" />
      <p>Aún no dictas ningún curso.</p>
    </div>

    <div v-else class="cursos-grid">
      <article
        v-for="curso in misCursos"
        :key="curso.nombre"
        class="curso-card"
        @click="abrirCurso(curso)"
      >
        <div class="curso-head">
          <div class="curso-nombre">{{ curso.nombre }}</div>
          <span
            v-if="curso.modalidad"
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

        <div v-if="curso.fechaInicio" class="curso-fechas">
          <span>
            <q-icon name="event" size="16px" />
            Inicio: {{ formatoFecha(curso.fechaInicio) }}
          </span>
          <span>
            <q-icon name="event_available" size="16px" />
            Fin: {{ formatoFecha(curso.fechaFin) }}
          </span>
        </div>

        <div class="curso-stats" :class="{ 'curso-stats--una': curso.porcentaje == null }">
          <div class="stat">
            <div class="stat-label">Estudiantes inscritos</div>
            <div class="stat-value">{{ estudiantesDe(curso) }}</div>
          </div>
          <div v-if="curso.porcentaje != null" class="stat">
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
import { useAuthStore } from '../stores/auth.js'
import { cursosCatalogo } from '../data/cursosCatalogo.js'
import { cursosCoordinador } from '../data/cursosCoordinador.js'

const router = useRouter()
const auth = useAuthStore()

function abrirCurso(curso) {
  router.push(`/dashboard/docente/curso/${encodeURIComponent(curso.nombre)}`)
}
const resumen = ref({}) // cursoNombre -> solicitudes aprobadas
const cursosBackend = ref([])

const nombreDocente = computed(() =>
  `${auth.usuario?.nombre || ''} ${auth.usuario?.apellido || ''}`.trim()
)

// Cursos que dicta el docente: datos del coordinador + catálogo + cursos creados en el backend
const misCursos = computed(() => {
  const lista = [...cursosCoordinador]

  for (const c of cursosCatalogo) {
    if (!lista.some((x) => x.nombre === c.nombre)) {
      lista.push({ ...c, porcentaje: null, estudiantesBase: null })
    }
  }

  for (const c of cursosBackend.value) {
    if (c.activo === false) continue
    if (!lista.some((x) => x.nombre === c.nombre)) {
      lista.push({
        nombre: c.nombre,
        docente: c.docente || '',
        modalidad: c.modalidad,
        nivel: c.nivel || 'Básico',
        fechaInicio: c.fechaInicio ? String(c.fechaInicio).slice(0, 10) : null,
        fechaFin: c.fechaFin ? String(c.fechaFin).slice(0, 10) : null,
        porcentaje: null,
        estudiantesBase: 0,
      })
    }
  }

  return lista.filter((c) => c.docente === nombreDocente.value)
})

function estudiantesDe(curso) {
  return (curso.estudiantesBase || 0) + (resumen.value[curso.nombre] || 0)
}

function formatoFecha(f) {
  if (!f) return ''
  return new Date(`${f}T00:00:00`).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(async () => {
  try {
    const [resResumen, resCursos] = await Promise.all([
      api.get('/solicitudes/resumen'),
      api.get('/cursos'),
    ])
    const map = {}
    for (const r of resResumen.data || []) map[r.cursoNombre] = r.aprobadas || 0
    resumen.value = map
    cursosBackend.value = resCursos.data || []
  } catch (e) {
    console.error(e)
  }
})
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

.curso-stats--una {
  grid-template-columns: 1fr;
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

.vacio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 56px 16px;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
}

.vacio .q-icon {
  color: rgba(255, 255, 255, 0.45);
}

.vacio p {
  margin: 0;
}

@media (min-width: 900px) {
  .cursos-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
