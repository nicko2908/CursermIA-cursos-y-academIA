<template>
  <q-layout view="hHh lpR fFf">
    <!-- Navbar: logo + título + tabs + usuario, todo al mismo nivel -->
    <q-header elevated class="bg-primary">
      <div class="navbar">
        <div class="navbar-brand cursor-pointer" @click="irA('/dashboard/alumno')">
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
          <q-route-tab to="/dashboard/alumno" exact label="Mis cursos" no-caps />
          <q-route-tab to="/dashboard/alumno/tareas" label="Mis tareas" no-caps />
          <q-route-tab to="/dashboard/alumno/cronograma" label="Cronograma" no-caps />
          <q-route-tab
            to="/dashboard/alumno/calificaciones"
            label="Mis calificaciones"
            no-caps
          />
          <q-route-tab to="/dashboard/alumno/cursos" label="Cursos" no-caps />
        </q-tabs>

        <!-- Usuario: al hacer clic se despliega el menú con "Salir" -->
        <q-btn flat no-caps class="navbar-user">
          <span>{{ nombre }}</span>
          <q-icon name="expand_more" size="20px" class="q-ml-xs" />
          <q-menu anchor="bottom right" self="top right" :offset="[0, 8]">
            <q-list style="min-width: 180px">
              <q-item clickable v-ripple @click="salir">
                <q-item-section avatar>
                  <q-icon name="logout" />
                </q-item-section>
                <q-item-section>Salir</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-lg">
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import logoCursemia from '../assets/logoCursemia.png'

const router = useRouter()
const auth = useAuthStore()

const nombre = computed(() => {
  const u = auth.usuario
  return u ? `${u.nombre} ${u.apellido}` : ''
})

function irA(ruta) {
  router.push(ruta)
}

function salir() {
  auth.logout()
  router.push('/')
}

onMounted(() => {
  if (!auth.usuario || auth.usuario.rol !== 'alumno') {
    router.push('/login/alumno')
  }
})
</script>

<style scoped>
/* Fila única donde conviven logo, título, tabs y usuario */
.navbar {
  display: flex;
  align-items: center; /* todos los ítems al mismo nivel vertical */
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

.navbar-user {
  flex: 0 0 auto;
  color: #ffffff;
  font-weight: 600;
  text-transform: none;
}

/* Fondo de toda la vista con el color secundario */
.q-page-container,
.q-page {
  background: var(--color-secundario);
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
