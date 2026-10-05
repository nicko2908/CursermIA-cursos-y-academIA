<template>
  <q-layout view="hHh lpR fFf">
    <!-- Navbar: logo + título + tabs, todo al mismo nivel (centrado verticalmente) -->
    <q-header elevated class="header-app">
      <div class="navbar">
        <div class="navbar-brand cursor-pointer" @click="irA('/')">
          <img :src="logoCursemia" alt="Logo CursemIA" class="navbar-logo" />
          <span class="navbar-title text-weight-bold">CursemIA</span>
        </div>

        <q-tabs
          align="right"
          active-color="white"
          indicator-color="white"
          class="navbar-tabs text-white"
          mobile-arrows
        >
          <q-route-tab to="/" exact label="¿Quiénes somos?" no-caps />
          <q-route-tab to="/cursos" label="Nuestros cursos" no-caps />
          <q-route-tab to="/faqs" label="FAQs" no-caps />
          <q-route-tab to="/login/alumno" label="Iniciar sesión" no-caps />
        </q-tabs>
      </div>
    </q-header>

    <q-page-container>
      <q-page>
        <slot />
      </q-page>

      <footer class="footer">
        <div class="footer-grid">
          <!-- Columna 1: accesos -->
          <div class="footer-col">
            <div class="footer-brand">
              <img :src="logoCursemia" alt="Logo CursemIA" class="footer-logo" />
              <span class="footer-brand-name">CursemIA</span>
            </div>
            <div class="footer-title">Accesos</div>
            <nav class="footer-links">
              <router-link to="/" class="footer-link">Inicio</router-link>
              <router-link to="/cursos" class="footer-link">Nuestros cursos</router-link>
              <router-link to="/faqs" class="footer-link">Preguntas frecuentes</router-link>
              <router-link to="/login/alumno" class="footer-link">Iniciar sesión</router-link>
            </nav>
          </div>

          <!-- Columna 2: política de privacidad (inventada) -->
          <div class="footer-col">
            <div class="footer-title">Política de privacidad</div>
            <p class="footer-text">
              En CursemIA cuidamos tu información. Los datos que compartes se usan
              únicamente con fines educativos y no se comparten con terceros.
              (Texto de ejemplo para la demostración.)
            </p>
            <a href="#" class="footer-link">Leer política completa</a>
          </div>

          <!-- Columna 3: redes sociales (inventadas) -->
          <div class="footer-col">
            <div class="footer-title">Redes sociales</div>
            <div class="footer-socials">
              <a
                v-for="red in redes"
                :key="red.nombre"
                href="#"
                class="social-link"
                :aria-label="red.nombre"
              >
                <svg
                  class="social-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path :d="red.path" />
                </svg>
                <span>{{ red.nombre }}</span>
              </a>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          CursemIA © 2026 — Hecho con fines educativos
        </div>
      </footer>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useRouter } from 'vue-router'
import logoCursemia from '../assets/logoCursemia.png'

const router = useRouter()

// Redes sociales (enlaces de ejemplo) con sus iconos SVG
const redes = [
  {
    nombre: 'Facebook',
    path: 'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z',
  },
  {
    nombre: 'Instagram',
    path: 'M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077',
  },
  {
    nombre: 'X / Twitter',
    path: 'M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z',
  },
  {
    nombre: 'YouTube',
    path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  },
  {
    nombre: 'LinkedIn',
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
]

function irA(ruta) {
  router.push(ruta)
}
</script>

<style scoped>
/* Fila única donde conviven logo, título y tabs */
.navbar {
  display: flex;
  align-items: center; /* alinea todo al mismo nivel vertical */
  justify-content: space-between;
  gap: 16px;
  min-height: 64px;
  padding: 0 16px;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 0 0 auto;
}

.navbar-logo {
  height: 40px;
  width: auto;
  display: block;
}

.navbar-title {
  color: #ffffff;
  font-size: 1.25rem;
  line-height: 1;
  white-space: nowrap;
}

.navbar-tabs {
  flex: 1 1 auto;
  min-width: 0;
}

/* Fondo oscuro para evitar franjas blancas antes del footer */
.q-page-container,
.q-page {
  background: var(--color-secundario);
}

/* ===== Footer de 3 columnas ===== */
.footer {
  background: #050d1f;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.2fr 1.4fr 1fr;
  gap: 32px;
  max-width: 1100px;
  margin: 0 auto;
  padding: 48px 24px 32px;
}

.footer-col {
  min-width: 0;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.footer-logo {
  height: 36px;
  width: auto;
  display: block;
}

.footer-brand-name {
  font-size: 1.15rem;
  font-weight: 800;
  color: #ffffff;
}

.footer-title {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-terciario, #4f85f0);
  margin-bottom: 12px;
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-link {
  width: fit-content;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: #ffffff;
}

.footer-text {
  margin: 0 0 12px;
  font-size: 0.88rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.65);
}

.footer-socials {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.social-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.social-icon {
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
}

.social-link:hover {
  color: #6fd6ff;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 18px 24px;
  text-align: center;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.55);
}

@media (max-width: 900px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 28px;
    padding: 36px 20px 28px;
  }
}

@media (max-width: 600px) {
  .navbar {
    min-height: 56px;
    padding: 0 8px;
    gap: 8px;
  }

  .navbar-logo {
    height: 32px;
  }

  .navbar-title {
    font-size: 1rem;
  }
}
</style>
