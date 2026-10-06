import Solicitud from '../models/Solicitud.js'
import Aprendiz from '../models/Aprendiz.js'
import Curso from '../models/Curso.js'

// Edad en años a partir de una fecha de nacimiento
function edadDesde(fechaNacimiento) {
  const n = new Date(fechaNacimiento)
  if (Number.isNaN(n.getTime())) return null
  const hoy = new Date()
  let edad = hoy.getFullYear() - n.getFullYear()
  const m = hoy.getMonth() - n.getMonth()
  if (m < 0 || (m === 0 && hoy.getDate() < n.getDate())) edad--
  return edad
}

// POST /api/solicitudes  -> el aprendiz crea una solicitud (estado "pendiente")
// Valida: no duplicada, cupo disponible y edad mínima.
export const createSolicitud = async (req, res) => {
  try {
    const { aprendizCedula, cursoNombre, fechaNacimiento, edadMinima, cupos } = req.body

    // 1) No duplicar solicitud al mismo curso
    const existente = await Solicitud.findOne({ aprendizCedula, cursoNombre })
    if (existente) {
      return res.status(409).json({
        mensaje: `Ya tienes una solicitud para "${cursoNombre}" (estado: ${existente.estado})`,
        solicitud: existente,
      })
    }

    // 2) El curso no debe haber comenzado (solo aplica a cursos creados en la BD)
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const cursoBD = await Curso.findOne({ nombre: cursoNombre })
    if (cursoBD && new Date(cursoBD.fechaInicio) < hoy) {
      return res
        .status(400)
        .json({ mensaje: 'El curso ya comenzó; no se permiten nuevas inscripciones' })
    }

    // 3) Cupos disponibles (cuenta solicitudes pendientes + aprobadas del curso)
    if (cupos) {
      const ocupados = await Solicitud.countDocuments({
        cursoNombre,
        estado: { $in: ['pendiente', 'aprobada'] },
      })
      if (ocupados >= cupos) {
        return res
          .status(409)
          .json({ mensaje: `El curso "${cursoNombre}" ya no tiene cupos disponibles` })
      }
    }

    // 3) Edad mínima
    if (fechaNacimiento && edadMinima) {
      const edad = edadDesde(fechaNacimiento)
      if (edad !== null && edad < edadMinima) {
        return res.status(400).json({
          mensaje: `Debes tener al menos ${edadMinima} años para inscribirte en este curso`,
        })
      }
    }

    const solicitud = new Solicitud(req.body)
    await solicitud.save()

    // Guardar la fecha de nacimiento en el perfil del aprendiz si no la tenía
    if (fechaNacimiento) {
      await Aprendiz.updateOne(
        {
          _id: aprendizCedula,
          $or: [{ fechaNacimiento: { $exists: false } }, { fechaNacimiento: null }],
        },
        { $set: { fechaNacimiento } }
      )
    }

    res.status(201).json(solicitud)
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear la solicitud', error: error.message })
  }
}

// GET /api/solicitudes  -> todas las solicitudes
export const getSolicitudes = async (req, res) => {
  try {
    const solicitudes = await Solicitud.find().sort({ createdAt: -1 })
    res.json(solicitudes)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener las solicitudes', error: error.message })
  }
}

// GET /api/solicitudes/aprendiz/:cedula
export const getSolicitudesAprendiz = async (req, res) => {
  try {
    const solicitudes = await Solicitud.find({ aprendizCedula: req.params.cedula }).sort({
      createdAt: -1,
    })
    res.json(solicitudes)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener las solicitudes', error: error.message })
  }
}

// GET /api/solicitudes/docente/:nombre
export const getSolicitudesDocente = async (req, res) => {
  try {
    const solicitudes = await Solicitud.find({ docenteNombre: req.params.nombre }).sort({
      createdAt: -1,
    })
    res.json(solicitudes)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener las solicitudes', error: error.message })
  }
}

// POST /api/solicitudes/:id/baja  -> el aprendiz solicita darse de baja de un curso
export const solicitarBaja = async (req, res) => {
  try {
    const solicitud = await Solicitud.findById(req.params.id)
    if (!solicitud) {
      return res.status(404).json({ mensaje: 'Solicitud no encontrada' })
    }
    if (solicitud.estado !== 'aprobada') {
      return res
        .status(400)
        .json({ mensaje: 'Solo puedes darte de baja de un curso aprobado' })
    }

    solicitud.estado = 'baja_pendiente'
    solicitud.motivoBaja = req.body.motivo || ''
    await solicitud.save()

    res.json(solicitud)
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al solicitar la baja', error: error.message })
  }
}

// PUT /api/solicitudes/:id/estado  -> { estado: 'aprobada' | 'rechazada' | 'baja' | 'pendiente' }
export const updateEstadoSolicitud = async (req, res) => {
  try {
    const { estado } = req.body

    if (!['pendiente', 'aprobada', 'rechazada', 'baja'].includes(estado)) {
      return res.status(400).json({ mensaje: 'Estado no válido' })
    }

    const solicitud = await Solicitud.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    )

    if (!solicitud) {
      return res.status(404).json({ mensaje: 'Solicitud no encontrada' })
    }

    res.json(solicitud)
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar la solicitud', error: error.message })
  }
}

// GET /api/solicitudes/resumen  -> conteos por curso (aprobadas, pendientes, total)
export const getResumenSolicitudes = async (req, res) => {
  try {
    const resumen = await Solicitud.aggregate([
      {
        $group: {
          _id: '$cursoNombre',
          aprobadas: { $sum: { $cond: [{ $eq: ['$estado', 'aprobada'] }, 1, 0] } },
          pendientes: { $sum: { $cond: [{ $eq: ['$estado', 'pendiente'] }, 1, 0] } },
          rechazadas: { $sum: { $cond: [{ $eq: ['$estado', 'rechazada'] }, 1, 0] } },
          total: { $sum: 1 },
        },
      },
    ])

    res.json(
      resumen.map((r) => ({
        cursoNombre: r._id,
        aprobadas: r.aprobadas,
        pendientes: r.pendientes,
        rechazadas: r.rechazadas,
        total: r.total,
      }))
    )
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el resumen', error: error.message })
  }
}
