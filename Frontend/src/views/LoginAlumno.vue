<template>
  <LoginLayout>
    <div class="text-h5 text-weight-bold">CursemIA</div>
    <div class="text-subtitle1 text-grey-7 q-mb-lg">Iniciar sesión — Aprendiz</div>

    <LoginForm rol="alumno" />

    <div class="text-center q-mt-md">
      <span class="text-grey-7">¿No tienes cuenta? </span>
      <router-link to="/registro/alumno" class="registro-link">Regístrate</router-link>
    </div>

    <div class="text-center q-mt-sm">
      <q-btn flat color="primary" label="Volver al inicio" to="/" />
    </div>
  </LoginLayout>
</template>

<script setup>
import LoginLayout from '../components/LoginLayout.vue'
import LoginForm from '../components/LoginForm.vue'
</script>

<style scoped>
.registro-link {
  color: var(--color-principal, #2064e3);
  font-weight: 600;
  text-decoration: none;
}

.registro-link:hover {
  text-decoration: underline;
}
</style>
