import express from 'express'
import cors from 'cors'

import aprendizRoutes from './routes/aprendiz.routes.js'
import profesorRoutes from './routes/profesor.routes.js'
import cursoRoutes from './routes/curso.routes.js'
import trabajoRoutes from './routes/trabajo.routes.js'
import entregaRoutes from './routes/entrega.routes.js'
import solicitudRoutes from './routes/solicitud.routes.js'

const app = express()

// ===== Middlewares =====
// CORS: permite que el frontend (Vite) consuma la API desde otro puerto.
// Nota: el frontend se conecta con AXIOS (no fetch).
app.use(cors())
app.use(express.json())

// ===== Ruta de bienvenida =====
app.get('/', (req, res) => {
  res.json({
    nombre: 'CursemIA API',
    mensaje: 'Bienvenido a la API de gestión de cursos',
    rutasDisponibles: [
      '/api/aprendices',
      '/api/profesores',
      '/api/cursos',
      '/api/trabajos',
      '/api/entregas',
      '/api/solicitudes'
    ]
  })
})

// ===== Rutas de la API =====
app.use('/api/aprendices', aprendizRoutes)
app.use('/api/profesores', profesorRoutes)
app.use('/api/cursos', cursoRoutes)
app.use('/api/trabajos', trabajoRoutes)
app.use('/api/entregas', entregaRoutes)
app.use('/api/solicitudes', solicitudRoutes)

// ===== Manejo de rutas no encontradas =====
app.use((req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada' })
})

export default app
