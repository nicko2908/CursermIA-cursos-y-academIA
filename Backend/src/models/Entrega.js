import { Schema, model } from 'mongoose'

/**
 * Modelo Entrega
 *
 * Registra la entrega de un trabajo por parte de un aprendiz.
 * - `trabajo`: referencia al trabajo entregado.
 * - `aprendiz`: referencia al aprendiz (su cédula, que es el _id String).
 * - `nombreArchivo`: nombre que el aprendiz le da a su entrega.
 * - `archivos`: nombres de los archivos adjuntos (no se suben archivos reales).
 * Un aprendiz no puede entregar dos veces el mismo trabajo (índice único).
 */
const entregaSchema = new Schema(
  {
    trabajo: {
      type: Schema.Types.ObjectId,
      ref: 'Trabajo',
      required: [true, 'La entrega debe referenciar un trabajo'],
    },
    aprendiz: {
      type: String,
      ref: 'Aprendiz',
      required: [true, 'La entrega debe referenciar un aprendiz'],
    },
    nombreArchivo: {
      type: String,
      default: '',
      trim: true,
    },
    archivos: {
      type: [String],
      default: [],
    },
    calificacion: {
      type: Number,
      min: [0, 'La calificación mínima es 0'],
      max: [100, 'La calificación máxima es 100'],
      default: null,
    },
    fechaEntrega: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

// Evita entregas duplicadas del mismo trabajo por el mismo aprendiz
entregaSchema.index({ trabajo: 1, aprendiz: 1 }, { unique: true })

export default model('Entrega', entregaSchema)
