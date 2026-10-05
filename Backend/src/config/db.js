import mongoose from 'mongoose'

/**
 * Conecta a MongoDB usando la cadena definida en el archivo .env
 * (MONGODB_URI). Es la conexión que visualizas en MongoDB Compass.
 */
const conectarDB = async () => {
  try {
    const uri = process.env.MONGODB_URI

    if (!uri) {
      throw new Error('Falta la variable MONGODB_URI en el archivo .env')
    }

    await mongoose.connect(uri)
    console.log(`✅ Conectado a MongoDB: base de datos "${mongoose.connection.name}"`)
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message)
    process.exit(1)
  }
}

export default conectarDB
