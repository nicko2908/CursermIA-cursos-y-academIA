<template>
  <div v-if="curso">
    <div class="volver row items-center q-mb-md" @click="volver">
      <q-icon name="arrow_back" size="20px" />
      <span>Volver a mis cursos</span>
    </div>

    <!-- Info del curso -->
    <div class="curso-hero">
      <div
        class="hero-banner"
        :style="{
          background: `linear-gradient(135deg, ${colorCurso(curso.nombre)}, #0b1c3a)`,
        }"
      >
        <h1 class="hero-title">{{ curso.nombre }}</h1>
      </div>

      <div class="hero-info">
        <div class="hero-chips">
          <span v-if="curso.docente" class="chip">
            <q-icon name="person" size="16px" />
            Profe {{ curso.docente }}
          </span>
          <span v-if="curso.modalidad" class="chip">
            <q-icon
              :name="curso.modalidad === 'virtual' ? 'wifi' : 'location_on'"
              size="16px"
            />
            {{ curso.modalidad === 'virtual' ? 'Virtual' : 'Presencial' }}
          </span>
          <span class="chip">
            <q-icon name="meeting_room" size="16px" />
            {{ aula }}
          </span>
          <span v-if="curso.nivel" class="chip">
            <q-icon name="signal_cellular_alt" size="16px" />
            Nivel {{ curso.nivel }}
          </span>
        </div>

        <div v-if="curso.fechaInicio" class="hero-fechas">
          <q-icon name="event" size="16px" />
          Del {{ formatoFecha(curso.fechaInicio) }} al {{ formatoFecha(curso.fechaFin) }}
        </div>
      </div>
    </div>

    <!-- Trabajos asignados -->
    <h2 class="text-h5 text-weight-bold text-white q-mt-xl q-mb-md">
      Trabajos asignados
    </h2>
    <div class="trabajos">
      <div v-for="(t, i) in tareas" :key="i" class="trabajo">
        <q-icon name="assignment" size="24px" class="trabajo-icono" />
        <div class="col">
          <div class="trabajo-titulo">{{ t.titulo }}</div>
          <div class="trabajo-sub">Fecha límite: {{ formatoFecha(t.fechaLimite) }}</div>
        </div>
        <q-badge :color="t.entregado ? 'positive' : 'warning'" rounded>
          {{ t.entregado ? 'Entregado' : 'Pendiente' }}
        </q-badge>
      </div>
    </div>
  </div>

  <!-- Curso no encontrado -->
  <div v-else class="vacio">
    <q-icon name="error_outline" size="44px" />
    <p>Curso no encontrado.</p>
    <q-btn color="primary" unelevated no-caps label="Volver" @click="volver" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { cursosCatalogo } from '../data/cursosCatalogo.js'
import { colorCurso, hashTexto } from '../utils/cursos.js'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const nombreCurso = computed(() => {
  const p = route.params.nombre
  try {
    return decodeURIComponent(p)
  } catch {
    return p
  }
})

const curso = computed(
  () =>
    cursosCatalogo.find((c) => c.nombre === nombreCurso.value) || {
      nombre: nombreCurso.value,
    }
)

const aula = computed(() => {
  if (!curso.value?.modalidad) return 'Aula por confirmar'
  return curso.value.modalidad === 'virtual'
    ? 'Aula virtual · Zoom'
    : `Aula ${200 + (hashTexto(curso.value.nombre) % 100)}`
})

// Trabajos asignados (simulados y deterministas por aprendiz)
const TAREAS_BASE = [
  { titulo: 'Taller 1: Conceptos fundamentales', fechaLimite: '2026-09-12' },
  { titulo: 'Taller 2: Práctica guiada', fechaLimite: '2026-09-26' },
  { titulo: 'Proyecto integrador — Entrega 1', fechaLimite: '2026-10-10' },
  { titulo: 'Proyecto integrador — Entrega 2', fechaLimite: '2026-10-24' },
  { titulo: 'Examen final', fechaLimite: '2026-11-07' },
]

const tareas = computed(() =>
  TAREAS_BASE.map((t, i) => ({
    ...t,
    entregado: hashTexto(`${auth.usuario?.cedula}-${nombreCurso.value}-${i}`) % 10 < 8,
  }))
)

function formatoFecha(f) {
  if (!f) return ''
  return new Date(`${f}T00:00:00`).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function volver() {
  router.push('/dashboard/alumno')
}
</script>

<style scoped>
.volver {
  display: inline-flex;
  gap: 6px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.9rem;
  font-weight: 600;
}

.volver:hover {
  color: #ffffff;
}

/* ===== Hero del curso ===== */
.curso-hero {
  border-radius: 16px;
  overflow: hidden;
  background: #0d1729;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.hero-banner {
  padding: 28px 26px;
}

.hero-title {
  margin: 0;
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 800;
  line-height: 1.2;
  color: #ffffff;
}

.hero-info {
  padding: 18px 26px 22px;
}

.hero-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.85rem;
  font-weight: 600;
}

.chip .q-icon {
  color: var(--color-terciario, #4f85f0);
}

.hero-fechas {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 14px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
}

.hero-fechas .q-icon {
  color: var(--color-terciario, #4f85f0);
}

/* ===== Trabajos ===== */
.trabajos {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trabajo {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 12px;
  background: #0d1729;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.trabajo:hover {
  background: #101c33;
  border-color: rgba(32, 100, 227, 0.5);
}

.trabajo-icono {
  color: #6fd6ff;
  flex: 0 0 auto;
}

.trabajo-titulo {
  font-size: 0.95rem;
  font-weight: 600;
  color: #ffffff;
}

.trabajo-sub {
  margin-top: 2px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.55);
}

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
}
</style>
