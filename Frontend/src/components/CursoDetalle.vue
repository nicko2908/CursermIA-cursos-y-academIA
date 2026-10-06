<template>
  <div>
    <div class="volver row items-center q-mb-md" @click="emit('volver')">
      <q-icon name="arrow_back" size="20px" />
      <span>{{ textoVolver }}</span>
    </div>

    <!-- Sin aprendices -->
    <div v-if="!cargando && !estudiantes.length" class="sin-aprendices">
      <q-icon name="group" size="46px" />
      <p>Sin aprendices aún...</p>
      <q-btn
        color="primary"
        unelevated
        no-caps
        label="Ver solicitudes"
        icon-right="arrow_forward"
        @click="emit('verSolicitudes')"
      />
    </div>

    <div v-else class="detalle">
      <!-- Izquierda: estudiantes -->
      <div class="detalle-col detalle-estudiantes">
        <div class="panel">
          <div class="row items-center justify-between q-mb-md">
            <div class="panel-titulo">Estudiantes matriculados</div>
            <q-badge color="primary" rounded>{{ estudiantes.length }}</q-badge>
          </div>

          <div class="promedio">
            <div>
              <div class="promedio-label">Promedio general</div>
              <div class="promedio-valor">{{ promedioGeneral }}<span>/100</span></div>
            </div>
            <q-icon name="insights" size="34px" class="promedio-icono" />
          </div>
          <q-linear-progress
            :value="promedioGeneral / 100"
            rounded
            color="primary"
            track-color="grey-9"
            class="q-mb-md"
          />

          <div v-if="cargando" class="text-center q-pa-lg">
            <q-spinner color="primary" size="2.5em" />
          </div>
          <div v-else class="lista-estudiantes">
            <div
              v-for="(est, i) in estudiantes"
              :key="i"
              class="estudiante"
              @click="abrirEstudiante(est)"
            >
              <q-avatar size="34px" color="primary" text-color="white">
                {{ inicial(est.nombre) }}
              </q-avatar>
              <div class="col est-info">
                <div class="est-nombre">
                  {{ est.nombre }}
                  <q-badge v-if="est.real" color="positive" rounded class="q-ml-xs">
                    Nuevo
                  </q-badge>
                </div>
                <div class="est-cedula">C.C. {{ est.cedula }}</div>
              </div>
              <div class="est-promedio" :class="colorPromedio(est.promedio)">
                {{ est.promedio }}
              </div>
              <q-icon name="chevron_right" size="18px" class="est-arrow" />
            </div>
          </div>
        </div>
      </div>

      <!-- Derecha: información del curso -->
      <div class="detalle-col detalle-curso">
        <div class="panel">
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

          <div v-if="curso.docente" class="curso-docente">
            <q-icon name="person" size="18px" />
            Profe {{ curso.docente }}
          </div>

          <div class="curso-fechas">
            <span v-if="curso.fechaInicio">
              <q-icon name="event" size="16px" />
              Inicio: {{ formatoFecha(curso.fechaInicio) }}
            </span>
            <span v-if="curso.fechaFin">
              <q-icon name="event_available" size="16px" />
              Fin: {{ formatoFecha(curso.fechaFin) }}
            </span>
            <span v-if="aula">
              <q-icon name="meeting_room" size="16px" />
              {{ aula }}
            </span>
          </div>

          <div class="curso-stats">
            <div class="stat">
              <div class="stat-label">Estudiantes inscritos</div>
              <div class="stat-value">{{ estudiantes.length }}<span v-if="curso.cupos">/{{ curso.cupos }}</span></div>
            </div>
            <div v-if="porcentaje !== null" class="stat">
              <div class="stat-label">Culminación</div>
              <div class="stat-value">{{ porcentaje }}%</div>
              <q-linear-progress
                :value="porcentaje / 100"
                rounded
                color="primary"
                track-color="grey-9"
                class="q-mt-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal con tareas y calificaciones del estudiante -->
    <q-dialog v-model="modalAbierto">
      <q-card class="eval-modal">
        <q-card-section class="eval-head">
          <q-avatar size="52px" color="primary" text-color="white">
            {{ inicial(estudianteSeleccionado?.nombre) }}
          </q-avatar>
          <div class="col q-ml-md">
            <div class="eval-nombre">{{ estudianteSeleccionado?.nombre }}</div>
            <div class="eval-cedula">C.C. {{ estudianteSeleccionado?.cedula }}</div>
          </div>
          <q-btn flat round dense icon="close" color="white" v-close-popup />
        </q-card-section>

        <q-separator color="grey-9" />

        <q-card-section v-if="estudianteSeleccionado">
          <div class="eval-resumen">
            <div>
              <div class="eval-label">Promedio</div>
              <div class="eval-promedio" :class="colorPromedio(estudianteSeleccionado.promedio)">
                {{ estudianteSeleccionado.promedio }}<span>/100</span>
              </div>
            </div>
            <div class="eval-entregadas">
              {{ estudianteSeleccionado.evaluacion.entregadas }} /
              {{ estudianteSeleccionado.evaluacion.total }} entregadas
            </div>
          </div>

          <div class="eval-lista">
            <div
              v-for="(t, i) in estudianteSeleccionado.evaluacion.tareas"
              :key="i"
              class="eval-tarea"
              :class="{ 'eval-tarea--pendiente': !t.entregado }"
            >
              <div class="col">
                <div class="eval-titulo">{{ t.titulo }}</div>
                <q-badge :color="t.entregado ? 'positive' : 'warning'" rounded class="q-mt-xs">
                  {{ t.entregado ? 'Entregado' : 'Pendiente' }}
                </q-badge>
              </div>
              <div
                class="eval-nota"
                :class="t.entregado ? colorPromedio(t.calificacion) : 'eval-nota--vacia'"
              >
                {{ t.entregado ? t.calificacion : '—' }}
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api/axios.js'
import { hashTexto } from '../utils/cursos.js'

const props = defineProps({
  curso: { type: Object, required: true },
  estudiantesBase: { type: Number, default: 0 },
  porcentaje: { type: Number, default: null },
  textoVolver: { type: String, default: 'Volver' },
})

const emit = defineEmits(['volver', 'verSolicitudes'])

const solicitudes = ref([])
const cargando = ref(true)
const modalAbierto = ref(false)
const estudianteSeleccionado = ref(null)

// Tareas simuladas por aprendiz
const TAREAS = [
  'Taller 1: Conceptos fundamentales',
  'Taller 2: Práctica guiada',
  'Proyecto integrador — Entrega 1',
  'Proyecto integrador — Entrega 2',
  'Examen final',
]

const NOMBRES = [
  'Juan', 'María', 'Andrés', 'Camila', 'Santiago', 'Valentina', 'Sebastián',
  'Daniela', 'Mateo', 'Sofía', 'Nicolás', 'Isabella', 'Alejandro', 'Mariana',
  'Samuel', 'Gabriela', 'Tomás', 'Lucía', 'Emilio', 'Sara',
]
const APELLIDOS = [
  'Gómez', 'Rodríguez', 'Martínez', 'López', 'García', 'Pérez', 'Sánchez',
  'Ramírez', 'Torres', 'Flores', 'Rivera', 'Vargas', 'Castro', 'Rojas',
  'Mendoza', 'Ortiz', 'Silva', 'Cárdenas',
]

function evaluacionDe(cedula) {
  const tareas = TAREAS.map((titulo, i) => {
    const h = hashTexto(`${cedula}-${i}`)
    const entregado = h % 10 < 8
    const calificacion = entregado ? 55 + (h % 46) : null
    return { titulo, entregado, calificacion }
  })
  const entregadas = tareas.filter((t) => t.entregado)
  const promedio = entregadas.length
    ? Math.round(entregadas.reduce((a, t) => a + t.calificacion, 0) / entregadas.length)
    : 0
  return { tareas, entregadas: entregadas.length, total: tareas.length, promedio }
}

function nombreFiller(i) {
  const n = NOMBRES[i % NOMBRES.length]
  const a1 = APELLIDOS[(i * 3) % APELLIDOS.length]
  const a2 = APELLIDOS[(i * 7 + 5) % APELLIDOS.length]
  return `${n} ${a1} ${a2}`
}
function cedulaFiller(i) {
  return String(1000000000 + ((i * 7919) % 899999999))
}

const reales = computed(() =>
  solicitudes.value.filter(
    (s) => s.cursoNombre === props.curso.nombre && s.estado === 'aprobada'
  )
)

const estudiantes = computed(() => {
  const total = (props.estudiantesBase || 0) + reales.value.length
  const lista = []
  for (const s of reales.value) {
    const evaluacion = evaluacionDe(s.aprendizCedula)
    lista.push({
      nombre: s.aprendizNombre || s.aprendizCedula,
      cedula: s.aprendizCedula,
      real: true,
      evaluacion,
      promedio: evaluacion.promedio,
    })
  }
  for (let i = lista.length; i < total; i++) {
    const cedula = cedulaFiller(i)
    const evaluacion = evaluacionDe(cedula)
    lista.push({
      nombre: nombreFiller(i),
      cedula,
      real: false,
      evaluacion,
      promedio: evaluacion.promedio,
    })
  }
  return lista
})

const promedioGeneral = computed(() => {
  if (!estudiantes.value.length) return 0
  const suma = estudiantes.value.reduce((acc, e) => acc + e.promedio, 0)
  return Math.round(suma / estudiantes.value.length)
})

const aula = computed(() => {
  if (!props.curso.modalidad) return ''
  return props.curso.modalidad === 'virtual'
    ? 'Aula virtual · Zoom'
    : `Aula ${200 + (hashTexto(props.curso.nombre) % 100)}`
})

function colorPromedio(p) {
  if (p >= 80) return 'est-promedio--alto'
  if (p >= 60) return 'est-promedio--medio'
  return 'est-promedio--bajo'
}
function inicial(nombre) {
  return nombre ? nombre.charAt(0).toUpperCase() : '?'
}
function formatoFecha(f) {
  if (!f) return ''
  return new Date(`${String(f).slice(0, 10)}T00:00:00`).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
function abrirEstudiante(est) {
  estudianteSeleccionado.value = est
  modalAbierto.value = true
}

onMounted(async () => {
  if (!props.curso?.docente) {
    cargando.value = false
    return
  }
  try {
    const { data } = await api.get(
      `/solicitudes/docente/${encodeURIComponent(props.curso.docente)}`
    )
    solicitudes.value = data || []
  } catch (e) {
    console.error(e)
  } finally {
    cargando.value = false
  }
})
</script>

<style scoped>
.volver {
  display: inline-flex;
  gap: 6px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.9rem;
  font-weight: 600;
}
.volver:hover {
  color: #ffffff;
}

.detalle {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 24px;
  align-items: start;
}

.panel {
  background: #0d1729;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 22px;
}

.panel-titulo {
  font-size: 1.05rem;
  font-weight: 700;
  color: #ffffff;
}

.promedio {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(32, 100, 227, 0.12);
  border: 1px solid rgba(32, 100, 227, 0.3);
  margin-bottom: 12px;
}
.promedio-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}
.promedio-valor {
  font-size: 2rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1;
}
.promedio-valor span {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
}
.promedio-icono {
  color: #6fd6ff;
}

.lista-estudiantes {
  max-height: 56vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 4px;
}

.estudiante {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}
.estudiante:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(32, 100, 227, 0.5);
}
.est-info {
  min-width: 0;
}
.est-nombre {
  font-size: 0.9rem;
  font-weight: 600;
  color: #ffffff;
}
.est-cedula {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.55);
}
.est-promedio {
  flex: 0 0 auto;
  font-size: 1rem;
  font-weight: 800;
}
.est-arrow {
  flex: 0 0 auto;
  color: rgba(255, 255, 255, 0.4);
}
.est-promedio--alto {
  color: #5fe0a0;
}
.est-promedio--medio {
  color: #ffd166;
}
.est-promedio--bajo {
  color: #ff7b7b;
}

.curso-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.curso-nombre {
  font-size: 1.2rem;
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
  margin-bottom: 14px;
}
.curso-docente .q-icon {
  color: var(--color-terciario, #4f85f0);
}
.curso-fechas {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}
.curso-fechas span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.65);
}
.curso-fechas .q-icon {
  color: var(--color-terciario, #4f85f0);
}
.curso-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding-top: 16px;
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
.stat-value span {
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.45);
}

/* Vacío */
.sin-aprendices {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 64px 16px;
  text-align: center;
  color: rgba(255, 255, 255, 0.65);
}
.sin-aprendices .q-icon {
  color: rgba(255, 255, 255, 0.45);
}
.sin-aprendices p {
  margin: 0;
  font-size: 1.05rem;
}

/* Modal evaluación */
.eval-modal {
  width: 100%;
  max-width: 520px;
  border-radius: 16px;
  background: #0d1729;
  color: #ffffff;
}
.eval-head {
  display: flex;
  align-items: center;
}
.eval-nombre {
  font-size: 1.15rem;
  font-weight: 800;
  color: #ffffff;
}
.eval-cedula {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.6);
}
.eval-resumen {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(32, 100, 227, 0.12);
  border: 1px solid rgba(32, 100, 227, 0.3);
  margin-bottom: 16px;
}
.eval-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}
.eval-promedio {
  font-size: 1.9rem;
  font-weight: 800;
  line-height: 1;
}
.eval-promedio span {
  font-size: 0.95rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
}
.eval-entregadas {
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}
.eval-lista {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.eval-tarea {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
}
.eval-tarea--pendiente {
  opacity: 0.75;
}
.eval-titulo {
  font-size: 0.9rem;
  font-weight: 600;
  color: #ffffff;
}
.eval-nota {
  flex: 0 0 auto;
  font-size: 1.1rem;
  font-weight: 800;
}
.eval-nota--vacia {
  color: rgba(255, 255, 255, 0.35);
}

@media (max-width: 1023px) {
  .detalle {
    grid-template-columns: 1fr;
  }
  .detalle-curso {
    order: -1;
  }
  .lista-estudiantes {
    max-height: none;
  }
}
</style>
