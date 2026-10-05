// Se importa el modelo Aprendiz para que quede registrado en Mongoose
// y el virtual `cantidadEstudiantes` del modelo Curso pueda resolverlo.
import Aprendiz from '../models/Aprendiz.js'
import Curso from '../models/Curso.js'

// GET /api/cursos  -> incluye el campo `cantidadEstudiantes`
export const getCursos = async (req, res) => {
  try {
    const cursos = await Curso.find().populate('cantidadEstudiantes')
    res.json(cursos)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los cursos', error: error.message })
  }
}

// GET /api/cursos/:id
export const getCurso = async (req, res) => {
  try {
    const curso = await Curso.findById(req.params.id).populate('cantidadEstudiantes')
    if (!curso) {
      return res.status(404).json({ mensaje: 'Curso no encontrado' })
    }
    res.json(curso)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el curso', error: error.message })
  }
}

// POST /api/cursos
export const createCurso = async (req, res) => {
  try {
    // El _id lo genera MongoDB automáticamente, así que lo ignoramos si llega
    const { _id, ...datos } = req.body

    const nuevoCurso = new Curso(datos)
    await nuevoCurso.save()

    res.status(201).json(nuevoCurso)
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear el curso', error: error.message })
  }
}

// PUT /api/cursos/:id
export const updateCurso = async (req, res) => {
  try {
    delete req.body._id

    const curso = await Curso.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    if (!curso) {
      return res.status(404).json({ mensaje: 'Curso no encontrado' })
    }

    res.json(curso)
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar el curso', error: error.message })
  }
}

// DELETE /api/cursos/:id
export const deleteCurso = async (req, res) => {
  try {
    const curso = await Curso.findByIdAndDelete(req.params.id)
    if (!curso) {
      return res.status(404).json({ mensaje: 'Curso no encontrado' })
    }
    res.json({ mensaje: 'Curso eliminado', curso })
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el curso', error: error.message })
  }
}
