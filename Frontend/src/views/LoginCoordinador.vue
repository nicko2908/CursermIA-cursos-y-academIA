<template>
  <LoginLayout>
    <div class="text-h5 text-weight-bold">CursemIA</div>
    <div class="text-subtitle1 text-grey-7 q-mb-lg">Acceso coordinador</div>

    <q-form class="q-gutter-md" @submit.prevent="entrar">
      <q-input
        v-model="correo"
        label="Correo electrónico"
        type="email"
        outlined
        dense
        lazy-rules
        :rules="[
          (v) => !!v || 'El correo es obligatorio',
          (v) => /.+@.+\..+/.test(v) || 'El correo no es válido',
        ]"
      />

      <q-input
        v-model="contrasena"
        label="Contraseña"
        :type="oculta ? 'password' : 'text'"
        outlined
        dense
        lazy-rules
        :rules="[(v) => !!v || 'La contraseña es obligatoria']"
      >
        <template #append>
          <q-icon
            :name="oculta ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="oculta = !oculta"
          />
        </template>
      </q-input>

      <q-btn
        type="submit"
        color="primary"
        unelevated
        no-caps
        size="lg"
        label="Entrar como coordinador"
        icon-right="login"
        class="full-width"
      />
    </q-form>

    <div class="text-center q-mt-md">
      <q-btn flat color="primary" label="Volver al inicio" to="/" />
    </div>
  </LoginLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import LoginLayout from '../components/LoginLayout.vue'

const router = useRouter()
const auth = useAuthStore()

const correo = ref('')
const contrasena = ref('')
const oculta = ref(true)

// Login solo de frontend: no valida contra backend ni guarda credenciales.
function entrar() {
  auth.setUsuario({
    rol: 'coordinador',
    cedula: 'coordinador',
    nombre: 'Coordinador',
    apellido: '',
    correo: correo.value,
  })
  router.push('/dashboard/coordinador')
}
</script>
