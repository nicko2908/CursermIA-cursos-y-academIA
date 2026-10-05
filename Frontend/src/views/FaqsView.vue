<template>
  <PublicLayout>
    <section class="q-pa-xl faqs">
      <h1 class="text-h4 text-weight-bold text-center">Preguntas frecuentes</h1>
      <p class="text-center q-mt-sm subtitle">
        Resolvemos las dudas más comunes sobre CursemIA.
      </p>

      <q-list bordered class="faq-list q-mt-lg">
        <q-expansion-item
          v-for="item in faqs"
          :key="item.pregunta"
          :label="item.pregunta"
          expand-icon="add"
          expanded-icon="remove"
        >
          <q-card>
            <q-card-section>{{ item.respuesta }}</q-card-section>
          </q-card>
        </q-expansion-item>
      </q-list>
    </section>
  </PublicLayout>
</template>

<script setup>
import PublicLayout from '../components/PublicLayout.vue'

const faqs = [
  {
    pregunta: '¿Qué es CursemIA?',
    respuesta:
      'Una plataforma de cursos en línea y presenciales para aprendices y profesores, con seguimiento de trabajos y entregas.',
  },
  {
    pregunta: '¿Cuánto cuesta inscribirse?',
    respuesta:
      'El registro es gratuito y educativo. Solo necesitas tu cédula, nombre, correo y una contraseña.',
  },
  {
    pregunta: '¿Qué modalidades de curso hay?',
    respuesta: 'Virtual (desde cualquier lugar) y presencial (en el aula).',
  },
  {
    pregunta: '¿Cómo sé qué trabajos debo entregar?',
    respuesta:
      'En tu dashboard de aprendiz verás los cursos a los que perteneces y los trabajos pendientes con su estado.',
  },
  {
    pregunta: '¿Los profesores pueden ver quién entregó?',
    respuesta:
      'Sí, cada profesor ve los trabajos que asignó y quiénes los han entregado.',
  },
]
</script>

<style scoped>
.faqs {
  background: #071733;
  color: #ffffff;
  min-height: 60vh;
}
.subtitle {
  color: rgba(255, 255, 255, 0.8);
}
.faq-list {
  max-width: 720px;
  margin: 0 auto;
  color: rgba(0, 0, 0, 0.87);
}
</style>
