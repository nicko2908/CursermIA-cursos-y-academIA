<template>
  <div class="login-split">
    <!-- Columna izquierda: IMÁGENES (2fr) -->
    <div class="login-imagenes">
      <template v-if="imagenes.length">
        <img
          v-for="(img, i) in imagenes"
          :key="i"
          :src="img"
          class="login-imagen"
          :alt="`CursemIA ${i + 1}`"
        />
      </template>

      <div v-else class="login-imagenes-vacio">
        <q-icon name="add_photo_alternate" size="4rem" color="white" />
        <p class="q-mt-md text-center">
          Agrega tus imágenes en<br />
          <code>src/assets/login/</code>
        </p>
      </div>
    </div>

    <!-- Columna derecha: FORMULARIO (1fr) -->
    <div class="login-form">
      <div class="login-form-contenido">
        <!-- Interruptor Aprendiz / Docente (se puede ocultar en el registro) -->
        <LoginRoleSwitch v-if="conSwitch" />

        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import LoginRoleSwitch from './LoginRoleSwitch.vue'
import { imagenes as imagenesAssets } from '../data/imagenes.js'

defineProps({
  // Mostrar el interruptor Aprendiz/Docente/Coordinador (oculto en el registro)
  conSwitch: { type: Boolean, default: true },
})

// Imágenes adicionales que coloques en src/assets/login/ (opcional)
const modulos = import.meta.glob('../assets/login/*.{png,jpg,jpeg,webp,svg,gif}', {
  eager: true,
  import: 'default',
})

// "Jóvenes estudiando" + las que haya en src/assets/login/
const imagenes = [imagenesAssets.jovenes, ...Object.values(modulos)].filter(Boolean)
</script>

<style scoped>
.login-split {
  display: grid;
  grid-template-columns: 1.4fr 1fr; /* imágenes 1.4fr | login 1fr */
  min-height: 100vh;
}

/* ===== Columna de imágenes ===== */
.login-imagenes {
  background: var(--color-secundario);
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: 1fr;
  gap: 12px;
  padding: 12px;
  overflow: hidden;
}

.login-imagen {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

/* Si solo hay una imagen, ocupa todo el ancho */
.login-imagen:only-child {
  grid-column: 1 / -1;
}

.login-imagenes-vacio {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
}

/* ===== Columna del formulario ===== */
.login-form {
  display: flex;
  padding: 24px;
  background: var(--color-secundario);
  overflow-y: auto;
}

/* Tarjeta flotante del formulario */
.login-form-contenido {
  width: 100%;
  max-width: 440px;
  margin: auto; /* centra y permite scroll si el formulario es alto */
  background: #ffffff;
  padding: 36px 32px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  transition: transform 0.35s ease, box-shadow 0.35s ease;
  will-change: transform;
}

/* Al pasar el cursor crece un poco y la sombra se hace más clara */
.login-form-contenido:hover {
  transform: translateY(-8px) scale(1.03);
  box-shadow: 0 24px 50px rgba(0, 0, 0, 0.5);
}

/* ===== Responsive: en pantallas pequeñas se apila ===== */
@media (max-width: 900px) {
  .login-split {
    grid-template-columns: 1fr;
  }

  .login-imagenes {
    min-height: 240px;
  }
}
</style>
