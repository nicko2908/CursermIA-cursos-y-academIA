<template>
  <div>
    <div v-if="cargando" class="text-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-md text-grey-4">Cargando tu información...</div>
    </div>

    <div v-else>
      <h2 class="text-h5 text-weight-bold text-white">Cursos que dictas</h2>
      <div v-if="cursos.length === 0" class="text-grey-4 q-mb-lg">
        Aún no dictas ningún curso.
      </div>
      <div v-else class="row q-gutter-md q-mb-xl">
        <q-card
          v-for="curso in cursos"
          :key="curso._id"
          class="col-12 col-sm-6 col-md-4"
        >
          <q-card-section>
            <div class="text-h6">{{ curso.nombre }}</div>
            <div class="text-caption text-grey-7">Modalidad: {{ curso.modalidad }}</div>
            <div class="text-caption text-grey-7">
              Del {{ formatoFecha(curso.fechaInicio) }} al {{ formatoFecha(curso.fechaFin) }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <h2 class="text-h5 text-weight-bold text-white">Trabajos asignados</h2>
      <div v-if="trabajos.length === 0" class="text-grey-4">
        No has asignado trabajos todavía.
      </div>

      <q-list v-else bordered separator>
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api/axios.js'
import { useAuthStore } from '../stores/auth.js'

const auth = useAuthStore()

const cursos = ref([])
const trabajos = ref([])
const cargando = ref(true)

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
    const [resProfesor, resTrabajos] = await Promise.all([
      api.get(`/profesores/${cedula}`),
      api.get(`/profesores/${cedula}/trabajos`),
    ])
    cursos.value = resProfesor.data.cursos || []
    trabajos.value = resTrabajos.data || []
  } catch (e) {
    console.error(e)
  } finally {
    cargando.value = false
  }
})
</script>
