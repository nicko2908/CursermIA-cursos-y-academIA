<template>
  <section class="cursos" :class="padded ? 'q-pa-xl' : ''">
    <h1 class="cursos-title">Nuestros cursos</h1>
    <p class="cursos-subtitle">
      Explora nuestra oferta académica y encuentra el curso que impulse tu carrera.
    </p>

    <div class="cursos-grid q-mt-xl">
      <article v-for="curso in cursos" :key="curso.nombre" class="curso-card">
        <!-- Reemplaza el placeholder por tu imagen (imagen: imgVariable) -->
        <div class="curso-media">
          <img
            v-if="curso.imagen"
            :src="curso.imagen"
            :alt="curso.nombre"
            class="curso-img"
          />
          <div v-else class="curso-media-empty">
            <q-icon name="add_photo_alternate" size="30px" />
          </div>
        </div>

        <div class="curso-body">
          <div class="curso-title">
            <q-icon name="menu_book" size="24px" class="curso-icon" />
            <span>{{ curso.nombre }}</span>
          </div>

          <div class="curso-footer">
            <div class="curso-chips">
              <span
                class="curso-chip"
                :class="curso.modalidad === 'virtual' ? 'chip-virtual' : 'chip-presencial'"
              >
                <q-icon
                  :name="curso.modalidad === 'virtual' ? 'wifi' : 'location_on'"
                  size="18px"
                />
                {{ curso.modalidad === 'virtual' ? 'Virtual' : 'Presencial' }}
              </span>
              <span class="curso-chip">
                <q-icon name="person" size="18px" />
                Profe {{ curso.docente }}
              </span>
              <span class="curso-chip">
                <q-icon name="signal_cellular_alt" size="18px" />
                Nivel {{ curso.nivel }}
              </span>
            </div>

            <q-btn
              class="curso-btn"
              color="primary"
              unelevated
              no-caps
              label="Inscribirse"
              @click="inscribirse(curso)"
            />
          </div>
        </div>
      </article>
    </div>

    <!-- Modal de inscripción -->
    <q-dialog v-model="modalAbierto" @hide="resetForm">
      <q-card class="modal-inscripcion">
        <q-card-section class="row items-start justify-between">
          <div>
            <div class="text-h6">Inscripción al curso</div>
            <div class="text-caption text-grey-6">{{ cursoSeleccionado?.nombre }}</div>
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form ref="formRef" class="q-gutter-md" @submit.prevent="enviarSolicitud">
            <q-input
              v-model="form.nombreCompleto"
              label="Nombre completo"
              outlined
              dense
              lazy-rules
              :rules="[(v) => !!v || 'El nombre es obligatorio']"
            />

            <div>
              <div class="campo-label">Identificación</div>
              <q-option-group
                v-model="form.tipoId"
                :options="opcionesId"
                type="radio"
                inline
                color="primary"
                class="q-mt-xs"
              />
            </div>

            <q-input
              v-model="form.identificacion"
              label="Número de identificación"
              outlined
              dense
              lazy-rules
              :rules="[(v) => !!v || 'La identificación es obligatoria']"
            />

            <q-input
              v-model="form.correo"
              label="Correo electrónico"
              type="email"
              outlined
              dense
              lazy-rules
              :rules="[
                (v) => !!v || 'El correo es obligatorio',
                (v) => /.+@.+\..+/.test(v) || 'El correo no es válido',
              ]"
            />

            <div class="consentimiento">
              <q-checkbox v-model="aceptaDatos" dense color="primary" />
              <span class="consentimiento-texto">
                Autorizo el uso de mis datos e imagen personal con fines educativos.
              </span>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat no-caps label="Cancelar" v-close-popup />
          <q-btn
            color="primary"
            unelevated
            no-caps
            label="Enviar solicitud"
            :disable="!aceptaDatos"
            :loading="enviando"
            @click="enviarSolicitud"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </section>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import api from '../api/axios.js'
import { useAuthStore } from '../stores/auth.js'
import { cursosCatalogo } from '../data/cursosCatalogo.js'

defineProps({
  // En el dashboard ya hay padding del q-page, así que se puede desactivar
  padded: { type: Boolean, default: true },
})

const router = useRouter()
const auth = useAuthStore()
const $q = useQuasar()

const modalAbierto = ref(false)
const cursoSeleccionado = ref(null)
const formRef = ref(null)
const aceptaDatos = ref(false)
const enviando = ref(false)

const opcionesId = [
  { label: 'C.C', value: 'CC' },
  { label: 'T.I', value: 'TI' },
  { label: 'Otro', value: 'Otro' },
]

const form = reactive({
  nombreCompleto: '',
  tipoId: 'CC',
  identificacion: '',
  correo: '',
})

function inscribirse(curso) {
  // Si no hay aprendiz logueado, manda al login
  const esAprendiz = auth.estaLogueado && auth.usuario?.rol === 'alumno'
  if (!esAprendiz) {
    router.push('/login/alumno')
    return
  }

  // Prefill con los datos del aprendiz logueado
  const u = auth.usuario
  form.nombreCompleto = `${u.nombre || ''} ${u.apellido || ''}`.trim()
  form.tipoId = 'CC'
  form.identificacion = u.cedula || ''
  form.correo = u.correo || ''
  aceptaDatos.value = false

  cursoSeleccionado.value = curso
  modalAbierto.value = true
}

function resetForm() {
  form.nombreCompleto = ''
  form.tipoId = 'CC'
  form.identificacion = ''
  form.correo = ''
  aceptaDatos.value = false
}

async function enviarSolicitud() {
  if (!aceptaDatos.value) return
  const valido = await formRef.value.validate()
  if (!valido) return

  const u = auth.usuario
  const payload = {
    aprendizCedula: u.cedula,
    aprendizNombre: `${u.nombre || ''} ${u.apellido || ''}`.trim(),
    cursoNombre: cursoSeleccionado.value.nombre,
    docenteNombre: cursoSeleccionado.value.docente,
    tipoId: form.tipoId,
    numeroId: form.identificacion,
    correo: form.correo,
    aceptaDatos: aceptaDatos.value,
  }

  enviando.value = true
  try {
    await api.post('/solicitudes', payload)
    $q.notify({
      type: 'positive',
      message: `Solicitud enviada para "${cursoSeleccionado.value.nombre}". Queda pendiente de aprobación.`,
      position: 'top',
    })
    modalAbierto.value = false
  } catch (e) {
    const mensaje =
      e.response?.data?.mensaje || 'No se pudo enviar la solicitud. Inténtalo de nuevo.'
    $q.notify({
      type: e.response?.status === 409 ? 'warning' : 'negative',
      message: mensaje,
      position: 'top',
    })
  } finally {
    enviando.value = false
  }
}

const cursos = cursosCatalogo
</script>

<style scoped>
.cursos {
  background: var(--color-secundario);
  color: #ffffff;
  min-height: 60vh;
}

.cursos-title {
  margin: 0;
  text-align: center;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  letter-spacing: -0.5px;
}

.cursos-subtitle {
  max-width: 620px;
  margin: 14px auto 0;
  text-align: center;
  font-size: 1.05rem;
  color: rgba(255, 255, 255, 0.72);
}

/* Grilla de cursos */
.cursos-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

/* Card horizontal */
.curso-card {
  display: flex;
  min-height: 150px;
  border-radius: 16px;
  overflow: hidden;
  background: #0d1729;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.curso-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.4);
  border-color: rgba(32, 100, 227, 0.5);
}

/* Imagen a la izquierda */
.curso-media {
  flex: 0 0 180px;
  width: 180px;
  background: #06101f;
}

.curso-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.curso-media-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.03);
  border-right: 1px dashed rgba(255, 255, 255, 0.15);
}

/* Contenido a la derecha */
.curso-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
  padding: 20px 24px;
}

.curso-title {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.3;
}

.curso-icon {
  flex: 0 0 auto;
  margin-top: 2px;
  color: #6fd6ff;
}

.curso-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
}

.curso-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.curso-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.85rem;
  white-space: nowrap;
}

.curso-chip .q-icon {
  color: rgba(255, 255, 255, 0.55);
}

/* Chip de modalidad con color propio */
.chip-virtual {
  border-color: rgba(79, 195, 247, 0.5);
  color: #7fd6ff;
  font-weight: 600;
}

.chip-presencial {
  border-color: rgba(0, 200, 160, 0.5);
  color: #5fe0c0;
  font-weight: 600;
}

.chip-virtual .q-icon,
.chip-presencial .q-icon {
  color: currentColor;
}

.curso-btn {
  flex: 0 0 auto;
  border-radius: 8px;
  font-weight: 600;
}

/* ===== Modal de inscripción ===== */
.modal-inscripcion {
  width: 100%;
  max-width: 460px;
  border-radius: 14px;
}

.campo-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #616161;
}

.consentimiento {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.consentimiento-texto {
  font-size: 0.82rem;
  line-height: 1.4;
  color: #616161;
}

@media (min-width: 1024px) {
  .cursos-grid {
    grid-template-columns: repeat(2, 1fr);
    max-width: 1200px;
  }
}

@media (max-width: 480px) {
  .curso-media {
    flex: 0 0 120px;
    width: 120px;
  }

  .curso-body {
    padding: 16px;
  }

  .curso-title {
    font-size: 1rem;
  }
}
</style>
