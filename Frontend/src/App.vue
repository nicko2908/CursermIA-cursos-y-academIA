<template>
  <router-view />
</template>

<script setup>
</script>
<style>
:root{
  --color-principal: #2064e3;
  --color-neutro: #2b2c2e;
  --color-terciario: #4f85f0;
  --color-secundario: #000b20;
}

/* Barra de navegación (navbar) de todas las vistas.
   Se usa .q-header.header-app para ganarle a la regla de Quasar
   .q-layout__section--marginal { background-color: var(--q-primary) } */
.q-header.header-app {
  background-color: var(--color-secundario);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
</style>