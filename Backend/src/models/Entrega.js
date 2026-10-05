import { Schema, model } from 'mongoose'

/**
 * Modelo Entrega
 *
 * Registra la entrega de un trabajo por parte de un aprendiz.
 * - `trabajo`: referencia al trabajo entregado.
 * - `aprendiz`: referencia al aprendiz (su cédula, que es el _id String).
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
      type: String, // cédula del aprendiz
      ref: 'Aprendiz',
      required: [true, 'La entrega debe referenciar un aprendiz'],
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
