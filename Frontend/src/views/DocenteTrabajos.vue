<template>
  <div>
    <div class="row items-center justify-between q-mb-md">
      <h2 class="text-h5 text-weight-bold text-white q-my-none">Trabajos asignados</h2>
      <q-btn
        color="primary"
        unelevated
        no-caps
        icon="add"
        label="Asignar trabajo"
        @click="abrirModal"
      />
    </div>

    <div v-if="cargando" class="text-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-md text-grey-4">Cargando trabajos...</div>
    </div>

    <div v-else-if="trabajos.length" class="lista-trabajos">
      <div v-for="trabajo in trabajos" :key="trabajo._id" class="trabajo">
        <!-- Cabecera del trabajo -->
        <div class="trabajo-head">
          <q-icon name="assignment" size="24px" class="trabajo-icono" />
          <div class="col">
            <div class="trabajo-titulo">{{ trabajo.titulo }}</div>
            <div class="trabajo-sub">
              <span v-if="trabajo.competencia">Competencia: {{ trabajo.competencia }} · </span>
              Curso: {{ trabajo.cursoNombre }} · Límite: {{ formatoFecha(trabajo.fechaLimite) }}
            </div>
            <div v-if="trabajo.descripcion" class="trabajo-desc">{{ trabajo.descripcion }}</div>
          </div>
          <div class="trabajo-head-acciones">
            <q-badge color="primary" rounded>
              {{ trabajo.cantidadEntregas || 0 }} entregas
            </q-badge>
            <q-btn
              flat
              dense
              no-caps
              size="sm"
              color="primary"
              icon="edit"
              label="Editar"
              @click="abrirEditar(trabajo)"
            />
            <q-btn
              flat
              dense
              no-caps
              size="sm"
              color="negative"
              icon="delete"
              label="Eliminar"
              @click="eliminarTrabajo(trabajo)"
            />
          </div>
        </div>

        <!-- Entregas -->
        <div v-if="trabajo.entregas && trabajo.entregas.length" class="entregas">
          <div v-for="entrega in trabajo.entregas" :key="entrega._id" class="entrega">
            <q-avatar size="32px" color="primary" text-color="white">
              {{ inicial(entrega.aprendiz) }}
            </q-avatar>
            <div class="col">
              <div class="entrega-nombre">
                {{ entrega.aprendiz?.nombre }} {{ entrega.aprendiz?.apellido }}
              </div>
              <div class="entrega-sub">
                <q-icon name="attach_file" size="13px" />
                {{ entrega.nombreArchivo || 'sin nombre' }} · {{ formatoFecha(entrega.fechaEntrega) }}
              </div>
            </div>
            <div class="entrega-accion">
              <!-- Si ya está calificada y no se está editando: se bloquea -->
              <template v-if="estaCalificada(entrega) && !entrega._editando">
                <q-badge :color="colorNota(entrega.calificacion)" rounded>
                  Nota: {{ entrega.calificacion }}
                </q-badge>
                <q-btn
                  flat
                  dense
                  no-caps
                  size="sm"
                  color="primary"
                  icon="edit"
                  label="Volver a calificar"
                  @click="entrega._editando = true"
                />
              </template>

              <!-- Campo desbloqueado para calificar -->
              <template v-else>
                <q-input
                  v-model.number="entrega._nota"
                  type="number"
                  dense
                  outlined
                  dark
                  :min="0"
                  :max="100"
                  placeholder="Nota"
                  class="nota-input"
                />
                <q-btn
                  color="primary"
                  unelevated
                  dense
                  no-caps
                  label="Subir nota"
                  :loading="entrega._cargando"
                  @click="subirNota(entrega)"
                />
              </template>
            </div>
          </div>
        </div>
        <div v-else class="sin-entregas">Nadie ha entregado aún.</div>
      </div>
    </div>

    <div v-else class="vacio">
      <q-icon name="assignment" size="42px" />
      <p>No has asignado trabajos todavía.</p>
    </div>

    <!-- Modal asignar trabajo -->
    <q-dialog v-model="modalAbierto" @hide="resetForm">
      <q-card class="modal-trabajo">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">{{ modoEdicion ? 'Editar trabajo' : 'Asignar trabajo' }}</div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form ref="formRef" class="q-gutter-md" @submit.prevent="asignar">
            <q-select
              v-model="form.curso"
              :options="cursosDocente"
              label="Curso"
              outlined
              dense
              lazy-rules
              :rules="[(v) => !!v || 'Selecciona el curso']"
            />

            <q-input
              v-model="form.competencia"
              label="Nombre de la competencia"
              outlined
              dense
              lazy-rules
              :rules="[(v) => !!v || 'La competencia es obligatoria']"
            />

            <q-input
              v-model="form.taller"
              label="Nombre del taller"
              outlined
              dense
              lazy-rules
              :rules="[(v) => !!v || 'El nombre del taller es obligatorio']"
            />

            <q-input
              v-model="form.descripcion"
              label="Descripción"
              type="textarea"
              autogrow
              outlined
              dense
            />

            <div>
              <div class="campo-label">Documentos de apoyo</div>
              <q-file
                v-model="form.documentos"
                outlined
                dense
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.png,.jpg"
                label="Adjuntar documentos"
                class="q-mt-xs"
              >
                <template #prepend>
                  <q-icon name="upload_file" />
                </template>
              </q-file>
            </div>

            <q-input
              v-model="form.fechaMaxima"
              label="Fecha máxima de entrega"
              type="date"
              :min="hoy"
              outlined
              dense
              lazy-rules
              :rules="[(v) => !!v || 'La fecha máxima es obligatoria']"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat no-caps label="Cancelar" v-close-popup />
          <q-btn
            color="primary"
            unelevated
            no-caps
            :label="modoEdicion ? 'Guardar cambios' : 'Asignar trabajo'"
            :loading="guardando"
            @click="asignar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import api from '../api/axios.js'
import { useAuthStore } from '../stores/auth.js'
import { cursosCatalogo } from '../data/cursosCatalogo.js'

const auth = useAuthStore()
const $q = useQuasar()

const trabajos = ref([])
const cursosBackend = ref([])
const cargando = ref(true)

// Asignar / editar
const modalAbierto = ref(false)
const formRef = ref(null)
const guardando = ref(false)
const modoEdicion = ref(false)
const trabajoEditando = ref(null)

const hoy = new Date().toISOString().slice(0, 10)

const nombreDocente = computed(() =>
  `${auth.usuario?.nombre || ''} ${auth.usuario?.apellido || ''}`.trim()
)

const cursosDocente = computed(() => {
  const nombres = cursosCatalogo
    .filter((c) => c.docente === nombreDocente.value)
    .map((c) => c.nombre)
  for (const c of cursosBackend.value) {
    if (c.docente === nombreDocente.value) nombres.push(c.nombre)
  }
  return [...new Set(nombres)]
})

const form = reactive({
  curso: '',
  competencia: '',
  taller: '',
  descripcion: '',
  documentos: [],
  fechaMaxima: '',
})

function abrirModal() {
  resetForm()
  modoEdicion.value = false
  trabajoEditando.value = null
  modalAbierto.value = true
}

function abrirEditar(trabajo) {
  resetForm()
  modoEdicion.value = true
  trabajoEditando.value = trabajo
  form.curso = trabajo.cursoNombre || ''
  form.competencia = trabajo.competencia || ''
  form.taller = trabajo.titulo || ''
  form.descripcion = trabajo.descripcion || ''
  form.fechaMaxima = trabajo.fechaLimite ? String(trabajo.fechaLimite).slice(0, 10) : ''
  modalAbierto.value = true
}

function resetForm() {
  form.curso = ''
  form.competencia = ''
  form.taller = ''
  form.descripcion = ''
  form.documentos = []
  form.fechaMaxima = ''
}

async function asignar() {
  const valido = await formRef.value.validate()
  if (!valido) return

  guardando.value = true
  try {
    if (modoEdicion.value && trabajoEditando.value) {
      await api.put(`/trabajos/${trabajoEditando.value._id}`, {
        cursoNombre: form.curso,
        competencia: form.competencia,
        titulo: form.taller,
        descripcion: form.descripcion,
        fechaLimite: form.fechaMaxima,
      })
      $q.notify({ type: 'positive', message: 'Trabajo actualizado', position: 'top' })
    } else {
      await api.post('/trabajos', {
        cursoNombre: form.curso,
        docenteNombre: nombreDocente.value,
        competencia: form.competencia,
        titulo: form.taller,
        descripcion: form.descripcion,
        fechaLimite: form.fechaMaxima,
      })
      $q.notify({ type: 'positive', message: 'Trabajo asignado correctamente', position: 'top' })
    }

    modalAbierto.value = false
    await cargar()
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: e.response?.data?.mensaje || 'No se pudo guardar el trabajo',
      position: 'top',
    })
  } finally {
    guardando.value = false
  }
}

// Eliminar trabajo (con confirmación)
function eliminarTrabajo(trabajo) {
  $q.dialog({
    title: 'Eliminar trabajo',
    message: `¿Seguro que quieres eliminar "${trabajo.titulo}"?`,
    cancel: true,
    persistent: true,
    color: 'negative',
  }).onOk(async () => {
    try {
      await api.delete(`/trabajos/${trabajo._id}`)
      $q.notify({ type: 'positive', message: 'Trabajo eliminado', position: 'top' })
      await cargar()
    } catch (e) {
      $q.notify({
        type: 'negative',
        message: e.response?.data?.mensaje || 'No se pudo eliminar el trabajo',
        position: 'top',
      })
    }
  })
}

// ===== Calificar (campo directo + botón "Subir nota") =====
async function subirNota(entrega) {
  const n = Number(entrega._nota)
  if (entrega._nota === '' || entrega._nota === null || Number.isNaN(n) || n < 0 || n > 100) {
    $q.notify({
      type: 'warning',
      message: 'La nota debe estar entre 0 y 100',
      position: 'top',
    })
    return
  }

  entrega._cargando = true
  try {
    const { data } = await api.put(`/entregas/${entrega._id}/calificacion`, {
      calificacion: n,
    })
    entrega.calificacion = data.calificacion
    entrega._editando = false // se vuelve a bloquear
    $q.notify({ type: 'positive', message: 'Nota subida correctamente', position: 'top' })
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: e.response?.data?.mensaje || 'No se pudo subir la nota',
      position: 'top',
    })
  } finally {
    entrega._cargando = false
  }
}

function estaCalificada(entrega) {
  return entrega.calificacion !== null && entrega.calificacion !== undefined
}

function colorNota(n) {
  if (n >= 80) return 'positive'
  if (n >= 60) return 'warning'
  return 'negative'
}

function inicial(a) {
  if (!a || !a.nombre) return '?'
  return a.nombre.charAt(0).toUpperCase()
}

function formatoFecha(f) {
  if (!f) return ''
  const base = String(f).slice(0, 10)
  return new Date(`${base}T00:00:00`).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

async function cargar() {
  const [resTrabajos, resCursos] = await Promise.all([
    api.get(`/trabajos/docente/${encodeURIComponent(nombreDocente.value)}`),
    api.get('/cursos'),
  ])
  trabajos.value = (resTrabajos.data || []).map((t) => ({
    ...t,
    entregas: (t.entregas || []).map((e) => ({
      ...e,
      _nota: e.calificacion ?? null,
      _cargando: false,
      _editando: false,
    })),
  }))
  cursosBackend.value = resCursos.data || []
}

onMounted(async () => {
  try {
    await cargar()
  } catch (e) {
    console.error(e)
  } finally {
    cargando.value = false
  }
})
</script>

<style scoped>
.lista-trabajos {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 900px;
}

.trabajo {
  padding: 16px 18px;
  border-radius: 12px;
  background: #0d1729;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.trabajo-head {
  display: flex;
  align-items: center;
  gap: 14px;
}

.trabajo-head-acciones {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  flex-wrap: wrap;
  flex: 0 0 auto;
}

.trabajo-icono {
  color: #6fd6ff;
  flex: 0 0 auto;
}

.trabajo-titulo {
  font-size: 0.95rem;
  font-weight: 600;
  color: #ffffff;
}

.trabajo-sub {
  margin-top: 2px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.55);
}

.trabajo-desc {
  margin-top: 6px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
}

.entregas {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.entrega {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
}

.entrega-nombre {
  font-size: 0.88rem;
  font-weight: 600;
  color: #ffffff;
}

.entrega-sub {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  font-size: 0.76rem;
  color: rgba(255, 255, 255, 0.55);
}

.entrega-accion {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.sin-entregas {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.5);
}

.modal-trabajo {
  width: 100%;
  max-width: 560px;
  border-radius: 14px;
}

.nota-input {
  width: 96px;
}

.campo-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #5b6474;
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
</style>
