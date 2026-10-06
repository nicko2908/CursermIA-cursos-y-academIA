<template>
  <CursoDetalle
    :curso="curso"
    :estudiantes-base="curso.estudiantesBase || 0"
    :porcentaje="curso.porcentaje ?? null"
    texto-volver="Volver a mis cursos"
    @volver="volver"
    @ver-solicitudes="irSolicitudes"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api/axios.js'
import { useAuthStore } from '../stores/auth.js'
import { cursosCatalogo } from '../data/cursosCatalogo.js'
import { cursosCoordinador } from '../data/cursosCoordinador.js'
import CursoDetalle from '../components/CursoDetalle.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const cursosBackend = ref([])

const nombreDocente = computed(() =>
  `${auth.usuario?.nombre || ''} ${auth.usuario?.apellido || ''}`.trim()
)

const nombreCurso = computed(() => {
  const p = route.params.nombre
  try {
    return decodeURIComponent(p)
  } catch {
    return p
  }
})

const curso = computed(() => {
  const encontrado =
    cursosCoordinador.find((c) => c.nombre === nombreCurso.value) ||
    cursosCatalogo.find((c) => c.nombre === nombreCurso.value) ||
    cursosBackend.value.find((c) => c.nombre === nombreCurso.value)

  return (
    encontrado || {
      nombre: nombreCurso.value,
      docente: nombreDocente.value,
      modalidad: null,
      fechaInicio: null,
      fechaFin: null,
      cupos: null,
    }
  )
})

function volver() {
  router.push('/dashboard/docente')
}

function irSolicitudes() {
  router.push('/dashboard/docente/solicitudes')
}

onMounted(async () => {
  try {
    const { data } = await api.get('/cursos')
    cursosBackend.value = data || []
  } catch (e) {
    console.error(e)
  }
})
</script>
