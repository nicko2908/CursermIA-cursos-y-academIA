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
        <div class="row q-gutter-md">
          <q-card
            v-for="curso in cursosInscritos"
            :key="curso.nombre"
            class="col-12 col-sm-6 col-md-4"
          >
            <q-card-section>
              <div class="text-h6">{{ curso.nombre }}</div>
              <div v-if="curso.modalidad" class="text-caption text-grey-7">
                Modalidad: {{ curso.modalidad }}
              </div>
              <div v-if="curso.docente" class="text-caption text-grey-7">
                Profe {{ curso.docente }}
              </div>
              <div v-if="curso.nivel" class="text-caption text-grey-7">
                Nivel {{ curso.nivel }}
              </div>
              <div v-if="curso.fechaInicio" class="text-caption text-grey-7">
                Del {{ formatoFecha(curso.fechaInicio) }} al {{ formatoFecha(curso.fechaFin) }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Solicitudes pendientes de aprobación -->
      <div v-if="solicitudesPendientes.length" class="q-mb-xl">
        <h2 class="text-h5 text-weight-bold text-white q-mb-md">
          Solicitudes pendientes
        </h2>
        <q-list bordered separator class="lista-pendientes">
          <q-item v-for="s in solicitudesPendientes" :key="s._id">
            <q-item-section>
              <q-item-label>{{ s.cursoNombre }}</q-item-label>
              <q-item-label caption>Profe {{ s.docenteNombre }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge color="warning" rounded>Pendiente</q-badge>
            </q-item-section>
          </q-item>
        </q-list>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api/axios.js'
import { useAuthStore } from '../stores/auth.js'
import { cursosCatalogo } from '../data/cursosCatalogo.js'

const auth = useAuthStore()

const cursosDB = ref([])
const solicitudes = ref([])
const cargando = ref(true)

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
    if (s.estado !== 'aprobada' || vistos.has(s.cursoNombre)) continue
    const cat = cursosCatalogo.find((c) => c.nombre === s.cursoNombre)
    vistos.add(s.cursoNombre)
    lista.push({
      nombre: s.cursoNombre,
      modalidad: cat?.modalidad || null,
      docente: cat?.docente || s.docenteNombre,
      nivel: cat?.nivel || null,
      fechaInicio: null,
      fechaFin: null,
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

onMounted(async () => {
  try {
    const [resDash, resSol] = await Promise.all([
      api.get(`/aprendices/${auth.usuario.cedula}/dashboard`),
      api.get(`/solicitudes/aprendiz/${auth.usuario.cedula}`),
    ])
    cursosDB.value = resDash.data.cursos || []
    solicitudes.value = resSol.data || []
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

.lista-pendientes {
  max-width: 720px;
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
</style>
