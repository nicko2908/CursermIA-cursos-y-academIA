import { Schema, model } from 'mongoose'

/**
 * Modelo Solicitud de inscripción (opción simple).
 *
 * El curso y el docente se guardan como TEXTO (no como referencias), porque el
 * catálogo de cursos vive en el frontend y no en la base de datos.
 * - `estado`: pendiente → aprobada / rechazada (lo define el profesor).
 * Un aprendiz no puede tener dos solicitudes al mismo curso.
 */
const solicitudSchema = new Schema(
  {
    aprendizCedula: {
      type: String,
      ref: 'Aprendiz',
      required: [true, 'La cédula del aprendiz es obligatoria'],
      trim: true,
    },
    aprendizNombre: {
      type: String,
      default: '',
      trim: true,
    },
    cursoNombre: {
      type: String,
      required: [true, 'El nombre del curso es obligatorio'],
      trim: true,
    },
    docenteNombre: {
      type: String,
      required: [true, 'El nombre del docente es obligatorio'],
      trim: true,
    },
    tipoId: {
      type: String,
      enum: ['CC', 'TI', 'Otro'],
      default: 'CC',
    },
    numeroId: {
      type: String,
      required: [true, 'El número de identificación es obligatorio'],
      trim: true,
    },
    fechaNacimiento: {
      type: Date,
    },
    correo: {
      type: String,
      required: [true, 'El correo electrónico es obligatorio'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'El correo no tiene un formato válido'],
    },
    aceptaDatos: {
      type: Boolean,
      required: [true, 'Debes autorizar el tratamiento de datos'],
    },
    estado: {
      type: String,
      enum: ['pendiente', 'aprobada', 'rechazada', 'baja_pendiente', 'baja'],
      default: 'pendiente',
    },
    motivoBaja: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
)

// Evita solicitudes duplicadas del mismo aprendiz al mismo curso
solicitudSchema.index({ aprendizCedula: 1, cursoNombre: 1 }, { unique: true })

export default model('Solicitud', solicitudSchema)
