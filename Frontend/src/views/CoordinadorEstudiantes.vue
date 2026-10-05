<template>
  <div>
    <div class="row items-center justify-between q-mb-md">
      <h2 class="text-h5 text-weight-bold text-white q-my-none">
        Estudiantes
        <q-badge v-if="!cargando" color="primary" rounded class="q-ml-sm">
          {{ estudiantes.length }}
        </q-badge>
      </h2>

      <q-input
        v-model="busqueda"
        dense
        outlined
        dark
        clearable
        placeholder="Buscar por nombre..."
        class="buscador"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <div v-if="cargando" class="text-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-md text-grey-4">Cargando estudiantes...</div>
    </div>

    <div v-else-if="!estudiantes.length" class="vacio">
      <q-icon name="group" size="42px" />
      <p>No hay estudiantes registrados todavía.</p>
    </div>

    <div v-else-if="!filtrados.length" class="vacio">
      <q-icon name="search_off" size="42px" />
      <p>No se encontraron estudiantes con "{{ busqueda }}".</p>
    </div>

    <div v-else class="estudiantes-grid">
      <article
        v-for="est in filtrados"
        :key="est.cedula"
        class="est-card"
        @click="abrir(est)"
      >
        <q-avatar size="52px" color="primary" text-color="white">
          {{ inicial(est.nombre) }}
        </q-avatar>
        <div class="est-nombre">{{ est.nombre }} {{ est.apellido }}</div>
        <div class="est-cedula">C.C. {{ est.cedula }}</div>
        <div class="est-cursos">
          <q-icon name="menu_book" size="15px" />
          {{ est.cursos.length }} {{ est.cursos.length === 1 ? 'curso' : 'cursos' }}
        </div>
      </article>
    </div>

    <!-- Modal grande con la info del estudiante -->
    <q-dialog v-model="modalAbierto">
      <q-card class="est-modal">
        <q-card-section class="est-modal-head">
          <q-avatar size="64px" color="primary" text-color="white">
            {{ inicial(seleccionado?.nombre) }}
          </q-avatar>
          <div class="col q-ml-md">
            <div class="est-modal-nombre">
              {{ seleccionado?.nombre }} {{ seleccionado?.apellido }}
            </div>
            <div class="est-modal-sub">C.C. {{ seleccionado?.cedula }}</div>
          </div>
          <q-btn flat round dense icon="close" color="white" v-close-popup />
        </q-card-section>

        <q-separator color="grey-9" />

        <q-card-section>
          <div class="seccion-titulo">Datos personales</div>
          <div class="datos">
            <div class="dato">
              <span class="dato-label">Nombre completo</span>
              <span class="dato-valor">
                {{ seleccionado?.nombre }} {{ seleccionado?.apellido }}
              </span>
            </div>
            <div class="dato">
              <span class="dato-label">Cédula</span>
              <span class="dato-valor">{{ seleccionado?.cedula }}</span>
            </div>
            <div class="dato">
              <span class="dato-label">Correo</span>
              <span class="dato-valor">{{ seleccionado?.correo || '—' }}</span>
            </div>
            <div class="dato">
              <span class="dato-label">Teléfono</span>
              <span class="dato-valor">{{ seleccionado?.telefono || '—' }}</span>
            </div>
            <div class="dato">
              <span class="dato-label">Fecha de nacimiento</span>
              <span class="dato-valor">
                {{ seleccionado?.fechaNacimiento ? formatoFecha(seleccionado.fechaNacimiento) : '—' }}
              </span>
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <div class="seccion-titulo">Cursos en los que está inscrito</div>
          <div v-if="seleccionado?.cursos.length" class="cursos-inscritos">
            <div
              v-for="c in seleccionado.cursos"
              :key="c"
              class="curso-inscrito"
              :class="{ 'curso-inscrito--link': cursoIdPorNombre(c) !== null }"
              @click="abrirCurso(c)"
            >
              <q-icon name="menu_book" size="18px" />
              <span>{{ c }}</span>
              <q-icon
                v-if="cursoIdPorNombre(c) !== null"
                name="arrow_forward"
                size="18px"
                class="curso-arrow"
              />
            </div>
          </div>
          <p v-else class="sin-cursos">Sin cursos inscritos.</p>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/axios.js'
import { cursosCoordinador } from '../data/cursosCoordinador.js'

const router = useRouter()

// Devuelve el id del curso en la vista del coordinador (o null si no aplica)
function cursoIdPorNombre(nombre) {
  const curso = cursosCoordinador.find((c) => c.nombre === nombre)
  return curso ? curso.id : null
}

function abrirCurso(nombre) {
  const id = cursoIdPorNombre(nombre)
  if (id === null) return
  modalAbierto.value = false
  router.push(`/dashboard/coordinador/curso/${id}`)
}

const aprendices = ref([])
const solicitudes = ref([])
const busqueda = ref('')
const cargando = ref(true)

const modalAbierto = ref(false)
const seleccionado = ref(null)

// Todos los estudiantes con sus cursos aprobados
const estudiantes = computed(() =>
  aprendices.value.map((a) => {
    const aprobados = solicitudes.value
      .filter((s) => s.aprendizCedula === a._id && s.estado === 'aprobada')
      .map((s) => s.cursoNombre)

    const deBD = (a.cursos || []).map((c) => c?.nombre).filter(Boolean)

    return {
      cedula: a._id,
      nombre: a.nombre || '',
      apellido: a.apellido || '',
      correo: a.correo || '',
      telefono: a.telefono || '',
      fechaNacimiento: a.fechaNacimiento || null,
      cursos: [...new Set([...aprobados, ...deBD])],
    }
  })
)

function normaliza(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

const filtrados = computed(() => {
  const q = normaliza(busqueda.value.trim())
  if (!q) return estudiantes.value
  return estudiantes.value.filter((e) => normaliza(`${e.nombre} ${e.apellido}`).includes(q))
})

function inicial(nombre) {
  return nombre ? nombre.charAt(0).toUpperCase() : '?'
}

function formatoFecha(f) {
  if (!f) return ''
  return new Date(f).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function abrir(est) {
  seleccionado.value = est
  modalAbierto.value = true
}

onMounted(async () => {
  try {
    const [resAp, resSol] = await Promise.all([
      api.get('/aprendices'),
      api.get('/solicitudes'),
    ])
    aprendices.value = resAp.data || []
    solicitudes.value = resSol.data || []
  } catch (e) {
    console.error(e)
  } finally {
    cargando.value = false
  }
})
</script>

<style scoped>
.buscador {
  width: 280px;
  max-width: 60vw;
}

.estudiantes-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.est-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 22px 16px;
  border-radius: 16px;
  background: #0d1729;
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.est-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.4);
  border-color: rgba(32, 100, 227, 0.5);
}

.est-nombre {
  margin-top: 8px;
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
}

.est-cedula {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.55);
}

.est-cursos {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(32, 100, 227, 0.15);
  color: #7fb0ff;
  font-size: 0.78rem;
  font-weight: 600;
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

/* ===== Modal del estudiante ===== */
.est-modal {
  width: 100%;
  max-width: 560px;
  border-radius: 16px;
  background: #0d1729;
  color: #ffffff;
}

.est-modal-head {
  display: flex;
  align-items: center;
}

.est-modal-nombre {
  font-size: 1.2rem;
  font-weight: 800;
  color: #ffffff;
}

.est-modal-sub {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
}

.seccion-titulo {
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 12px;
}

.datos {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 20px;
}

.dato {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dato-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.5);
}

.dato-valor {
  font-size: 0.92rem;
  font-weight: 600;
  color: #ffffff;
  word-break: break-word;
}

.cursos-inscritos {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.curso-inscrito {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  font-size: 0.92rem;
  font-weight: 600;
  color: #ffffff;
}

.curso-inscrito .q-icon {
  color: #6fd6ff;
}

.curso-inscrito--link {
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.curso-inscrito--link:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(32, 100, 227, 0.5);
}

.curso-arrow {
  margin-left: auto;
}

.sin-cursos {
  margin: 0;
  color: rgba(255, 255, 255, 0.55);
}

@media (min-width: 700px) {
  .estudiantes-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1200px) {
  .estudiantes-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
