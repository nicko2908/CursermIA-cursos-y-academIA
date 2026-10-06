import Evento from '../models/Evento.js'
import Solicitud from '../models/Solicitud.js'

// POST /api/eventos
export const createEvento = async (req, res) => {
  try {
    const evento = new Evento(req.body)
    await evento.save()
    res.status(201).json(evento)
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear el evento', error: error.message })
  }
}

// GET /api/eventos/docente/:nombre
export const getEventosDocente = async (req, res) => {
  try {
    const eventos = await Evento.find({ docenteNombre: req.params.nombre }).sort({ fecha: 1 })
    res.json(eventos)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los eventos', error: error.message })
  }
}

// GET /api/eventos/aprendiz/:cedula  -> eventos de los cursos en los que está inscrito
export const getEventosAprendiz = async (req, res) => {
  try {
    const solicitudes = await Solicitud.find({
      aprendizCedula: req.params.cedula,
      estado: { $in: ['aprobada', 'baja_pendiente'] },
    })
    const cursos = solicitudes.map((s) => s.cursoNombre)
    const eventos = await Evento.find({ cursoNombre: { $in: cursos } }).sort({ fecha: 1 })
    res.json(eventos)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los eventos', error: error.message })
  }
}

// DELETE /api/eventos/:id
export const deleteEvento = async (req, res) => {
  try {
    const evento = await Evento.findByIdAndDelete(req.params.id)
    if (!evento) {
      return res.status(404).json({ mensaje: 'Evento no encontrado' })
    }
    res.json({ mensaje: 'Evento eliminado', evento })
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el evento', error: error.message })
  }
}
