<template>
  <q-layout view="hHh lpR fFf">
    <!-- Navbar: logo + título + tabs, todo al mismo nivel (centrado verticalmente) -->
    <q-header elevated class="bg-primary">
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

      <footer class="bg-primary text-white text-center q-pa-md">
        CursemIA © 2026 — Hecho con fines educativos
      </footer>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useRouter } from 'vue-router'
import logoCursemia from '../assets/logoCursemia.png'

const router = useRouter()

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
