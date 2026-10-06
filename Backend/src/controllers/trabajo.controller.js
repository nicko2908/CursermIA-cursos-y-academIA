import Trabajo from '../models/Trabajo.js'
import Curso from '../models/Curso.js'
import Entrega from '../models/Entrega.js'

// GET /api/trabajos?curso=<id>&cursoNombre=<nombre>&docenteNombre=<nombre>
export const getTrabajos = async (req, res) => {
  try {
    const filtro = {}
    if (req.query.curso) filtro.curso = req.query.curso
    if (req.query.cursoNombre) filtro.cursoNombre = req.query.cursoNombre
    if (req.query.docenteNombre) filtro.docenteNombre = req.query.docenteNombre

    const trabajos = await Trabajo.find(filtro).populate('curso')
    res.json(trabajos)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los trabajos', error: error.message })
  }
}

// GET /api/trabajos/docente/:nombre  -> trabajos del docente + entregas
export const getTrabajosPorDocente = async (req, res) => {
  try {
    const trabajos = await Trabajo.find({ docenteNombre: req.params.nombre }).sort({
      createdAt: -1,
    })

    const conEntregas = await Promise.all(
      trabajos.map(async (t) => {
        const entregas = await Entrega.find({ trabajo: t._id }).populate('aprendiz')
        return {
          ...t.toObject(),
          entregas,
          cantidadEntregas: entregas.length,
        }
      })
    )

    res.json(conEntregas)
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
// Opción simple: el curso se identifica por `cursoNombre` (texto). Si llega
// `curso` (ObjectId) se valida que exista.
export const createTrabajo = async (req, res) => {
  try {
    const { curso, cursoNombre } = req.body

    if (curso) {
      const cursoExiste = await Curso.findById(curso)
      if (!cursoExiste) {
        return res.status(400).json({ mensaje: 'El curso indicado no existe' })
      }
    } else if (!cursoNombre) {
      return res.status(400).json({ mensaje: 'Indica el curso (cursoNombre)' })
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
