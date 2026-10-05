import { Schema, model } from 'mongoose'

/**
 * Modelo Trabajo
 *
 * Un trabajo (tarea / asignación) pertenece a un curso y lo asigna un profesor.
 * - `curso`: referencia al curso al que pertenece el trabajo.
 * - `fechaLimite`: fecha máxima de entrega.
 */
const trabajoSchema = new Schema(
  {
    curso: {
      type: Schema.Types.ObjectId,
      ref: 'Curso',
      required: [true, 'El trabajo debe pertenecer a un curso'],
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
