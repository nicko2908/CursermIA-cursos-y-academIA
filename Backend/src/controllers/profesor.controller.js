import Profesor from '../models/Profesor.js'
import Curso from '../models/Curso.js'
import Trabajo from '../models/Trabajo.js'
import Entrega from '../models/Entrega.js'

// ===== CRUD de profesores =====

// GET /api/profesores
export const getProfesores = async (req, res) => {
  try {
    const profesores = await Profesor.find().populate('cursos')
    res.json(profesores)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los profesores', error: error.message })
  }
}

// GET /api/profesores/:id   (id = cédula)
export const getProfesor = async (req, res) => {
  try {
    const profesor = await Profesor.findById(req.params.id).populate('cursos')
    if (!profesor) {
      return res.status(404).json({ mensaje: 'Profesor no encontrado' })
    }
    res.json(profesor)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el profesor', error: error.message })
  }
}

// POST /api/profesores
export const createProfesor = async (req, res) => {
  try {
    const { _id, cursos } = req.body

    if (cursos && cursos.length) {
      const existen = await Curso.countDocuments({ _id: { $in: cursos } })
      if (existen !== cursos.length) {
        return res.status(400).json({ mensaje: 'Uno o más cursos indicados no existen' })
      }
    }

    const nuevoProfesor = new Profesor({ ...req.body, _id })
    await nuevoProfesor.save()

    res.status(201).json(nuevoProfesor)
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear el profesor', error: error.message })
  }
}

// PUT /api/profesores/:id
export const updateProfesor = async (req, res) => {
  try {
    delete req.body._id

    const profesor = await Profesor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('cursos')

    if (!profesor) {
      return res.status(404).json({ mensaje: 'Profesor no encontrado' })
    }

    res.json(profesor)
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar el profesor', error: error.message })
  }
}

// DELETE /api/profesores/:id
export const deleteProfesor = async (req, res) => {
  try {
    const profesor = await Profesor.findByIdAndDelete(req.params.id)
    if (!profesor) {
      return res.status(404).json({ mensaje: 'Profesor no encontrado' })
    }
    res.json({ mensaje: 'Profesor eliminado', profesor })
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el profesor', error: error.message })
  }
}

// ===== Login (educativo): registrar si no existe y entrar =====

// POST /api/profesores/login
export const loginProfesor = async (req, res) => {
  try {
    const { _id, nombre, apellido, correo, contrasena } = req.body

    let profesor = await Profesor.findById(_id)

    if (profesor) {
      return res.json({ profesor, creado: false })
    }

    profesor = new Profesor({ _id, nombre, apellido, correo, contrasena })
    await profesor.save()

    res.status(201).json({ profesor, creado: true })
  } catch (error) {
    res.status(400).json({ mensaje: 'Error en el login', error: error.message })
  }
}

// ===== Trabajos asignados por el profesor =====

// GET /api/profesores/:id/trabajos
// Devuelve los trabajos de los cursos que dicta el profesor,
// junto con las entregas (quiénes han entregado).
export const getTrabajosProfesor = async (req, res) => {
  try {
    const profesor = await Profesor.findById(req.params.id)
    if (!profesor) {
      return res.status(404).json({ mensaje: 'Profesor no encontrado' })
    }

    const cursosIds = profesor.cursos

    const trabajos = await Trabajo.find({ curso: { $in: cursosIds } }).populate('curso')

    const trabajosConEntregas = await Promise.all(
      trabajos.map(async (t) => {
        const entregas = await Entrega.find({ trabajo: t._id }).populate('aprendiz')
        return {
          ...t.toObject(),
          entregas,
          cantidadEntregas: entregas.length,
        }
      })
    )

    res.json(trabajosConEntregas)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los trabajos', error: error.message })
  }
}
