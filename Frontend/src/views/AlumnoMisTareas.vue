<template>
  <div>
    <h2 class="text-h5 text-weight-bold text-white q-mb-md">Mis tareas</h2>

    <div v-if="cargando" class="text-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-md text-grey-4">Cargando tus tareas...</div>
    </div>

    <div v-else-if="tareas.length" class="lista-tareas">
      <div v-for="tarea in tareas" :key="tarea._id" class="tarea">
        <q-icon
          :name="tarea.entregado ? 'check_circle' : 'hourglass_empty'"
          size="26px"
          :class="tarea.entregado ? 'tarea-icono--ok' : 'tarea-icono--pend'"
        />

        <div class="col tarea-info">
          <div class="tarea-titulo">{{ tarea.titulo }}</div>
          <div class="tarea-sub">
            <span v-if="tarea.competencia">Competencia: {{ tarea.competencia }} · </span>
            Curso: {{ tarea.cursoNombre }} · Límite: {{ formatoFecha(tarea.fechaLimite) }}
          </div>
          <div v-if="tarea.descripcion" class="tarea-desc">{{ tarea.descripcion }}</div>
          <div v-if="tarea.entregado" class="tarea-entrega">
            <q-icon name="attach_file" size="14px" />
            Entregado: {{ tarea.entrega?.nombreArchivo || 'sin nombre' }}
            <template v-if="tarea.entrega?.calificacion !== null && tarea.entrega?.calificacion !== undefined">
              <span class="tarea-nota">
                <q-icon name="grade" size="14px" />
                Nota: {{ tarea.entrega.calificacion }}
              </span>
            </template>
          </div>
        </div>

        <div class="tarea-acciones">
          <q-badge :color="tarea.entregado ? 'positive' : 'warning'" rounded>
            {{ tarea.entregado ? 'Entregado' : 'Pendiente' }}
          </q-badge>
          <q-btn
            v-if="!tarea.entregado"
            color="primary"
            unelevated
            dense
            no-caps
            icon="upload"
            label="Entregar"
            @click="abrirEntrega(tarea)"
          />
        </div>
      </div>
    </div>

    <div v-else class="vacio">
      <q-icon name="assignment" size="42px" />
      <p>No tienes tareas asignadas por ahora.</p>
    </div>

    <!-- Modal para entregar -->
    <q-dialog v-model="modalAbierto" @hide="resetForm">
      <q-card class="modal-entrega">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Entregar tarea</div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section v-if="tareaSeleccionada">
          <div class="modal-tarea-titulo">{{ tareaSeleccionada.titulo }}</div>
          <div class="modal-tarea-sub">Curso: {{ tareaSeleccionada.cursoNombre }}</div>

          <q-form ref="formRef" class="q-gutter-md q-mt-md" @submit.prevent="entregar">
            <q-input
              v-model="form.nombreArchivo"
              label="Nombre del archivo"
              outlined
              dense
              lazy-rules
              :rules="[(v) => !!v || 'Ponle un nombre a tu entrega']"
            />

            <div>
              <div class="campo-label">Archivos</div>
              <q-file
                v-model="form.archivos"
                outlined
                dense
                multiple
                accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg,.xls,.xlsx,.ppt,.pptx"
                label="Adjuntar archivos"
                class="q-mt-xs"
              >
                <template #prepend>
                  <q-icon name="upload_file" />
                </template>
              </q-file>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat no-caps label="Cancelar" v-close-popup />
          <q-btn
            color="primary"
            unelevated
            no-caps
            label="Entregar"
            :loading="enviando"
            @click="entregar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import api from '../api/axios.js'
import { useAuthStore } from '../stores/auth.js'

const auth = useAuthStore()
const $q = useQuasar()

const tareas = ref([])
const cargando = ref(true)

const modalAbierto = ref(false)
const tareaSeleccionada = ref(null)
const formRef = ref(null)
const enviando = ref(false)

const form = reactive({
  nombreArchivo: '',
  archivos: [],
})

function abrirEntrega(tarea) {
  resetForm()
  tareaSeleccionada.value = tarea
  form.nombreArchivo = tarea.titulo
  modalAbierto.value = true
}

function resetForm() {
  form.nombreArchivo = ''
  form.archivos = []
}

async function entregar() {
  const valido = await formRef.value.validate()
  if (!valido) return

  enviando.value = true
  try {
    await api.post('/entregas', {
      trabajo: tareaSeleccionada.value._id,
      aprendiz: auth.usuario.cedula,
      nombreArchivo: form.nombreArchivo,
      archivos: form.archivos.map((f) => f.name),
    })

    $q.notify({ type: 'positive', message: 'Tarea entregada correctamente', position: 'top' })
    modalAbierto.value = false
    await cargar()
  } catch (e) {
    $q.notify({
      type: e.response?.status === 409 ? 'warning' : 'negative',
      message: e.response?.data?.mensaje || 'No se pudo entregar la tarea',
      position: 'top',
    })
  } finally {
    enviando.value = false
  }
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
  const { data } = await api.get(`/aprendices/${auth.usuario.cedula}/tareas`)
  tareas.value = data || []
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
.lista-tareas {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 900px;
}

.tarea {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 12px;
  background: #0d1729;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.tarea:hover {
  background: #101c33;
  border-color: rgba(32, 100, 227, 0.5);
}

.tarea-icono--ok {
  color: #5fe0a0;
  flex: 0 0 auto;
}

.tarea-icono--pend {
  color: #ffd166;
  flex: 0 0 auto;
}

.tarea-info {
  min-width: 0;
}

.tarea-titulo {
  font-size: 0.95rem;
  font-weight: 600;
  color: #ffffff;
}

.tarea-sub {
  margin-top: 2px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.55);
}

.tarea-desc {
  margin-top: 6px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
}

.tarea-entrega {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 8px;
  font-size: 0.8rem;
  color: #6fd6ff;
  font-weight: 600;
}

.tarea-nota {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
  color: #ffd166;
}

.tarea-acciones {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.modal-entrega {
  width: 100%;
  max-width: 520px;
  border-radius: 14px;
}

.modal-tarea-titulo {
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
}

.modal-tarea-sub {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.6);
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
