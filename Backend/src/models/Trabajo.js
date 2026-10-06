import { Schema, model } from 'mongoose'

/**
 * Modelo Trabajo (tarea / taller asignado por un docente).
 *
 * Opción simple: el curso se guarda por NOMBRE (`cursoNombre`) porque los
 * cursos viven en el frontend (estáticos). `curso` (ObjectId) queda opcional
 * por compatibilidad con cursos reales de la base.
 * - `competencia`: nombre de la competencia evaluada.
 * - `docenteNombre`: quién asignó el trabajo.
 * - `fechaLimite`: fecha máxima de entrega.
 */
const trabajoSchema = new Schema(
  {
    curso: {
      type: Schema.Types.ObjectId,
      ref: 'Curso',
    },
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
    competencia: {
      type: String,
      default: '',
      trim: true,
    },
    titulo: {
      type: String,
      required: [true, 'El título del trabajo es obligatorio'],
      trim: true,
    },
    descripcion: {
      type: String,
      default: '',
      trim: true,
    },
    fechaLimite: {
      type: Date,
      required: [true, 'La fecha límite es obligatoria'],
    },
  },
  { timestamps: true }
)

export default model('Trabajo', trabajoSchema)
