import Solicitud from '../models/Solicitud.js'

// POST /api/solicitudes  -> el aprendiz crea una solicitud (estado "pendiente")
export const createSolicitud = async (req, res) => {
  try {
    const { aprendizCedula, cursoNombre } = req.body

    const existente = await Solicitud.findOne({ aprendizCedula, cursoNombre })
    if (existente) {
      return res.status(409).json({
        mensaje: `Ya tienes una solicitud para "${cursoNombre}" (estado: ${existente.estado})`,
        solicitud: existente,
      })
    }

    const solicitud = new Solicitud(req.body)
    await solicitud.save()

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

// PUT /api/solicitudes/:id/estado  -> { estado: 'aprobada' | 'rechazada' | 'pendiente' }
export const updateEstadoSolicitud = async (req, res) => {
  try {
    const { estado } = req.body

    if (!['pendiente', 'aprobada', 'rechazada'].includes(estado)) {
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
