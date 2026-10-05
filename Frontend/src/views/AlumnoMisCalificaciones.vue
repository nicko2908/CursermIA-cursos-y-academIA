<template>
  <div>
    <h2 class="text-h5 text-weight-bold text-white q-mb-md">Mis calificaciones</h2>

    <div class="vacio">
      <q-icon name="grade" size="42px" />
      <p>Aquí verás tus calificaciones cuando estén disponibles.</p>
    </div>
  </div>
</template>

<script setup>
// Vista provisional: todavía no existe un campo de calificación en el backend.
</script>

<style scoped>
.vacio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 56px 16px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}

.vacio p {
  margin: 0;
}
</style>
