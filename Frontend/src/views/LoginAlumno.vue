<template>
  <LoginLayout>
    <div class="text-h5 text-weight-bold">CursemIA</div>
    <div class="text-subtitle1 text-grey-7 q-mb-lg">Iniciar sesión — Aprendiz</div>

    <LoginForm rol="alumno" />

    <div class="text-center q-mt-md">
      <q-btn flat color="primary" label="Volver al inicio" to="/" />
    </div>
  </LoginLayout>
</template>

<script setup>
import LoginLayout from '../components/LoginLayout.vue'
import LoginForm from '../components/LoginForm.vue'
</script>
