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
        @click="modalAbierto = true"
      />
    </div>

    <div v-if="cargando" class="text-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-md text-grey-4">Cargando trabajos...</div>
    </div>

    <q-list v-else-if="trabajos.length" bordered separator>
      <q-expansion-item
        v-for="trabajo in trabajos"
        :key="trabajo._id"
        expand-icon="expand_more"
      >
        <template #header>
          <q-item-section>
            <q-item-label>{{ trabajo.titulo }}</q-item-label>
            <q-item-label caption>
              Curso: {{ trabajo.curso?.nombre }} — Límite: {{ formatoFecha(trabajo.fechaLimite) }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-badge color="primary" rounded>
              {{ trabajo.cantidadEntregas }} entregas
            </q-badge>
          </q-item-section>
        </template>

        <q-card>
          <q-card-section>
            <div class="text-subtitle2 text-weight-bold q-mb-sm">
              Quiénes han entregado
            </div>
            <div v-if="trabajo.entregas.length === 0" class="text-grey-7">
              Nadie ha entregado aún.
            </div>
            <q-list v-else dense>
              <q-item v-for="entrega in trabajo.entregas" :key="entrega._id">
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white">
                    {{ inicial(entrega.aprendiz) }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    {{ entrega.aprendiz?.nombre }} {{ entrega.aprendiz?.apellido }}
                  </q-item-label>
                  <q-item-label caption>Cédula: {{ entrega.aprendiz?._id }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label caption>
                    {{ formatoFecha(entrega.fechaEntrega) }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </q-list>

    <div v-else class="vacio">
      <q-icon name="assignment" size="42px" />
      <p>No has asignado trabajos todavía.</p>
    </div>

    <!-- Modal para asignar trabajo (pendiente de diseño) -->
    <q-dialog v-model="modalAbierto">
      <q-card class="modal-trabajo">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Asignar trabajo</div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-card-section>
          <p class="q-mb-none">
            Aquí irá el formulario para asignar un trabajo. (Pendiente de diseño)
          </p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Cerrar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api/axios.js'
import { useAuthStore } from '../stores/auth.js'

const auth = useAuthStore()

const trabajos = ref([])
const cargando = ref(true)
const modalAbierto = ref(false)

function inicial(a) {
  if (!a || !a.nombre) return '?'
  return a.nombre.charAt(0).toUpperCase()
}

function formatoFecha(f) {
  if (!f) return ''
  return new Date(f).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(async () => {
  try {
    const cedula = auth.usuario.cedula
    const { data } = await api.get(`/profesores/${cedula}/trabajos`)
    trabajos.value = data || []
  } catch (e) {
    console.error(e)
  } finally {
    cargando.value = false
  }
})
</script>

<style scoped>
.modal-trabajo {
  width: 100%;
  max-width: 440px;
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
