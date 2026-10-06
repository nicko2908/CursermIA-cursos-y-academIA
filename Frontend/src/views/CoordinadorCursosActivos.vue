<template>
  <div>
    <div class="row items-center justify-between q-mb-md">
      <h2 class="text-h5 text-weight-bold text-white q-my-none">Cursos activos</h2>
      <div class="row q-gutter-sm">
        <q-btn
          color="primary"
          unelevated
          no-caps
          icon="add"
          label="Crear curso"
          @click="abrirModal"
        />
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
    </div>

    <div v-if="cargando" class="text-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-md text-grey-4">Cargando cursos...</div>
    </div>

    <div v-else class="cursos-grid">
      <article
        v-for="curso in cursos"
        :key="curso.id || curso.nombre"
        class="curso-card"
        :class="{
          'curso-card--click': !curso.backend,
          'curso-card--inactivo': curso.backend && curso.activo === false,
        }"
        @click="!curso.backend && abrirCurso(curso)"
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
            <div class="stat-label">Estudiantes / cupos</div>
            <div class="stat-value">{{ curso.estudiantes }}<span>/{{ curso.cupos }}</span></div>
          </div>
          <div class="stat">
            <div class="stat-label">Promedio general</div>
            <div class="stat-value stat-promedio">{{ curso.promedio }}<span>/100</span></div>
          </div>
        </div>

        <div class="curso-culminacion">
          <div class="stat-label">Culminación · {{ curso.porcentaje }}%</div>
          <q-linear-progress
            :value="curso.porcentaje / 100"
            rounded
            color="primary"
            track-color="grey-9"
          />
        </div>

        <div v-if="curso.backend" class="curso-nuevo">
          <q-icon :name="curso.activo === false ? 'block' : 'fiber_new'" size="15px" />
          {{ curso.activo === false ? 'Curso inactivo' : 'Curso creado por coordinación' }}
        </div>

        <div v-if="curso.backend" class="curso-acciones">
          <q-btn
            flat
            dense
            no-caps
            color="primary"
            icon="edit"
            label="Editar"
            @click.stop="abrirEditar(curso)"
          />
          <q-btn
            v-if="curso.activo !== false"
            flat
            dense
            no-caps
            color="deep-orange"
            icon="block"
            label="Desactivar"
            @click.stop="cambiarActivo(curso, false)"
          />
          <q-btn
            v-else
            flat
            dense
            no-caps
            color="positive"
            icon="check_circle"
            label="Activar"
            @click.stop="cambiarActivo(curso, true)"
          />
        </div>
      </article>
    </div>

    <!-- Modal crear curso -->
    <q-dialog v-model="modalCrear" @hide="resetForm">
      <q-card class="modal-curso">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">{{ modoEdicion ? 'Editar curso' : 'Crear curso' }}</div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form ref="formRef" class="q-gutter-md" @submit.prevent="crear">
            <q-input
              v-model="form.nombre"
              label="Nombre del curso"
              outlined
              dense
              lazy-rules
              :rules="[(v) => !!v || 'El nombre es obligatorio']"
            />

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-4">
                <q-select
                  v-model="form.modalidad"
                  :options="opcionesModalidad"
                  option-value="value"
                  option-label="label"
                  emit-value
                  map-options
                  label="Modalidad"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-sm-4">
                <q-select
                  v-model="form.docente"
                  :options="opcionesDocente"
                  label="Docente"
                  outlined
                  dense
                  lazy-rules
                  :rules="[(v) => !!v || 'Selecciona un docente']"
                />
              </div>
              <div class="col-12 col-sm-4">
                <q-select
                  v-model="form.nivel"
                  :options="opcionesNivel"
                  label="Nivel"
                  outlined
                  dense
                />
              </div>
            </div>

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-4">
                <q-input
                  v-model.number="form.cupos"
                  type="number"
                  label="Cupos (máx. 45)"
                  outlined
                  dense
                  lazy-rules
                  :rules="[
                    (v) => (v !== '' && v !== null) || 'Requerido',
                    (v) => (Number(v) >= 1 && Number(v) <= 45) || 'Entre 1 y 45',
                  ]"
                />
              </div>
              <div class="col-12 col-sm-4">
                <q-input
                  v-model="form.fechaInicio"
                  type="date"
                  label="Inicio"
                  :min="fechaMinima"
                  outlined
                  dense
                  lazy-rules
                  :rules="[(v) => !!v || 'Requerido']"
                />
              </div>
              <div class="col-12 col-sm-4">
                <q-input
                  v-model="form.fechaFin"
                  type="date"
                  label="Finalización"
                  outlined
                  dense
                  lazy-rules
                  :rules="[(v) => !!v || 'Requerido']"
                />
              </div>
            </div>

            <!-- Horario -->
            <div class="horario">
              <div class="horario-titulo">
                Horario (lunes a viernes · 7:00 a 22:00)
              </div>
              <div
                v-for="(bloque, i) in form.horario"
                :key="i"
                class="horario-bloque row q-col-gutter-sm items-center"
              >
                <div class="col-4">
                  <q-select
                    v-model="bloque.dia"
                    :options="opcionesDia"
                    option-value="value"
                    option-label="label"
                    emit-value
                    map-options
                    label="Día"
                    outlined
                    dense
                  />
                </div>
                <div class="col-3">
                  <q-input v-model="bloque.horaInicio" type="time" label="Desde" outlined dense />
                </div>
                <div class="col-3">
                  <q-input v-model="bloque.horaFin" type="time" label="Hasta" outlined dense />
                </div>
                <div class="col-2 text-right">
                  <q-btn
                    flat
                    round
                    dense
                    icon="delete"
                    color="negative"
                    :disable="form.horario.length <= 1"
                    @click="quitarBloque(i)"
                  />
                </div>
              </div>
              <q-btn
                flat
                no-caps
                color="primary"
                icon="add"
                label="Agregar bloque"
                @click="agregarBloque"
              />
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat no-caps label="Cancelar" v-close-popup />
          <q-btn
            color="primary"
            unelevated
            no-caps
            :label="modoEdicion ? 'Guardar cambios' : 'Crear curso'"
            :loading="guardando"
            @click="crear"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import api from '../api/axios.js'
import { cursosCoordinador } from '../data/cursosCoordinador.js'
import { cursosCatalogo } from '../data/cursosCatalogo.js'
import { promedioCurso } from '../utils/cursos.js'

const router = useRouter()
const $q = useQuasar()

const cursosBackend = ref([])
const resumen = ref({})
const cargando = ref(true)
const refrescando = ref(false)

// ===== Modal crear curso =====
const modalCrear = ref(false)
const formRef = ref(null)
const guardando = ref(false)
const modoEdicion = ref(false)
const cursoEditando = ref(null)

const opcionesModalidad = [
  { label: 'Virtual', value: 'virtual' },
  { label: 'Presencial', value: 'presencial' },
]

const opcionesNivel = ['Básico', 'Intermedio', 'Alto']

const opcionesDia = [
  { label: 'Lunes', value: 1 },
  { label: 'Martes', value: 2 },
  { label: 'Miércoles', value: 3 },
  { label: 'Jueves', value: 4 },
  { label: 'Viernes', value: 5 },
]

const opcionesDocente = computed(() => {
  const nombres = new Set()
  for (const c of [...cursosCoordinador, ...cursosCatalogo]) {
    if (c.docente) nombres.add(c.docente)
  }
  for (const c of cursosBackend.value) if (c.docente) nombres.add(c.docente)
  return [...nombres].sort()
})

const fechaMinima = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 20)
  return d.toISOString().slice(0, 10)
})

const form = reactive({
  nombre: '',
  modalidad: 'virtual',
  docente: '',
  nivel: 'Básico',
  cupos: 30,
  fechaInicio: '',
  fechaFin: '',
  horario: [{ dia: 1, horaInicio: '08:00', horaFin: '10:00' }],
})

function abrirModal() {
  resetForm()
  modalCrear.value = true
}

// Abrir el modal en modo edición con los datos del curso
function abrirEditar(curso) {
  resetForm()
  modoEdicion.value = true
  cursoEditando.value = curso
  form.nombre = curso.nombre
  form.modalidad = curso.modalidad || 'virtual'
  form.docente = curso.docente || ''
  form.nivel = curso.nivel || 'Básico'
  form.cupos = curso.cupos ?? 30
  form.fechaInicio = curso.fechaInicio ? String(curso.fechaInicio).slice(0, 10) : ''
  form.fechaFin = curso.fechaFin ? String(curso.fechaFin).slice(0, 10) : ''
  form.horario =
    curso.horario && curso.horario.length
      ? curso.horario.map((h) => ({
          dia: h.dia,
          horaInicio: h.horaInicio,
          horaFin: h.horaFin,
        }))
      : [{ dia: 1, horaInicio: '08:00', horaFin: '10:00' }]
  modalCrear.value = true
}

// Activar / desactivar curso (solo los creados en la base)
async function cambiarActivo(curso, activo) {
  try {
    await api.put(`/cursos/${curso._id}/activo`, { activo })
    $q.notify({
      type: 'positive',
      message: activo ? 'Curso activado' : 'Curso desactivado',
      position: 'top',
    })
    await cargar(false)
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: e.response?.data?.mensaje || 'No se pudo actualizar el curso',
      position: 'top',
    })
  }
}

function resetForm() {
  modoEdicion.value = false
  cursoEditando.value = null
  form.nombre = ''
  form.modalidad = 'virtual'
  form.docente = ''
  form.nivel = 'Básico'
  form.cupos = 30
  form.fechaInicio = ''
  form.fechaFin = ''
  form.horario = [{ dia: 1, horaInicio: '08:00', horaFin: '10:00' }]
}

function agregarBloque() {
  form.horario.push({ dia: 1, horaInicio: '08:00', horaFin: '10:00' })
}

function quitarBloque(i) {
  if (form.horario.length > 1) form.horario.splice(i, 1)
}

async function crear() {
  const valido = await formRef.value.validate()
  if (!valido) return

  if (new Date(form.fechaInicio) < new Date(fechaMinima.value)) {
    return $q.notify({
      type: 'warning',
      message: `La fecha de inicio debe ser al menos ${fechaMinima.value}`,
      position: 'top',
    })
  }

  guardando.value = true
  try {
    if (modoEdicion.value && cursoEditando.value) {
      await api.put(`/cursos/${cursoEditando.value._id}`, { ...form })
      $q.notify({ type: 'positive', message: 'Curso actualizado', position: 'top' })
    } else {
      await api.post('/cursos', { ...form })
      $q.notify({ type: 'positive', message: 'Curso creado correctamente', position: 'top' })
    }
    modalCrear.value = false
    resetForm()
    await cargar(false)
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: e.response?.data?.mensaje || 'No se pudo guardar el curso',
      position: 'top',
    })
  } finally {
    guardando.value = false
  }
}

// ===== Listado =====
function porcentajeDesdeFechas(c) {
  if (!c.fechaInicio || !c.fechaFin) return 0
  const ini = new Date(String(c.fechaInicio).slice(0, 10)).getTime()
  const fin = new Date(String(c.fechaFin).slice(0, 10)).getTime()
  const hoy = Date.now()
  if (hoy <= ini) return 0
  if (hoy >= fin) return 100
  return Math.round(((hoy - ini) / (fin - ini)) * 100)
}

const cursos = computed(() => {
  const estaticos = cursosCoordinador.map((c) => {
    const aprobadas = resumen.value[c.nombre]?.aprobadas || 0
    const estudiantes = (c.estudiantesBase || 0) + aprobadas
    return {
      ...c,
      backend: false,
      aprobadas,
      estudiantes,
      promedio: promedioCurso(c.nombre, estudiantes),
    }
  })

  const backend = cursosBackend.value.map((c) => {
    const aprobadas = resumen.value[c.nombre]?.aprobadas || 0
    return {
      id: `b-${c._id}`,
      _id: c._id,
      nombre: c.nombre,
      docente: c.docente || '',
      modalidad: c.modalidad,
      nivel: c.nivel || 'Básico',
      horario: c.horario || [],
      fechaInicio: c.fechaInicio ? String(c.fechaInicio).slice(0, 10) : null,
      fechaFin: c.fechaFin ? String(c.fechaFin).slice(0, 10) : null,
      cupos: c.cupos ?? 45,
      porcentaje: porcentajeDesdeFechas(c),
      estudiantesBase: 0,
      aprobadas,
      estudiantes: aprobadas,
      backend: true,
      activo: c.activo !== false,
      promedio: promedioCurso(c.nombre, aprobadas),
    }
  })

  return [...estaticos, ...backend]
})

function formatoFecha(f) {
  if (!f) return '—'
  return new Date(`${String(f).slice(0, 10)}T00:00:00`).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function abrirCurso(curso) {
  router.push(`/dashboard/coordinador/curso/${curso.id}`)
}

async function cargar(mostrarSpinner = true) {
  if (mostrarSpinner) cargando.value = true
  else refrescando.value = true

  try {
    const [resResumen, resCursos] = await Promise.all([
      api.get('/solicitudes/resumen'),
      api.get('/cursos'),
    ])
    const map = {}
    for (const r of resResumen.data || []) map[r.cursoNombre] = r
    resumen.value = map
    cursosBackend.value = resCursos.data || []
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
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.curso-card--click {
  cursor: pointer;
}

.curso-card--inactivo {
  opacity: 0.6;
}

.curso-card--click:hover {
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

.stat-value span {
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.45);
}

.stat-promedio {
  color: #6fd6ff;
}

.curso-culminacion {
  padding-top: 4px;
}

.curso-nuevo {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #6fd6ff;
}

.curso-acciones {
  display: flex;
  gap: 6px;
  margin-top: 4px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

/* ===== Modal ===== */
.modal-curso {
  width: 100%;
  max-width: 620px;
  border-radius: 14px;
}

.horario {
  padding: 12px 14px;
  border-radius: 10px;
  background: #f5f7fb;
  border: 1px solid #e3e8f0;
}

.horario-titulo {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #5b6474;
  margin-bottom: 10px;
}

.horario-bloque {
  margin-bottom: 8px;
}

@media (min-width: 900px) {
  .cursos-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
