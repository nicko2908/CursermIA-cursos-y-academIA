<template>
  <div>
    <div class="row items-center justify-between q-mb-md">
      <h2 class="text-h5 text-weight-bold text-white q-my-none">Cronograma</h2>
      <q-btn
        color="primary"
        unelevated
        no-caps
        icon="add"
        label="Añadir evento"
        @click="abrirModal"
      />
    </div>

    <div v-if="cargando" class="text-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-md text-grey-4">Cargando tu cronograma...</div>
    </div>

    <template v-else>
      <CalendarioEventos
        v-if="eventos.length"
        :eventos="eventos"
        :puede-eliminar="true"
        @eliminar="eliminarEvento"
      />
      <div v-else class="vacio">
        <q-icon name="event" size="42px" />
        <p>Aún no has añadido eventos. Crea el primero con "Añadir evento".</p>
      </div>
    </template>

    <!-- Modal añadir evento -->
    <q-dialog v-model="modalAbierto" @hide="resetForm">
      <q-card class="modal-evento">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Añadir evento</div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form ref="formRef" class="q-gutter-md" @submit.prevent="guardar">
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
              v-model="form.titulo"
              label="Título del evento"
              outlined
              dense
              lazy-rules
              :rules="[(v) => !!v || 'El título es obligatorio']"
            />

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-5">
                <q-select
                  v-model="form.tipo"
                  :options="opcionesTipo"
                  option-value="value"
                  option-label="label"
                  emit-value
                  map-options
                  label="Tipo"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-sm-7">
                <q-input
                  v-model="form.fecha"
                  type="date"
                  label="Fecha"
                  outlined
                  dense
                  lazy-rules
                  :rules="[(v) => !!v || 'La fecha es obligatoria']"
                />
              </div>
            </div>

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-input v-model="form.horaInicio" type="time" label="Hora inicio (opcional)" outlined dense />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model="form.horaFin" type="time" label="Hora fin (opcional)" outlined dense />
              </div>
            </div>

            <q-input
              v-model="form.descripcion"
              label="Descripción (opcional)"
              type="textarea"
              autogrow
              outlined
              dense
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat no-caps label="Cancelar" v-close-popup />
          <q-btn
            color="primary"
            unelevated
            no-caps
            label="Guardar evento"
            :loading="guardando"
            @click="guardar"
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
import CalendarioEventos from '../components/CalendarioEventos.vue'

const auth = useAuthStore()
const $q = useQuasar()

const eventosBD = ref([])
const cursosBackend = ref([])
const cargando = ref(true)

const modalAbierto = ref(false)
const formRef = ref(null)
const guardando = ref(false)

const opcionesTipo = [
  { label: 'Clase', value: 'clase' },
  { label: 'Examen', value: 'examen' },
  { label: 'Trabajo', value: 'trabajo' },
  { label: 'Otro', value: 'otro' },
]

const nombreDocente = computed(() =>
  `${auth.usuario?.nombre || ''} ${auth.usuario?.apellido || ''}`.trim()
)

const cursosDocente = computed(() => {
  const nombres = cursosCatalogo
    .filter((c) => c.docente === nombreDocente.value)
    .map((c) => c.nombre)
  for (const c of cursosBackend.value) {
    if (c.docente === nombreDocente.value && c.activo !== false) nombres.push(c.nombre)
  }
  return [...new Set(nombres)]
})

const form = reactive({
  curso: '',
  titulo: '',
  tipo: 'clase',
  fecha: '',
  horaInicio: '',
  horaFin: '',
  descripcion: '',
})

const eventos = computed(() =>
  eventosBD.value.map((e) => ({
    _id: e._id,
    tipo: e.tipo || 'clase',
    titulo: e.titulo,
    curso: e.cursoNombre || '',
    fecha: String(e.fecha).slice(0, 10),
    horaInicio: e.horaInicio,
    horaFin: e.horaFin,
    descripcion: e.descripcion,
  }))
)

// Eliminar evento (con confirmación)
function eliminarEvento(ev) {
  $q.dialog({
    title: 'Eliminar evento',
    message: `¿Seguro que quieres eliminar "${ev.titulo}"?`,
    cancel: true,
    persistent: true,
    color: 'negative',
  }).onOk(async () => {
    try {
      await api.delete(`/eventos/${ev._id}`)
      $q.notify({ type: 'positive', message: 'Evento eliminado', position: 'top' })
      await cargar()
    } catch (e) {
      $q.notify({
        type: 'negative',
        message: e.response?.data?.mensaje || 'No se pudo eliminar el evento',
        position: 'top',
      })
    }
  })
}

function abrirModal() {
  resetForm()
  modalAbierto.value = true
}

function resetForm() {
  form.curso = ''
  form.titulo = ''
  form.tipo = 'clase'
  form.fecha = ''
  form.horaInicio = ''
  form.horaFin = ''
  form.descripcion = ''
}

async function guardar() {
  const valido = await formRef.value.validate()
  if (!valido) return

  guardando.value = true
  try {
    await api.post('/eventos', {
      cursoNombre: form.curso,
      docenteNombre: nombreDocente.value,
      titulo: form.titulo,
      tipo: form.tipo,
      fecha: form.fecha,
      horaInicio: form.horaInicio,
      horaFin: form.horaFin,
      descripcion: form.descripcion,
    })
    $q.notify({ type: 'positive', message: 'Evento añadido correctamente', position: 'top' })
    modalAbierto.value = false
    await cargar()
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: e.response?.data?.mensaje || 'No se pudo añadir el evento',
      position: 'top',
    })
  } finally {
    guardando.value = false
  }
}

async function cargar() {
  const [resEv, resCursos] = await Promise.all([
    api.get(`/eventos/docente/${encodeURIComponent(nombreDocente.value)}`),
    api.get('/cursos'),
  ])
  eventosBD.value = resEv.data || []
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
.modal-evento {
  width: 100%;
  max-width: 560px;
  border-radius: 14px;
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
