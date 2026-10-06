<template>
  <PublicLayout>
    <!-- ===== HERO ===== -->
    <section class="hero q-pa-xl">
      <div class="row items-center q-col-gutter-xl">
        <!-- Columna izquierda: texto y botones -->
        <div class="col-12 col-md-6">

          <h1 class="hero-title q-mt-lg">
            Transforma tu futuro profesional con la educación técnica y tecnológica de
            <span class="hero-title-brand">CursemIA</span>
          </h1>

          <p class="hero-text q-mt-lg">
            Impulsa tu carrera tecnológica o universitaria con clases dinámicas presenciales y virtuales, tutoría
            individualizada de docentes de industria y un portafolio de proyectos reales
            listos para producción. ¿Que esperas para transformar tu futuro hoy?
          </p>

          <div class="row q-gutter-md q-mt-xl">
            <q-btn
              color="primary"
              label="Explorar cursos y matricularme"
              icon-right="arrow_forward"
              to="/cursos"
              unelevated
              no-caps
              size="lg"
              class="hero-btn"
            />
            <q-btn
              flat
              label="Conoce nuestra metodología"
              icon="play_circle_filled"
              no-caps
              size="lg"
              class="hero-btn hero-btn--ghost"
              @click="irAMetodologia"
            />
          </div>

          <div class="hero-features row items-center q-gutter-lg q-mt-xl">
            <div class="hero-feature">
              <q-icon name="workspace_premium" size="22px" />
              <span>Certificación oficial</span>
            </div>
            <div class="hero-feature">
              <q-icon name="videocam" size="22px" />
              <span>Clases adaptativas</span>
            </div>
            <div class="hero-feature">
              <q-icon name="rocket_launch" size="22px" />
              <span>Bolsa de empleo activa</span>
            </div>
          </div>
        </div>

        <!-- Columna derecha: panel tipo terminal -->
        <div class="col-12 col-md-6">
          <div class="hero-panel">
            <div class="terminal-card">

              <!-- Reemplaza esta imagen por la tuya (src/assets/hero.png) -->
              <div class="terminal-media">
                <q-img :src="imagenPrincipal" :ratio="16 / 9" />
              </div>

              <!-- Opinión de un estudiante -->
              <div class="testimonial">
                <div class="testimonial-photo">
                  <img
                    class="testimonial-foto"
                    :src="fotoSebastian"
                    alt="Sebastián Morales"
                  />
                </div>

                <div class="testimonial-body">
                  <div class="testimonial-header">
                    <div class="testimonial-name">Sebastián Morales</div>
                    <div class="testimonial-course">Matriculado en, Análisis de datos cualitativos y cuantitativos</div>
                  </div>
                  <div class="testimonial-quote">
                    “No voy a mentir, las clases son muy buenas, pero podrían implementar mejores 
                    modalidades de graduación”.
                  </div>
                </div>
              </div>
              <div class="testimonial">
                <div class="testimonial-photo">
                  <img
                    class="testimonial-foto"
                    :src="fotoCristian"
                    alt="Cristian Orlando Dos Santos"
                  />
                </div>
                <div class="testimonial-body">
                  <div class="testimonial-header">
                    <div class="testimonial-name">Cristian Orlando Dos Santos</div>
                    <div class="testimonial-course">Matriculado en, Inglés orientado a sistemas</div>
                  </div>
                  <div class="testimonial-quote">
                    “¿De que sirve el inglés general si no te prepara para enfoques reales?, este curso 
                    resuelve esa duda”.
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== ¿Quiénes somos? ===== -->
    <section id="quienes-somos" class="quienes q-pa-xl">
      <h2 class="quienes-title">¿Quiénes somos?</h2>
      <p class="quienes-text">
        CursemIA nació con una convicción inquebrantable: democratizar el acceso a la
        educación tecnológica de élite para toda la comunidad hispanohablante. Sustituimos
        las clases teóricas obsoletas por simulaciones de trabajo real, arquitectura de
        sistemas y mentoría humana rigurosa.
      </p>

      <div class="pilares-grid q-mt-xl">
        <article v-for="pilar in pilares" :key="pilar.titulo" class="pilar-card">
          <h3 class="pilar-title">{{ pilar.titulo }}</h3>
          <p class="pilar-text">{{ pilar.texto }}</p>

          <div class="pilar-media">
            <img
              v-if="pilar.imagen"
              :src="pilar.imagen"
              :alt="pilar.titulo"
              class="pilar-img"
            />
            <div v-else class="pilar-media-empty">
              <q-icon name="add_photo_alternate" size="34px" />
              <span>Agrega tu imagen</span>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- ===== Cursos destacados ===== -->
    <section class="destacados q-pa-xl">
      <div class="row items-end justify-between">
        <div>
          <div class="destacados-eyebrow">Formación de alto impacto</div>
          <h2 class="destacados-title">Cursos destacados</h2>
        </div>
        <q-btn
          flat
          no-caps
          color="white"
          label="Ver todos los cursos"
          icon-right="arrow_forward"
          to="/cursos"
          class="destacados-link"
        />
      </div>

      <div class="cursos-grid q-mt-xl">
        <article v-for="curso in cursosDestacados" :key="curso.nombre" class="curso-card">
          <div class="curso-media">
            <img
              v-if="curso.imagen"
              :src="curso.imagen"
              :alt="curso.nombre"
              class="curso-img"
            />
            <div v-else class="curso-media-empty">
              <q-icon name="add_photo_alternate" size="34px" />
              <span>Agrega tu imagen</span>
            </div>

            <span
              class="curso-badge"
              :class="
                curso.modalidad === 'virtual'
                  ? 'curso-badge--virtual'
                  : 'curso-badge--presencial'
              "
            >
              <q-icon
                :name="curso.modalidad === 'virtual' ? 'wifi' : 'location_on'"
                size="15px"
              />
              {{ curso.modalidad === 'virtual' ? 'Virtual' : 'Presencial' }}
            </span>
          </div>

          <div class="curso-body">
            <h3 class="curso-title">{{ curso.nombre }}</h3>
            <p class="curso-text">{{ curso.descripcion }}</p>

            <div class="curso-fechas row items-center">
              <div class="curso-fecha">
                <q-icon name="event" size="16px" />
                <span>Inicio: {{ formatoFecha(curso.fechaInicio) }}</span>
              </div>
              <div class="curso-fecha">
                <q-icon name="event_available" size="16px" />
                <span>Fin: {{ formatoFecha(curso.fechaFin) }}</span>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
    <!-- ===== CTA final ===== -->
    <section class="cta q-pa-xl">
      <div class="cta-panel">
        <div class="row items-center q-col-gutter-lg">
          <div class="col-12 col-md-7">
            <h2 class="cta-title">¿Listo para dar el siguiente paso en tu carrera?</h2>
            <p class="cta-text">
              Crea tu perfil de aprendiz hoy mismo e impulsa tus saberes con 
              CursemIA, educación de alta calidad garantizada al 100%.
            </p>
          </div>

          <div class="col-12 col-md-5">
            <div class="cta-actions">
              <q-btn
                color="primary"
                size="lg"
                no-caps
                unelevated
                label="Crear cuenta de aprendiz"
                icon-right="arrow_forward"
                to="/login/alumno"
                class="cta-btn"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </PublicLayout>
</template>

<script setup>
import PublicLayout from '../components/PublicLayout.vue'
import imagenPrincipal from '../assets/hero.png'
import fotoSebastian from '../assets/sebastianFotoCara.jpg'
import fotoCristian from '../assets/cr7FotoCara.jpg'
import { imagenes } from '../data/imagenes.js'

const pilares = [
  {
    titulo: 'Aprende Haciendo',
    texto:
      'Sin exámenes memorísticos. Cada módulo te reta a construir microservicios, diseñar esquemas de datos y desplegar en Kubernetes réplicas de plataformas productivas.',
    imagen: imagenes.fullstack,
  },
  {
    titulo: 'Acompañamiento Docente 1a1',
    texto:
      'Docentes activos en multinacionales tecnológicas revisan tus pull requests línea por línea en sesiones de feedback semanales personalizadas.',
    imagen: imagenes.grupo,
  },
  {
    titulo: 'Certificación con Respaldo',
    texto:
      'Títulos con hash criptográfico y código QR de validación instantánea para plataformas como LinkedIn y reclutadores de talento técnico global.',
    imagen: imagenes.profesor,
  },
]

const cursosDestacados = [
  {
    nombre: 'Análisis de datos cualitativos y cuantitativos',
    descripcion:
      'Aprende a recolectar, limpiar e interpretar datos para tomar decisiones con evidencia. Domina técnicas cualitativas y cuantitativas aplicadas a casos reales.',
    modalidad: 'virtual',
    fechaInicio: '2026-07-06',
    fechaFin: '2026-12-12',
    imagen: imagenes.analisis,
  },
  {
    nombre: 'Fundamentos de desarrollo full stack',
    descripcion:
      'Construye aplicaciones completas: maquetación, APIs, bases de datos y despliegue. Un recorrido práctico por frontend y backend con proyectos reales.',
    modalidad: 'presencial',
    fechaInicio: '2026-06-01',
    fechaFin: '2026-12-10',
    imagen: imagenes.fullstack,
  },
  {
    nombre: 'Kotlin para Android Studio',
    descripcion:
      'Desarrolla apps nativas para Android desde cero con Kotlin y Android Studio: interfaces, arquitectura, consumo de APIs y publicación en Play Store.',
    modalidad: 'presencial',
    fechaInicio: '2026-07-20',
    fechaFin: '2026-12-05',
    imagen: imagenes.mecanica,
  },
]

function formatoFecha(fecha) {
  if (!fecha) return ''
  return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function irAMetodologia() {
  const seccion = document.getElementById('quienes-somos')
  if (seccion) seccion.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
.hero {
  background: var(--color-secundario);
  color: #ffffff;
  overflow: hidden;
}

/* ===== Badge superior ===== */
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 7px 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-principal, #2064e3);
  box-shadow: 0 0 0 4px rgba(32, 100, 227, 0.22);
}

/* ===== Textos ===== */
.hero-title {
  font-size: clamp(2rem, 4vw, 3.25rem);
  line-height: 1.12;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.hero-title-brand {
  color: var(--color-terciario, #4f85f0);
}

.hero-text {
  font-size: 1.05rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.72);
  max-width: 560px;
}

/* ===== Botones ===== */
.hero-btn {
  border-radius: 10px;
  font-weight: 600;
}

.hero-btn--ghost {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #ffffff;
}

.hero-btn--ghost:hover {
  background: rgba(255, 255, 255, 0.12);
}

/* ===== Características ===== */
.hero-features {
  flex-wrap: wrap;
}

.hero-feature {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.9rem;
}

.hero-feature .q-icon {
  color: var(--color-terciario, #4f85f0);
}

/* ===== Panel derecho ===== */
.hero-panel {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 16px;
}

.terminal-card {
  background: #0a1526;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 14px;
}

.terminal-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.terminal-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
}

.terminal-name {
  margin-left: 10px;
  font-family: ui-monospace, "Roboto Mono", monospace;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.terminal-live {
  margin-left: auto;
  font-family: ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  color: #7fd0ff;
  background: rgba(127, 208, 255, 0.12);
  border-radius: 6px;
  padding: 3px 8px;
  white-space: nowrap;
}

.terminal-media {
  border-radius: 12px;
  overflow: hidden;
  background: #06101f;
}

/* ===== Opinión de un estudiante ===== */
.testimonial {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-top: 14px;
  padding: 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

/* Espacio para la foto del estudiante (ocupa la izquierda) */
.testimonial-photo {
  width: 52px;
  height: 52px;
  flex: 0 0 auto;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.55);
}

.testimonial-foto {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Lado derecho: nombre + curso arriba, opinión abajo */
.testimonial-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.testimonial-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;
}

.testimonial-course {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-terciario, #4f85f0);
}

.testimonial-quote {
  font-size: 0.85rem;
  line-height: 1.5;
  font-style: italic;
  color: rgba(255, 255, 255, 0.75);
}

/* ===== Tarjeta del sprint ===== */
.sprint-card {
  display: flex;
  align-items: center;
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.sprint-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  border-radius: 10px;
  background: rgba(32, 100, 227, 0.2);
  color: #7fb0ff;
}

.sprint-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: #ffffff;
}

.sprint-sub {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.6);
}

.sprint-pct {
  font-weight: 700;
  font-size: 0.82rem;
  color: #cfe0ff;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  padding: 4px 8px;
  white-space: nowrap;
}

/* ===== Estadísticas ===== */
.stat-label {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 4px;
}

.stat-value {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 1.35rem;
  font-weight: 800;
  color: #ffffff;
}

.stat-value--blue {
  color: #6f9dff;
}

.stat-value--cyan {
  color: #6fd6ff;
}

.stat-star {
  color: #ffb020;
}

.stat-bar {
  margin-top: 8px;
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.stat-bar-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
}

.stat-bar-fill--blue {
  background: var(--color-principal, #2064e3);
}

.stat-bar-fill--cyan {
  background: #4fc3f7;
}

/* ===== Sección ¿Quiénes somos? ===== */
.quienes {
  background: var(--color-secundario);
  color: #ffffff;
}

.quienes-eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-terciario, #4f85f0);
}

.quienes-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  letter-spacing: -0.5px;
  margin: 12px 0 0;
}

.quienes-text {
  max-width: 720px;
  margin-top: 18px;
  font-size: 1.05rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.72);
}

/* Tarjetas de pilares */
.pilares-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.pilar-card {
  display: flex;
  flex-direction: column;
  padding: 26px;
  border-radius: 16px;
  background: #0d1729;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.pilar-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.pilar-text {
  margin: 14px 0 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
}

/* Imagen al fondo de cada tarjeta */
.pilar-media {
  margin-top: auto;
  padding-top: 24px;
}

.pilar-img {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  border-radius: 10px;
  display: block;
}

.pilar-media-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px dashed rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
}

@media (max-width: 1023px) {
  .pilares-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 599px) {
  .pilares-grid {
    grid-template-columns: 1fr;
  }
}

/* ===== Cursos destacados ===== */
.destacados {
  background: var(--color-secundario);
  color: #ffffff;
}

.destacados-eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-terciario, #4f85f0);
}

.destacados-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  letter-spacing: -0.5px;
  margin: 12px 0 0;
}

.destacados-link {
  font-weight: 600;
}

.cursos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.curso-card {
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  background: #0d1729;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.curso-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
}

.curso-media {
  position: relative;
  background: #06101f;
}

.curso-img {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  display: block;
}

.curso-media-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  aspect-ratio: 16 / 10;
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px dashed rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
}

.curso-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
}

.curso-badge--virtual {
  background: rgba(32, 100, 227, 0.9);
  color: #ffffff;
}

.curso-badge--presencial {
  background: rgba(0, 150, 136, 0.9);
  color: #ffffff;
}

.curso-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  padding: 22px;
}

.curso-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #ffffff;
}

.curso-text {
  margin: 0;
  flex: 1;
  font-size: 0.9rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
}

.curso-fechas {
  gap: 14px;
  flex-wrap: wrap;
}

.curso-fecha {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
}

.curso-fecha .q-icon {
  color: var(--color-terciario, #4f85f0);
}

@media (max-width: 1023px) {
  .cursos-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 599px) {
  .cursos-grid {
    grid-template-columns: 1fr;
  }
}

/* ===== CTA final ===== */
.cta {
  background: var(--color-secundario);
}

.cta-panel {
  padding: 48px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background:
    radial-gradient(circle at 82% 28%, rgba(32, 100, 227, 0.35), transparent 55%),
    linear-gradient(135deg, #0e1729 0%, #0b1c3a 55%, #123a7a 100%);
}

.cta-title {
  margin: 0;
  font-size: clamp(1.75rem, 3.4vw, 2.75rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.5px;
  color: #ffffff;
  max-width: 620px;
}

.cta-text {
  margin: 18px 0 0;
  max-width: 620px;
  font-size: 1.05rem;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.75);
}

.cta-actions {
  display: flex;
  justify-content: flex-end;
}

.cta-btn {
  min-width: 260px;
  border-radius: 10px;
  font-weight: 600;
}

@media (max-width: 1023px) {
  .cta-panel {
    padding: 32px;
  }

  .cta-actions {
    justify-content: center;
    margin-top: 8px;
  }
}

@media (max-width: 599px) {
  .cta-panel {
    padding: 24px;
  }

  .cta-btn {
    width: 100%;
    min-width: 0;
  }
}
</style>
