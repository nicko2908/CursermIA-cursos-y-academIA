import { Schema, model } from 'mongoose'

/**
 * Modelo Profesor
 *
 * El "ID" del profesor es su CÉDULA, por eso se usa como `_id` (String).
 * - `cursos`: lista de cursos que dicta (referencias a Curso).
 * - `contrasena`: texto plano, solo educativo.
 * - `telefono` y `fechaNacimiento` quedan opcionales (el login no los pide).
 */
const profesorSchema = new Schema(
  {
    _id: {
      type: String, // la cédula actúa como ID
      required: [true, 'La cédula es obligatoria'],
      trim: true,
    },
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    apellido: {
      type: String,
      default: '',
      trim: true,
    },
    correo: {
      type: String,
      required: [true, 'El correo electrónico es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'El correo no tiene un formato válido'],
    },
    contrasena: {
      type: String,
      default: '',
    },
    telefono: {
      type: String,
      trim: true,
    },
    fechaNacimiento: {
      type: Date,
    },
    cursos: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Curso' }],
      default: [],
    },
  },
  { timestamps: true }
)

export default model('Profesor', profesorSchema)
