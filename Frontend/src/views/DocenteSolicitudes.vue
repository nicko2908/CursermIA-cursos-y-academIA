<template>
  <div>
    <h2 class="text-h5 text-weight-bold text-white q-mb-md">Solicitudes de inscripción</h2>

    <div v-if="cargando" class="text-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-md text-grey-4">Cargando solicitudes...</div>
    </div>

    <div v-else-if="solicitudes.length" class="lista-solicitudes">
      <div v-for="s in solicitudes" :key="s._id" class="solicitud">
        <div class="solicitud-info">
          <div class="solicitud-curso">{{ s.cursoNombre }}</div>
          <div class="solicitud-datos">
            {{ s.aprendizNombre || s.aprendizCedula }} · {{ s.tipoId }} {{ s.numeroId }} ·
            {{ s.correo }}
          </div>

          <!-- Checklist de validación (solo inscripciones) -->
          <div v-if="s.estado === 'pendiente'" class="solicitud-checks">
            <span :class="checkClass(checkEdad(s))">
              <q-icon :name="checkIcon(checkEdad(s))" size="14px" />
              Edad: {{ edadDe(s) ?? '—' }}
              <template v-if="cursoDe(s.cursoNombre).edadMinima">
                (mín {{ cursoDe(s.cursoNombre).edadMinima }})
              </template>
            </span>
            <span :class="checkClass(!!(s.tipoId && s.numeroId))">
              <q-icon :name="checkIcon(!!(s.tipoId && s.numeroId))" size="14px" />
              Documento
            </span>
            <span :class="checkClass(!!s.aceptaDatos)">
              <q-icon :name="checkIcon(!!s.aceptaDatos)" size="14px" />
              Datos autorizados
            </span>
          </div>

          <!-- Motivo de baja -->
          <div v-if="s.estado === 'baja_pendiente' && s.motivoBaja" class="solicitud-motivo">
            <q-icon name="logout" size="14px" />
            Motivo de baja: "{{ s.motivoBaja }}"
          </div>
        </div>

        <div class="solicitud-acciones">
          <q-badge :color="badgeEstado(s.estado)" rounded>{{ etiquetaEstado(s.estado) }}</q-badge>

          <template v-if="s.estado === 'pendiente'">
            <q-btn
              color="positive"
              unelevated
              dense
              no-caps
              icon="check"
              label="Aprobar"
              @click="cambiarEstado(s, 'aprobada')"
            />
            <q-btn
              color="negative"
              outline
              dense
              no-caps
              icon="close"
              label="Rechazar"
              @click="cambiarEstado(s, 'rechazada')"
            />
          </template>

          <template v-if="s.estado === 'baja_pendiente'">
            <q-btn
              color="deep-orange"
              unelevated
              dense
              no-caps
              icon="check"
              label="Aceptar baja"
              @click="cambiarEstado(s, 'baja')"
            />
            <q-btn
              color="negative"
              outline
              dense
              no-caps
              icon="close"
              label="Rechazar baja"
              @click="cambiarEstado(s, 'aprobada')"
            />
          </template>
        </div>
      </div>
    </div>

    <div v-else class="vacio">
      <q-icon name="inbox" size="42px" />
      <p>No tienes solicitudes por ahora.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import api from '../api/axios.js'
import { useAuthStore } from '../stores/auth.js'
import { cursosCatalogo } from '../data/cursosCatalogo.js'
import { edadDesde } from '../utils/cursos.js'

const auth = useAuthStore()
const $q = useQuasar()

const solicitudes = ref([])
const aprendices = ref([])
const cargando = ref(true)

const nombreDocente = computed(() =>
  `${auth.usuario?.nombre || ''} ${auth.usuario?.apellido || ''}`.trim()
)

function badgeEstado(estado) {
  if (estado === 'aprobada') return 'positive'
  if (estado === 'rechazada') return 'negative'
  if (estado === 'baja') return 'grey'
  if (estado === 'baja_pendiente') return 'deep-orange'
  return 'warning'
}

function etiquetaEstado(estado) {
  if (estado === 'baja_pendiente') return 'Baja pendiente'
  if (estado === 'baja') return 'Baja'
  return estado
}

// ===== Checklist de validación =====
function cursoDe(nombre) {
  return cursosCatalogo.find((c) => c.nombre === nombre) || {}
}

function fechaNacDe(s) {
  if (s.fechaNacimiento) return s.fechaNacimiento
  const ap = aprendices.value.find((a) => a._id === s.aprendizCedula)
  return ap?.fechaNacimiento || null
}

function edadDe(s) {
  return edadDesde(fechaNacDe(s))
}

function checkEdad(s) {
  const edad = edadDe(s)
  const min = cursoDe(s.cursoNombre).edadMinima
  if (edad === null || !min) return null
  return edad >= min
}

function checkClass(v) {
  if (v === null) return 'check--na'
  return v ? 'check--ok' : 'check--no'
}

function checkIcon(v) {
  if (v === null) return 'help_outline'
  return v ? 'check_circle' : 'cancel'
}

async function cargar() {
  try {
    const [resSol, resAp] = await Promise.all([
      api.get(`/solicitudes/docente/${encodeURIComponent(nombreDocente.value)}`),
      api.get('/aprendices'),
    ])
    solicitudes.value = resSol.data || []
    aprendices.value = resAp.data || []
  } catch (e) {
    console.error(e)
  } finally {
    cargando.value = false
  }
}

async function cambiarEstado(solicitud, estado) {
  try {
    await api.put(`/solicitudes/${solicitud._id}/estado`, { estado })
    solicitud.estado = estado
    $q.notify({
      type: estado === 'aprobada' ? 'positive' : 'info',
      message: `Solicitud ${estado}: ${solicitud.cursoNombre}`,
      position: 'top',
    })
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: 'No se pudo actualizar la solicitud',
      position: 'top',
    })
  }
}

onMounted(cargar)
</script>

<style scoped>
.lista-solicitudes {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 860px;
}

.solicitud {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  padding: 16px 18px;
  border-radius: 14px;
  background: #0d1729;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.solicitud:hover {
  background: #101c33;
  border-color: rgba(32, 100, 227, 0.5);
}

.solicitud-info {
  flex: 1 1 260px;
  min-width: 0;
}

.solicitud-curso {
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;
}

.solicitud-datos {
  margin-top: 4px;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.6);
}

.solicitud-checks {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
  font-size: 0.78rem;
}

.solicitud-checks span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.solicitud-motivo {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #ffb07a;
}

.check--ok {
  color: #5fe0a0;
}

.check--no {
  color: #ff7b7b;
}

.check--na {
  color: rgba(255, 255, 255, 0.5);
}

.solicitud-acciones {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
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
