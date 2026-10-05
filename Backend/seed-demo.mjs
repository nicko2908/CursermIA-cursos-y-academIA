/**
 * Seed de datos de prueba para CursemIA.
 *
 * Lee la conexión desde el archivo .env (MONGODB_URI), así que sirve tanto
 * para la base local como para MongoDB Atlas (y para Render).
 *
 * Uso:
 *   npm run seed
 *
 * Es idempotente: si lo corres varias veces, no duplica (usa upsert).
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import Aprendiz from './src/models/Aprendiz.js'
import Solicitud from './src/models/Solicitud.js'

// Cursos de prueba (nombre + docente, como están en el catálogo del frontend)
const cursos = [
  { nombre: 'Inglés Fluido: Conversación y Pronunciación Real', docente: 'Camila Restrepo' },
  { nombre: 'Fundamentos de Inteligencia Artificial y Prompt Engineering', docente: 'Valeria Morales' },
  { nombre: 'Análisis de Datos con Python y Pandas', docente: 'Alejandro Silva' },
  { nombre: 'Machine Learning y Modelos Predictivos en Python', docente: 'Elena Ramírez' },
  { nombre: 'Ciberseguridad y Ethical Hacking Fundamentals', docente: 'Gabriel Torres' },
  { nombre: 'Desarrollo Web Full Stack con JavaScript y Node.js', docente: 'Mateo Benítez' },
]

const NOMBRES = [
  'Andrés', 'María', 'Santiago', 'Camila', 'Sebastián', 'Valentina', 'Mateo',
  'Daniela', 'Nicolás', 'Isabella', 'Alejandro', 'Mariana', 'Samuel', 'Gabriela',
  'Tomás', 'Lucía', 'Emilio', 'Sara', 'Juan', 'Paula',
]

const APELLIDOS = [
  'Gómez', 'Rodríguez', 'Martínez', 'López', 'García', 'Pérez', 'Sánchez',
  'Ramírez', 'Torres', 'Flores', 'Rivera', 'Vargas', 'Castro', 'Rojas',
  'Mendoza', 'Ortiz', 'Silva', 'Cárdenas',
]

async function upsertSolicitud(aprendiz, curso) {
  await Solicitud.updateOne(
    { aprendizCedula: aprendiz._id, cursoNombre: curso.nombre },
    {
      $set: {
        aprendizCedula: aprendiz._id,
        aprendizNombre: `${aprendiz.nombre} ${aprendiz.apellido}`.trim(),
        cursoNombre: curso.nombre,
        docenteNombre: curso.docente,
        tipoId: 'CC',
        numeroId: aprendiz._id,
        correo: aprendiz.correo || `${aprendiz._id}@cursemia.test`,
        aceptaDatos: true,
        estado: 'aprobada',
      },
    },
    { upsert: true }
  )
}

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('Falta MONGODB_URI en el archivo .env')
  }

  await mongoose.connect(uri)
  console.log(`🔌 Conectado a la base de datos: "${mongoose.connection.name}"`)

  let aprendicesCreados = 0
  let inscripciones = 0

  // 1) 28 aprendices de prueba, cada uno inscrito en 1..3 cursos
  for (let i = 0; i < 28; i++) {
    const cedula = String(1002003001 + i)
    const nombre = NOMBRES[i % NOMBRES.length]
    const apellido1 = APELLIDOS[(i * 2) % APELLIDOS.length]
    const apellido2 = APELLIDOS[(i * 5 + 3) % APELLIDOS.length]
    const apellido = `${apellido1} ${apellido2}`
    const correo = `estudiante.prueba${i + 1}@cursemia.test`

    const aprendiz = {
      _id: cedula,
      nombre,
      apellido,
      correo,
      contrasena: '1234',
      telefono: `3${String(100000000 + i * 7919).slice(0, 9)}`,
      fechaNacimiento: new Date(2000 + (i % 6), i % 12, 1 + (i % 27)),
    }

    await Aprendiz.updateOne({ _id: cedula }, { $set: aprendiz }, { upsert: true })
    aprendicesCreados++

    const numCursos = 1 + (i % 3) // 1, 2 o 3
    for (let k = 0; k < numCursos; k++) {
      const curso = cursos[(i + k * 2) % cursos.length]
      await upsertSolicitud(aprendiz, curso)
      inscripciones++
    }
  }

  // 2) Nickolas y Cristiano: crear su ficha + inscribirlos en 4 cursos
  const fullStack = cursos[5]
  const extras = [fullStack, cursos[0], cursos[1], cursos[2]] // Full Stack + Inglés, IA, Análisis
  const especiales = [
    { _id: '1101623739', nombre: 'Nickolas', apellido: 'Muñoz', correo: 'nickolassantiago2908@gmail.com' },
    { _id: '123', nombre: 'Cristiano', apellido: 'Ronaldo', correo: '123@cursemia.test' },
  ]

  for (const aprendiz of especiales) {
    await Aprendiz.updateOne(
      { _id: aprendiz._id },
      {
        $set: {
          nombre: aprendiz.nombre,
          apellido: aprendiz.apellido,
          correo: aprendiz.correo,
          contrasena: '1234',
        },
      },
      { upsert: true }
    )

    for (const curso of extras) {
      await upsertSolicitud(aprendiz, curso)
      inscripciones++
    }
  }

  console.log(`✅ Aprendices creados/actualizados: ${aprendicesCreados}`)
  console.log(`✅ Solicitudes aprobadas creadas/actualizadas: ${inscripciones}`)

  await mongoose.disconnect()
}

main().catch(async (error) => {
  console.error('❌ Error en el seed:', error.message)
  try {
    await mongoose.disconnect()
  } catch {
    /* nada */
  }
  process.exit(1)
})
