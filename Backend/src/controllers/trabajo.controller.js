import Trabajo from '../models/Trabajo.js'
import Curso from '../models/Curso.js'

// GET /api/trabajos?curso=<idCurso>
export const getTrabajos = async (req, res) => {
  try {
    const filtro = {}
    if (req.query.curso) {
      filtro.curso = req.query.curso
    }
    const trabajos = await Trabajo.find(filtro).populate('curso')
    res.json(trabajos)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los trabajos', error: error.message })
  }
}

// GET /api/trabajos/:id
export const getTrabajo = async (req, res) => {
  try {
    const trabajo = await Trabajo.findById(req.params.id).populate('curso')
    if (!trabajo) {
      return res.status(404).json({ mensaje: 'Trabajo no encontrado' })
    }
    res.json(trabajo)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el trabajo', error: error.message })
  }
}

// POST /api/trabajos
export const createTrabajo = async (req, res) => {
  try {
    const { curso } = req.body

    if (!curso) {
      return res.status(400).json({ mensaje: 'El trabajo debe pertenecer a un curso' })
    }

    const cursoExiste = await Curso.findById(curso)
    if (!cursoExiste) {
      return res.status(400).json({ mensaje: 'El curso indicado no existe' })
    }

    const nuevoTrabajo = new Trabajo(req.body)
    await nuevoTrabajo.save()

    res.status(201).json(nuevoTrabajo)
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear el trabajo', error: error.message })
  }
}

// PUT /api/trabajos/:id
export const updateTrabajo = async (req, res) => {
  try {
    delete req.body._id

    const trabajo = await Trabajo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('curso')

    if (!trabajo) {
      return res.status(404).json({ mensaje: 'Trabajo no encontrado' })
    }

    res.json(trabajo)
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar el trabajo', error: error.message })
  }
}

// DELETE /api/trabajos/:id
export const deleteTrabajo = async (req, res) => {
  try {
    const trabajo = await Trabajo.findByIdAndDelete(req.params.id)
    if (!trabajo) {
      return res.status(404).json({ mensaje: 'Trabajo no encontrado' })
    }
    res.json({ mensaje: 'Trabajo eliminado', trabajo })
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el trabajo', error: error.message })
  }
}
