<template>
  <div>
    <!-- Saludo de bienvenida -->
    <div class="saludo q-mb-xl">
      <h1 class="saludo-titulo">Bienvenido de nuevo {{ nombreUsuario }}</h1>
      <p class="saludo-sub">
        Nos alegra verte otra vez. Aquí tienes tu panel de aprendizaje.
      </p>
    </div>

    <div v-if="cargando" class="text-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-md text-grey-4">Cargando tu información...</div>
    </div>

    <template v-else>
      <!-- Cursos aprobados / inscritos -->
      <div v-if="cursosInscritos.length" class="q-mb-xl">
        <h2 class="text-h5 text-weight-bold text-white q-mb-md">
          Cursos a los que pertenezco
        </h2>
        <div class="cursos-grid">
          <article
            v-for="curso in cursosInscritos"
            :key="curso.nombre"
            class="curso-card"
            @click="abrirCurso(curso)"
          >
            <div class="curso-top" :style="{ background: colorCurso(curso.nombre) }"></div>
            <div class="curso-body">
              <div class="curso-nombre">{{ curso.nombre }}</div>

              <div class="curso-meta">
                <span v-if="curso.docente">
                  <q-icon name="person" size="16px" />
                  Profe {{ curso.docente }}
                </span>
                <span v-if="curso.modalidad">
                  <q-icon
                    :name="curso.modalidad === 'virtual' ? 'wifi' : 'location_on'"
                    size="16px"
                  />
                  {{ curso.modalidad === 'virtual' ? 'Virtual' : 'Presencial' }}
                </span>
              </div>

              <div v-if="curso.fechaInicio" class="curso-fechas">
                Del {{ formatoFecha(curso.fechaInicio) }} al {{ formatoFecha(curso.fechaFin) }}
              </div>

              <div v-if="curso.bajaPendiente" class="curso-baja-pendiente">
                <q-icon name="hourglass_empty" size="15px" />
                Baja pendiente de aprobación
              </div>

              <div class="curso-footer-row">
                <div class="curso-ver">
                  Ver curso
                  <q-icon name="arrow_forward" size="16px" />
                </div>
                <q-btn
                  v-if="curso.solicitudId && !curso.bajaPendiente"
                  flat
                  dense
                  no-caps
                  color="negative"
                  icon="logout"
                  label="Darme de baja"
                  class="curso-baja-btn"
                  @click.stop="abrirBaja(curso)"
                />
              </div>
            </div>
          </article>
        </div>
      </div>

      <!-- Solicitudes pendientes de aprobación -->
      <div v-if="solicitudesPendientes.length" class="q-mb-xl">
        <h2 class="text-h5 text-weight-bold text-white q-mb-md">
          Solicitudes pendientes
        </h2>
        <div class="lista-pendientes">
          <div
            v-for="s in solicitudesPendientes"
            :key="s._id"
            class="solicitud-pendiente"
          >
            <div class="col">
              <div class="sol-curso">{{ s.cursoNombre }}</div>
              <div class="sol-profe">Profe {{ s.docenteNombre }}</div>
            </div>
            <q-badge color="warning" rounded>Pendiente</q-badge>
          </div>
        </div>
      </div>

      <!-- Aún no está inscrito a ningún curso -->
      <div v-if="!cursosInscritos.length && !solicitudesPendientes.length" class="vacio">
        <q-icon name="school" size="44px" />
        <p>No hay nada por aquí aun...</p>
        <q-btn
          color="primary"
          unelevated
          no-caps
          label="Inscribirse ahora"
          icon-right="arrow_forward"
          to="/dashboard/alumno/cursos"
        />
      </div>
    </template>

    <!-- Modal darse de baja -->
    <q-dialog v-model="modalBaja" @hide="resetBaja">
      <q-card class="modal-baja">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Darme de baja</div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section v-if="cursoBaja">
          <div class="baja-curso">{{ cursoBaja.nombre }}</div>

          <q-form ref="formBajaRef" class="q-gutter-md q-mt-md" @submit.prevent="solicitarBaja">
            <q-input
              v-model="motivo"
              label="Motivo de la baja"
              type="textarea"
              autogrow
              outlined
              dense
              lazy-rules
              :rules="[(v) => !!v || 'Escribe el motivo de tu baja']"
            />

            <div class="baja-autorizacion">
              <q-checkbox v-model="autoriza" dense color="primary" />
              <span>Autorizo que deseo darme de baja de este curso.</span>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat no-caps label="Cancelar" v-close-popup />
          <q-btn
            color="negative"
            unelevated
            no-caps
            label="Solicitar baja"
            :disable="!autoriza"
            :loading="enviandoBaja"
            @click="solicitarBaja"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import api from '../api/axios.js'
import { useAuthStore } from '../stores/auth.js'
import { cursosCatalogo } from '../data/cursosCatalogo.js'
import { colorCurso } from '../utils/cursos.js'

const router = useRouter()
const auth = useAuthStore()
const $q = useQuasar()

const cursosDB = ref([])
const solicitudes = ref([])
const cursosBackend = ref([])
const cargando = ref(true)

// Baja de curso
const modalBaja = ref(false)
const cursoBaja = ref(null)
const motivo = ref('')
const autoriza = ref(false)
const enviandoBaja = ref(false)
const formBajaRef = ref(null)

// Primer nombre del aprendiz para el saludo de bienvenida
const nombreUsuario = computed(() => auth.usuario?.nombre || 'aprendiz')

// Cursos inscritos = cursos reales de la BD + solicitudes aprobadas (cruzadas con el catálogo)
const cursosInscritos = computed(() => {
  const lista = []
  const vistos = new Set()

  for (const c of cursosDB.value) {
    if (vistos.has(c.nombre)) continue
    vistos.add(c.nombre)
    lista.push({
      nombre: c.nombre,
      modalidad: c.modalidad,
      docente: null,
      nivel: null,
      fechaInicio: c.fechaInicio,
      fechaFin: c.fechaFin,
    })
  }

  for (const s of solicitudes.value) {
    if (!['aprobada', 'baja_pendiente'].includes(s.estado) || vistos.has(s.cursoNombre)) continue
    const cat =
      cursosCatalogo.find((c) => c.nombre === s.cursoNombre) ||
      cursosBackend.value.find((c) => c.nombre === s.cursoNombre)
    vistos.add(s.cursoNombre)
    lista.push({
      nombre: s.cursoNombre,
      modalidad: cat?.modalidad || null,
      docente: cat?.docente || s.docenteNombre,
      nivel: cat?.nivel || null,
      fechaInicio: cat?.fechaInicio ? String(cat.fechaInicio).slice(0, 10) : null,
      fechaFin: cat?.fechaFin ? String(cat.fechaFin).slice(0, 10) : null,
      solicitudId: s._id,
      bajaPendiente: s.estado === 'baja_pendiente',
    })
  }

  return lista
})

const solicitudesPendientes = computed(() =>
  solicitudes.value.filter((s) => s.estado === 'pendiente')
)

function formatoFecha(f) {
  if (!f) return ''
  return new Date(f).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function abrirCurso(curso) {
  router.push(`/dashboard/alumno/curso/${encodeURIComponent(curso.nombre)}`)
}

async function cargar() {
  const [resDash, resSol, resCursos] = await Promise.all([
    api.get(`/aprendices/${auth.usuario.cedula}/dashboard`),
    api.get(`/solicitudes/aprendiz/${auth.usuario.cedula}`),
    api.get('/cursos'),
  ])
  cursosDB.value = resDash.data.cursos || []
  solicitudes.value = resSol.data || []
  cursosBackend.value = resCursos.data || []
}

// ===== Darse de baja =====
function abrirBaja(curso) {
  resetBaja()
  cursoBaja.value = curso
  modalBaja.value = true
}

function resetBaja() {
  motivo.value = ''
  autoriza.value = false
}

async function solicitarBaja() {
  const valido = await formBajaRef.value.validate()
  if (!valido || !autoriza.value) return

  enviandoBaja.value = true
  try {
    await api.post(`/solicitudes/${cursoBaja.value.solicitudId}/baja`, {
      motivo: motivo.value,
    })
    $q.notify({
      type: 'positive',
      message: 'Solicitud de baja enviada. Queda pendiente de aprobación del docente.',
      position: 'top',
    })
    modalBaja.value = false
    await cargar()
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: e.response?.data?.mensaje || 'No se pudo solicitar la baja',
      position: 'top',
    })
  } finally {
    enviandoBaja.value = false
  }
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
.saludo-titulo {
  margin: 0;
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  font-weight: 800;
  letter-spacing: -0.4px;
  color: #ffffff;
}

.saludo-sub {
  margin-top: 8px;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
}

/* ===== Cards de cursos (oscuras, clicables) ===== */
.cursos-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.curso-card {
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  background: #0d1729;
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.curso-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.45);
  border-color: rgba(32, 100, 227, 0.5);
}

.curso-top {
  height: 8px;
}

.curso-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  padding: 18px 20px;
}

.curso-nombre {
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.3;
  color: #ffffff;
}

.curso-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.72);
}

.curso-meta span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.curso-meta .q-icon {
  color: var(--color-terciario, #4f85f0);
}

.curso-fechas {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.55);
}

.curso-footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: auto;
  padding-top: 6px;
}

.curso-ver {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #6fd6ff;
  font-size: 0.85rem;
  font-weight: 600;
}

.curso-baja-pendiente {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: auto;
  font-size: 0.8rem;
  font-weight: 600;
  color: #ffd166;
}

.modal-baja {
  width: 100%;
  max-width: 480px;
  border-radius: 14px;
}

.baja-curso {
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
}

.baja-autorizacion {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.85rem;
  color: #616161;
}

.lista-pendientes {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 720px;
}

.solicitud-pendiente {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  background: #0d1729;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.sol-curso {
  font-size: 0.92rem;
  font-weight: 600;
  color: #ffffff;
}

.sol-profe {
  margin-top: 2px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
}

/* Estado vacío: no está inscrito a ningún curso */
.vacio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 56px 16px;
  text-align: center;
  color: rgba(255, 255, 255, 0.65);
}

.vacio .q-icon {
  color: rgba(255, 255, 255, 0.45);
}

.vacio p {
  margin: 0;
  font-size: 1.05rem;
}

@media (min-width: 700px) {
  .cursos-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1200px) {
  .cursos-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
