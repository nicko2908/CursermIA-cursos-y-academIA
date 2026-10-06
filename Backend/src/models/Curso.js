import { Schema, model } from 'mongoose'

/**
 * Modelo Curso
 *
 * El `_id` se genera automáticamente (ObjectId).
 * El conteo de estudiantes se calcula de forma dinámica mediante el virtual
 * `cantidadEstudiantes`, que cuenta los aprendices cuyo campo `curso`
 * referencia a este curso.
 */
const cursoSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del curso es obligatorio'],
      trim: true,
    },
    fechaInicio: {
      type: Date,
      required: [true, 'La fecha de inicio es obligatoria'],
    },
    fechaFin: {
      type: Date,
      required: [true, 'La fecha de finalización es obligatoria'],
    },
    modalidad: {
      type: String,
      required: [true, 'La modalidad es obligatoria'],
      enum: {
        values: ['virtual', 'presencial'],
        message: 'La modalidad debe ser "virtual" o "presencial"',
      },
    },
    docente: {
      type: String,
      required: [true, 'El docente es obligatorio'],
      trim: true,
    },
    cupos: {
      type: Number,
      default: 45,
      min: [1, 'Debe haber al menos 1 cupo'],
      max: [45, 'Como máximo 45 cupos por curso'],
    },
    nivel: {
      type: String,
      enum: ['Básico', 'Intermedio', 'Alto'],
      default: 'Básico',
    },
    edadMinima: {
      type: Number,
      default: 15,
    },
    activo: {
      type: Boolean,
      default: true,
    },
    // Horario semanal: [{ dia: 1 (lunes) … 5 (viernes), horaInicio: 'HH:mm', horaFin: 'HH:mm' }]
    horario: {
      type: [
        {
          _id: false,
          dia: { type: Number, min: 1, max: 5 },
          horaInicio: { type: String },
          horaFin: { type: String },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    // Permite que los campos virtuales aparezcan en las respuestas JSON
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Virtual: cantidad de estudiantes inscritos en el curso.
// Para que aparezca en la respuesta, el controlador usa:
//   Curso.find().populate('cantidadEstudiantes')
cursoSchema.virtual('cantidadEstudiantes', {
  ref: 'Aprendiz',
  localField: '_id',
  foreignField: 'cursos',
  count: true,
})

export default model('Curso', cursoSchema)
