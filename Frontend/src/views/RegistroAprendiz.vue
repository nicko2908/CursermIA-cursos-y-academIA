<template>
  <LoginLayout :con-switch="false">
    <div class="text-h5 text-weight-bold">Crea tu cuenta</div>
    <div class="text-subtitle1 text-grey-7 q-mb-lg">Registro de aprendiz</div>

    <q-form class="q-gutter-md" @submit.prevent="registrar">
      <q-input
        v-model="form.cedula"
        label="Cédula"
        outlined
        dense
        lazy-rules
        :rules="[(v) => !!v || 'La cédula es obligatoria']"
      />

      <q-input
        v-model="form.nombreCompleto"
        label="Nombre completo"
        outlined
        dense
        lazy-rules
        :rules="[(v) => !!v || 'El nombre es obligatorio']"
      />

      <q-input
        v-model="form.fechaNacimiento"
        label="Fecha de nacimiento"
        type="date"
        outlined
        dense
        lazy-rules
        :rules="[(v) => !!v || 'La fecha de nacimiento es obligatoria']"
      />

      <q-input
        v-model="form.correo"
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
        v-model="form.contrasena"
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

      <!-- Documentos -->
      <div class="archivo">
        <div class="archivo-titulo">
          Tarjeta de Identidad (T.I.) <span class="req">*</span>
        </div>
        <q-file
          v-model="form.archivoTi"
          outlined
          dense
          accept=".pdf,.jpg,.jpeg,.png"
          label="Adjuntar documento"
          lazy-rules
          :rules="[(v) => !!v || 'Adjunta tu Tarjeta de Identidad']"
        >
          <template #prepend>
            <q-icon name="upload_file" />
          </template>
        </q-file>
      </div>

      <div class="archivo">
        <div class="archivo-titulo">
          Certificado de Bachiller <span class="req">*</span>
        </div>
        <q-file
          v-model="form.archivoBachiller"
          outlined
          dense
          accept=".pdf,.jpg,.jpeg,.png"
          label="Adjuntar documento"
          lazy-rules
          :rules="[(v) => !!v || 'Adjunta tu certificado de bachiller']"
        >
          <template #prepend>
            <q-icon name="school" />
          </template>
        </q-file>
      </div>

      <q-btn
        type="submit"
        color="primary"
        unelevated
        no-caps
        size="lg"
        label="Crear cuenta"
        class="full-width"
        :loading="cargando"
      />
    </q-form>

    <div class="text-center q-mt-md">
      <span class="text-grey-7">¿Ya tienes cuenta? </span>
      <router-link to="/login/alumno" class="registro-link">Inicia sesión</router-link>
    </div>
  </LoginLayout>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import api from '../api/axios.js'
import { useAuthStore } from '../stores/auth.js'
import LoginLayout from '../components/LoginLayout.vue'

const router = useRouter()
const auth = useAuthStore()
const $q = useQuasar()

const oculta = ref(true)
const cargando = ref(false)

const form = reactive({
  cedula: '',
  nombreCompleto: '',
  fechaNacimiento: '',
  correo: '',
  contrasena: '',
  archivoTi: null,
  archivoBachiller: null,
})

async function registrar() {
  const partes = form.nombreCompleto.trim().split(/\s+/)
  const nombre = partes[0] || ''
  const apellido = partes.slice(1).join(' ')

  // Nota: los archivos son parte del formulario (estético), no se suben.
  const payload = {
    _id: form.cedula.trim(),
    nombre,
    apellido,
    correo: form.correo.trim(),
    contrasena: form.contrasena,
    fechaNacimiento: form.fechaNacimiento || null,
  }

  cargando.value = true
  try {
    const { data } = await api.post('/aprendices', payload)

    // Auto-login y al panel
    auth.setUsuario({
      rol: 'alumno',
      cedula: data._id,
      nombre: data.nombre,
      apellido: data.apellido,
      correo: data.correo,
      fechaNacimiento: data.fechaNacimiento || null,
      cursos: data.cursos || [],
    })

    $q.notify({
      type: 'positive',
      message: '¡Cuenta creada! Bienvenido a CursemIA.',
      position: 'top',
    })
    router.push('/dashboard/alumno')
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: e.response?.data?.mensaje || 'No se pudo crear la cuenta. Inténtalo de nuevo.',
      position: 'top',
    })
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.archivo {
  margin-top: 2px;
}

.archivo-titulo {
  font-size: 0.85rem;
  font-weight: 600;
  color: #424242;
  margin-bottom: 6px;
}

.req {
  color: #c0392b;
}

.registro-link {
  color: var(--color-principal, #2064e3);
  font-weight: 600;
  text-decoration: none;
}

.registro-link:hover {
  text-decoration: underline;
}
</style>
