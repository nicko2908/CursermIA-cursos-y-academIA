<template>
  <div>
    <h2 class="text-h5 text-weight-bold text-white q-mb-md">Solicitudes de inscripción</h2>

    <div v-if="cargando" class="text-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-md text-grey-4">Cargando solicitudes...</div>
    </div>

    <div v-else-if="solicitudes.length">
      <q-list bordered separator class="lista-solicitudes">
        <q-item v-for="s in solicitudes" :key="s._id">
          <q-item-section>
            <q-item-label class="text-weight-bold">{{ s.cursoNombre }}</q-item-label>
            <q-item-label caption>
              {{ s.aprendizNombre || s.aprendizCedula }} · {{ s.tipoId }} {{ s.numeroId }} ·
              {{ s.correo }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="row items-center q-gutter-sm">
              <q-badge :color="badgeEstado(s.estado)" rounded>{{ s.estado }}</q-badge>
              <q-btn
                v-if="s.estado === 'pendiente'"
                color="positive"
                unelevated
                dense
                no-caps
                icon="check"
                label="Aprobar"
                @click="cambiarEstado(s, 'aprobada')"
              />
              <q-btn
                v-if="s.estado === 'pendiente'"
                color="negative"
                outline
                dense
                no-caps
                icon="close"
                label="Rechazar"
                @click="cambiarEstado(s, 'rechazada')"
              />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
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

const auth = useAuthStore()
const $q = useQuasar()

const solicitudes = ref([])
const cargando = ref(true)

const nombreDocente = computed(() =>
  `${auth.usuario?.nombre || ''} ${auth.usuario?.apellido || ''}`.trim()
)

function badgeEstado(estado) {
  if (estado === 'aprobada') return 'positive'
  if (estado === 'rechazada') return 'negative'
  return 'warning'
}

async function cargar() {
  try {
    const { data } = await api.get(
      `/solicitudes/docente/${encodeURIComponent(nombreDocente.value)}`
    )
    solicitudes.value = data || []
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
  max-width: 860px;
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
