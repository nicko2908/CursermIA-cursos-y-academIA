<template>
  <div class="row q-col-gutter-lg">
    <!-- Calendario -->
    <div class="col-12 col-lg-7">
      <div class="crono-card">
        <div class="crono-header">
          <q-btn flat round dense icon="chevron_left" color="white" @click="mesAnterior" />
          <div class="crono-mes">{{ tituloMes }}</div>
          <q-btn flat round dense icon="chevron_right" color="white" @click="mesSiguiente" />
        </div>

        <div class="crono-semana">
          <span v-for="d in diasSemana" :key="d">{{ d }}</span>
        </div>

        <div class="crono-grid">
          <button
            v-for="d in diasCalendario"
            :key="d.key"
            type="button"
            class="crono-dia"
            :class="{
              'crono-dia--fuera': !d.esDelMes,
              'crono-dia--hoy': d.key === hoyKey,
              'crono-dia--sel': d.key === fechaSeleccionada,
            }"
            @click="seleccionarDia(d)"
          >
            <span class="crono-num">{{ d.dia }}</span>
            <span class="crono-puntos">
              <span
                v-for="(ev, i) in (eventosPorDia[d.key] || []).slice(0, 3)"
                :key="i"
                class="crono-punto"
                :style="{ background: tipoDe(ev).color }"
              ></span>
            </span>
          </button>
        </div>

        <div class="crono-leyenda">
          <span v-for="(info, tipo) in tipoInfo" :key="tipo" class="leyenda-item">
            <span class="crono-punto" :style="{ background: info.color }"></span>
            {{ info.label }}
          </span>
        </div>
      </div>
    </div>

    <!-- Panel de eventos -->
    <div class="col-12 col-lg-5">
      <div class="crono-card q-mb-lg">
        <div class="panel-titulo">
          <q-icon name="event" size="20px" />
          <span>Eventos del {{ formatoFecha(fechaSeleccionada) }}</span>
        </div>

        <div v-if="eventosSeleccionados.length" class="eventos-lista">
          <div v-for="(ev, i) in eventosSeleccionados" :key="i" class="evento">
            <span class="evento-dot" :style="{ background: tipoDe(ev).color }"></span>
            <div class="col">
              <div class="evento-titulo">{{ ev.titulo }}</div>
              <div class="evento-sub">
                <span class="evento-tipo" :style="{ color: tipoDe(ev).color }">
                  {{ tipoDe(ev).label }}
                </span>
                <span v-if="ev.horaInicio"> · {{ ev.horaInicio }}<template v-if="ev.horaFin">–{{ ev.horaFin }}</template></span>
                <span v-if="ev.curso"> · {{ ev.curso }}</span>
              </div>
              <div v-if="ev.descripcion" class="evento-desc">{{ ev.descripcion }}</div>
            </div>
            <q-btn
              v-if="puedeEliminar && ev._id"
              flat
              round
              dense
              size="sm"
              icon="delete"
              color="negative"
              @click.stop="emit('eliminar', ev)"
            />
          </div>
        </div>
        <p v-else class="panel-vacio">No hay eventos este día.</p>
      </div>

      <div class="crono-card">
        <div class="panel-titulo">
          <q-icon name="schedule" size="20px" />
          <span>Próximos eventos</span>
        </div>

        <div v-if="proximosEventos.length" class="eventos-lista">
          <div
            v-for="(ev, i) in proximosEventos"
            :key="i"
            class="evento"
            @click="irAFecha(ev.fecha)"
          >
            <span class="evento-dot" :style="{ background: tipoDe(ev).color }"></span>
            <div class="col">
              <div class="evento-titulo">{{ ev.titulo }}</div>
              <div class="evento-sub">
                <span class="evento-tipo" :style="{ color: tipoDe(ev).color }">
                  {{ tipoDe(ev).label }}
                </span>
                <span> · {{ formatoFechaCorta(ev.fecha) }}</span>
                <span v-if="ev.curso"> · {{ ev.curso }}</span>
              </div>
            </div>
            <q-btn
              v-if="puedeEliminar && ev._id"
              flat
              round
              dense
              size="sm"
              icon="delete"
              color="negative"
              @click.stop="emit('eliminar', ev)"
            />
          </div>
        </div>
        <p v-else class="panel-vacio">No hay eventos próximos.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  // [{ _id, fecha: 'YYYY-MM-DD', titulo, tipo, curso, horaInicio, horaFin, descripcion }]
  eventos: { type: Array, default: () => [] },
  // Muestra un botón para eliminar cada evento (solo el docente)
  puedeEliminar: { type: Boolean, default: false },
})

const emit = defineEmits(['eliminar'])

const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const tipoInfo = {
  clase: { label: 'Clase', color: '#4fc3f7' },
  trabajo: { label: 'Trabajo', color: '#ffb020' },
  examen: { label: 'Examen', color: '#ff6b6b' },
  otro: { label: 'Otro', color: '#9c88ff' },
}

const hoyKey = toKey(new Date())
const fechaSeleccionada = ref(hoyKey)
const cursor = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1))

function toKey(fecha) {
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const eventosPorDia = computed(() => {
  const map = {}
  for (const ev of props.eventos) {
    if (!map[ev.fecha]) map[ev.fecha] = []
    map[ev.fecha].push(ev)
  }
  return map
})

const diasCalendario = computed(() => {
  const year = cursor.value.getFullYear()
  const month = cursor.value.getMonth()
  const primerDia = new Date(year, month, 1)
  const offset = (primerDia.getDay() + 6) % 7 // lunes = 0
  const inicio = new Date(year, month, 1 - offset)

  const dias = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i)
    dias.push({
      fecha: d,
      key: toKey(d),
      dia: d.getDate(),
      esDelMes: d.getMonth() === month && d.getFullYear() === year,
    })
  }
  return dias
})

const tituloMes = computed(() => {
  const s = cursor.value.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
  return s.charAt(0).toUpperCase() + s.slice(1)
})

const eventosSeleccionados = computed(() => eventosPorDia.value[fechaSeleccionada.value] || [])

const proximosEventos = computed(() =>
  [...props.eventos]
    .filter((ev) => ev.fecha >= hoyKey)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(0, 6)
)

function tipoDe(ev) {
  return tipoInfo[ev.tipo] || tipoInfo.otro
}

function formatoFecha(key) {
  if (!key) return ''
  const s = new Date(`${key}T00:00:00`).toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatoFechaCorta(key) {
  if (!key) return ''
  return new Date(`${key}T00:00:00`).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
  })
}

function seleccionarDia(d) {
  fechaSeleccionada.value = d.key
  if (!d.esDelMes) {
    cursor.value = new Date(d.fecha.getFullYear(), d.fecha.getMonth(), 1)
  }
}

function irAFecha(key) {
  const [y, m] = key.split('-').map(Number)
  cursor.value = new Date(y, m - 1, 1)
  fechaSeleccionada.value = key
}

function mesAnterior() {
  cursor.value = new Date(cursor.value.getFullYear(), cursor.value.getMonth() - 1, 1)
}

function mesSiguiente() {
  cursor.value = new Date(cursor.value.getFullYear(), cursor.value.getMonth() + 1, 1)
}
</script>

<style scoped>
.crono-card {
  background: #0d1729;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 20px;
}

.crono-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.crono-mes {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
}

.crono-semana {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 8px;
}

.crono-semana span {
  text-align: center;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
}

.crono-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.crono-dia {
  position: relative;
  aspect-ratio: 1 / 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 4px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  color: #ffffff;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.crono-dia:hover {
  background: rgba(255, 255, 255, 0.08);
}

.crono-dia--fuera {
  color: rgba(255, 255, 255, 0.25);
  background: transparent;
}

.crono-dia--hoy {
  border-color: rgba(111, 214, 255, 0.6);
}

.crono-dia--sel {
  background: var(--color-principal, #2064e3);
  border-color: transparent;
}

.crono-num {
  font-size: 0.9rem;
  font-weight: 600;
}

.crono-puntos {
  display: flex;
  gap: 3px;
  height: 6px;
}

.crono-punto {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.crono-leyenda {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 16px;
}

.leyenda-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.65);
}

.panel-titulo {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  font-weight: 700;
  color: #ffffff;
}

.panel-titulo .q-icon {
  color: #6fd6ff;
}

.eventos-lista {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.evento {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.evento:hover {
  background: rgba(255, 255, 255, 0.07);
}

.evento-dot {
  width: 10px;
  height: 10px;
  flex: 0 0 auto;
  margin-top: 5px;
  border-radius: 50%;
}

.evento-titulo {
  font-size: 0.92rem;
  font-weight: 600;
  color: #ffffff;
}

.evento-sub {
  margin-top: 2px;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.6);
}

.evento-desc {
  margin-top: 4px;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.55);
}

.evento-tipo {
  font-weight: 600;
}

.panel-vacio {
  margin: 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
}
</style>
