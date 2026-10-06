<template>
  <div>
    <h2 class="text-h5 text-weight-bold text-white q-mb-md">Mis calificaciones</h2>

    <div v-if="cargando" class="text-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-md text-grey-4">Cargando tus calificaciones...</div>
    </div>

    <template v-else-if="tareas.length">
      <!-- Promedio general (arriba, ancho completo) -->
      <div class="promedio-card">
        <div>
          <div class="promedio-label">Tu promedio general</div>
          <div class="promedio-valor" :class="promedio !== null ? colorNota(promedio) : 'cal--vacio'">
            {{ promedio !== null ? promedio : '—' }}<span v-if="promedio !== null">/100</span>
          </div>
        </div>
        <q-icon name="insights" size="34px" class="promedio-icono" />
      </div>
      <q-linear-progress
        :value="(promedio || 0) / 100"
        rounded
        color="primary"
        track-color="grey-9"
        class="q-mb-lg"
      />

      <div class="calificaciones-layout">
        <!-- Izquierda: calificaciones -->
        <div>
          <h3 class="seccion-titulo">Calificaciones</h3>
          <div class="lista-calificaciones">
            <div v-for="t in tareas" :key="t._id" class="calificacion">
              <q-icon name="assignment" size="22px" class="cal-icono" />
              <div class="col cal-info">
                <div class="cal-titulo">{{ t.titulo }}</div>
                <div class="cal-sub">
                  <span v-if="t.competencia">{{ t.competencia }} · </span>{{ t.cursoNombre }}
                </div>
              </div>
              <div
                class="cal-nota"
                :class="
                  t.entrega?.calificacion != null
                    ? colorNota(t.entrega.calificacion)
                    : 'cal--vacio'
                "
              >
                {{ t.entrega?.calificacion != null ? t.entrega.calificacion : '—' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Derecha: promedio por curso -->
        <div>
          <h3 class="seccion-titulo">Promedio por curso</h3>
          <div class="promedios-curso">
            <div v-for="c in promediosPorCurso" :key="c.curso" class="curso-promedio">
              <div class="cp-head">
                <div class="cp-nombre">{{ c.curso }}</div>
                <div class="cp-nota" :class="c.promedio !== null ? colorNota(c.promedio) : 'cal--vacio'">
                  {{ c.promedio !== null ? c.promedio : '—' }}
                </div>
              </div>
              <q-linear-progress
                :value="(c.promedio || 0) / 100"
                rounded
                color="primary"
                track-color="grey-9"
                class="q-mt-sm"
              />
              <div class="cp-sub">{{ c.calificadas }}/{{ c.total }} calificadas</div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="vacio">
      <q-icon name="grade" size="42px" />
      <p>Aún no tienes calificaciones registradas.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api/axios.js'
import { useAuthStore } from '../stores/auth.js'

const auth = useAuthStore()

const tareas = ref([])
const cargando = ref(true)

const calificadas = computed(() =>
  tareas.value.filter((t) => t.entrega?.calificacion != null)
)

const promedio = computed(() => {
  if (!calificadas.value.length) return null
  const suma = calificadas.value.reduce((acc, t) => acc + t.entrega.calificacion, 0)
  return Math.round(suma / calificadas.value.length)
})

// Promedio individual por curso
const promediosPorCurso = computed(() => {
  const map = {}
  for (const t of tareas.value) {
    const curso = t.cursoNombre || 'Sin curso'
    if (!map[curso]) map[curso] = { curso, suma: 0, calificadas: 0, total: 0 }
    map[curso].total++
    if (t.entrega?.calificacion != null) {
      map[curso].suma += t.entrega.calificacion
      map[curso].calificadas++
    }
  }
  return Object.values(map).map((c) => ({
    curso: c.curso,
    total: c.total,
    calificadas: c.calificadas,
    promedio: c.calificadas ? Math.round(c.suma / c.calificadas) : null,
  }))
})

function colorNota(n) {
  if (n >= 80) return 'cal--alto'
  if (n >= 60) return 'cal--medio'
  return 'cal--bajo'
}

onMounted(async () => {
  try {
    const { data } = await api.get(`/aprendices/${auth.usuario.cedula}/tareas`)
    tareas.value = data || []
  } catch (e) {
    console.error(e)
  } finally {
    cargando.value = false
  }
})
</script>

<style scoped>
.promedio-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border-radius: 12px;
  background: rgba(32, 100, 227, 0.12);
  border: 1px solid rgba(32, 100, 227, 0.3);
  margin-bottom: 12px;
}

.promedio-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.promedio-valor {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
}

.promedio-valor span {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
}

.promedio-icono {
  color: #6fd6ff;
}

/* Dos columnas: izquierda calificaciones, derecha promedio por curso */
.calificaciones-layout {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 24px;
  align-items: start;
}

.seccion-titulo {
  margin: 0 0 12px;
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
}

.lista-calificaciones,
.promedios-curso {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.calificacion {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 12px;
  background: #0d1729;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.cal-icono {
  color: #6fd6ff;
  flex: 0 0 auto;
}

.cal-info {
  min-width: 0;
}

.cal-titulo {
  font-size: 0.92rem;
  font-weight: 600;
  color: #ffffff;
}

.cal-sub {
  margin-top: 2px;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.55);
}

.cal-nota {
  flex: 0 0 auto;
  font-size: 1.2rem;
  font-weight: 800;
}

.curso-promedio {
  padding: 16px;
  border-radius: 12px;
  background: #0d1729;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.cp-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.cp-nombre {
  font-size: 0.9rem;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.3;
}

.cp-nota {
  flex: 0 0 auto;
  font-size: 1.3rem;
  font-weight: 800;
}

.cp-sub {
  margin-top: 8px;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.55);
}

.cal--alto {
  color: #5fe0a0;
}

.cal--medio {
  color: #ffd166;
}

.cal--bajo {
  color: #ff7b7b;
}

.cal--vacio {
  color: rgba(255, 255, 255, 0.35);
}

.vacio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 56px 16px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}

.vacio .q-icon {
  color: rgba(255, 255, 255, 0.45);
}

.vacio p {
  margin: 0;
}

@media (max-width: 900px) {
  .calificaciones-layout {
    grid-template-columns: 1fr;
  }
}
</style>
