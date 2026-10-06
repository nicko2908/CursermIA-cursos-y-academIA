import { Schema, model } from 'mongoose'

/**
 * Modelo Evento (cronograma)
 *
 * El docente crea eventos (clases, exámenes, entregas…) para un curso, y los
 * aprendices inscritos en ese curso los ven. El curso se identifica por nombre
 * (opción simple).
 */
const eventoSchema = new Schema(
  {
    cursoNombre: {
      type: String,
      required: [true, 'El nombre del curso es obligatorio'],
      trim: true,
    },
    docenteNombre: {
      type: String,
      default: '',
      trim: true,
    },
    titulo: {
      type: String,
      required: [true, 'El título del evento es obligatorio'],
      trim: true,
    },
    descripcion: {
      type: String,
      default: '',
      trim: true,
    },
    fecha: {
      type: Date,
      required: [true, 'La fecha del evento es obligatoria'],
    },
    horaInicio: {
      type: String,
      default: '',
    },
    horaFin: {
      type: String,
      default: '',
    },
    tipo: {
      type: String,
      enum: ['clase', 'examen', 'trabajo', 'otro'],
      default: 'clase',
    },
  },
  { timestamps: true }
)

export default model('Evento', eventoSchema)
