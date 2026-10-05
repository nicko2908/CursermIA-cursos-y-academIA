import 'dotenv/config'
import app from './app.js'
import conectarDB from './config/db.js'

const PORT = process.env.PORT || 4000

// Primero conecta a MongoDB y luego levanta el servidor
conectarDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor CursemIA corriendo en http://localhost:${PORT}`)
    })
  })
  .catch((error) => {
    console.error('No se pudo iniciar el servidor:', error.message)
  })
