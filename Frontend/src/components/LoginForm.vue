<template>
  <q-form class="q-gutter-md" @submit.prevent="onSubmit">
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

    <q-btn
      type="submit"
      :label="`Entrar como ${rolLabel}`"
      color="primary"
      class="full-width"
      :loading="cargando"
      unelevated
    />

    <q-banner v-if="error" rounded class="bg-negative text-white">
      {{ error }}
    </q-banner>
  </q-form>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/axios.js'
import { useAuthStore } from '../stores/auth.js'

const props = defineProps({
  rol: { type: String, required: true }, // 'alumno' | 'profesor'
})

const router = useRouter()
const auth = useAuthStore()

const oculta = ref(true)
const cargando = ref(false)
const error = ref('')

const form = reactive({
  cedula: '',
  nombreCompleto: '',
  correo: '',
  contrasena: '',
})

const rolLabel = computed(() => (props.rol === 'alumno' ? 'aprendiz' : 'profesor'))

async function onSubmit() {
  error.value = ''
  cargando.value = true

  try {
    // Separa "nombre completo" en nombre (primer token) y apellido (el resto)
    const partes = form.nombreCompleto.trim().split(/\s+/)
    const nombre = partes[0] || ''
    const apellido = partes.slice(1).join(' ')

    const payload = {
      _id: form.cedula.trim(),
      nombre,
      apellido,
      correo: form.correo.trim(),
      contrasena: form.contrasena,
    }

    const endpoint = props.rol === 'alumno' ? '/aprendices/login' : '/profesores/login'
    const { data } = await api.post(endpoint, payload)

    const usuario = props.rol === 'alumno' ? data.aprendiz : data.profesor

    auth.setUsuario({
      rol: props.rol,
      cedula: usuario._id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      fechaNacimiento: usuario.fechaNacimiento || null,
      cursos: usuario.cursos || [],
    })

    router.push(props.rol === 'alumno' ? '/dashboard/alumno' : '/dashboard/docente')
  } catch (e) {
    error.value = e.response?.data?.mensaje || 'No se pudo iniciar sesión'
  } finally {
    cargando.value = false
  }
}
</script>
