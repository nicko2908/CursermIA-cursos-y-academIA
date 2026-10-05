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
