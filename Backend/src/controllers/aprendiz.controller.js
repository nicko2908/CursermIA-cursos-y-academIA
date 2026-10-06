import Aprendiz from '../models/Aprendiz.js'
import Curso from '../models/Curso.js'
import Trabajo from '../models/Trabajo.js'
import Entrega from '../models/Entrega.js'
import Solicitud from '../models/Solicitud.js'

// ===== CRUD de aprendices =====

// GET /api/aprendices
export const getAprendices = async (req, res) => {
  try {
    const aprendices = await Aprendiz.find().populate('cursos')
    res.json(aprendices)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los aprendices', error: error.message })
  }
}

// GET /api/aprendices/:id   (id = cédula)
export const getAprendiz = async (req, res) => {
  try {
    const aprendiz = await Aprendiz.findById(req.params.id).populate('cursos')
    if (!aprendiz) {
      return res.status(404).json({ mensaje: 'Aprendiz no encontrado' })
    }
    res.json(aprendiz)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el aprendiz', error: error.message })
  }
}

// POST /api/aprendices
export const createAprendiz = async (req, res) => {
  try {
    const { _id, cursos } = req.body

    // Si se envían cursos, validamos que existan
    if (cursos && cursos.length) {
      const existen = await Curso.countDocuments({ _id: { $in: cursos } })
      if (existen !== cursos.length) {
        return res.status(400).json({ mensaje: 'Uno o más cursos indicados no existen' })
      }
    }

    const nuevoAprendiz = new Aprendiz({ ...req.body, _id })
    await nuevoAprendiz.save()

    res.status(201).json(nuevoAprendiz)
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear el aprendiz', error: error.message })
  }
}

// PUT /api/aprendices/:id
export const updateAprendiz = async (req, res) => {
  try {
    // No permitimos cambiar la cédula (el _id)
    delete req.body._id

    const aprendiz = await Aprendiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('cursos')

    if (!aprendiz) {
      return res.status(404).json({ mensaje: 'Aprendiz no encontrado' })
    }

    res.json(aprendiz)
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar el aprendiz', error: error.message })
  }
}

// DELETE /api/aprendices/:id
export const deleteAprendiz = async (req, res) => {
  try {
    const aprendiz = await Aprendiz.findByIdAndDelete(req.params.id)
    if (!aprendiz) {
      return res.status(404).json({ mensaje: 'Aprendiz no encontrado' })
    }
    res.json({ mensaje: 'Aprendiz eliminado', aprendiz })
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el aprendiz', error: error.message })
  }
}

// ===== Login (educativo): registrar si no existe y entrar =====

// POST /api/aprendices/login
export const loginAprendiz = async (req, res) => {
  try {
    const { _id, nombre, apellido, correo, contrasena } = req.body

    let aprendiz = await Aprendiz.findById(_id)

    if (aprendiz) {
      return res.json({ aprendiz, creado: false })
    }

    // No existe: lo registramos y entra
    aprendiz = new Aprendiz({ _id, nombre, apellido, correo, contrasena })
    await aprendiz.save()

    res.status(201).json({ aprendiz, creado: true })
  } catch (error) {
    res.status(400).json({ mensaje: 'Error en el login', error: error.message })
  }
}

// ===== Dashboard del aprendiz =====

// GET /api/aprendices/:cedula/tareas
// Tareas de los cursos en los que está inscrito (solicitudes aprobadas), con su estado de entrega.
export const getTareasAprendiz = async (req, res) => {
  try {
    const cedula = req.params.id

    // Cursos aprobados del aprendiz (una baja pendiente sigue contando como inscrito)
    const solicitudes = await Solicitud.find({
      aprendizCedula: cedula,
      estado: { $in: ['aprobada', 'baja_pendiente'] },
    })
    const cursos = solicitudes.map((s) => s.cursoNombre)

    // Trabajos de esos cursos
    const trabajos = await Trabajo.find({ cursoNombre: { $in: cursos } }).sort({ fechaLimite: 1 })

    // Entregas del aprendiz (por trabajo)
    const entregas = await Entrega.find({ aprendiz: cedula })
    const mapa = {}
    for (const e of entregas) mapa[String(e.trabajo)] = e

    const resultado = trabajos.map((t) => {
      const entrega = mapa[String(t._id)] || null
      return {
        ...t.toObject(),
        entregado: !!entrega,
        entrega,
      }
    })

    res.json(resultado)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener las tareas', error: error.message })
  }
}

// GET /api/aprendices/:id/dashboard
// Devuelve los cursos a los que pertenece y los trabajos que debe (con estado).
export const getDashboardAprendiz = async (req, res) => {
  try {
    const aprendiz = await Aprendiz.findById(req.params.id).populate('cursos')
    if (!aprendiz) {
      return res.status(404).json({ mensaje: 'Aprendiz no encontrado' })
    }

    const cursosIds = aprendiz.cursos.map((c) => c._id)

    // Trabajos de todos los cursos del aprendiz
    const trabajos = await Trabajo.find({ curso: { $in: cursosIds } }).populate('curso')

    // Entregas que ya hizo este aprendiz
    const entregas = await Entrega.find({ aprendiz: req.params.id })
    const entregados = new Set(entregas.map((e) => e.trabajo.toString()))

    const trabajosConEstado = trabajos.map((t) => ({
      ...t.toObject(),
      entregado: entregados.has(t._id.toString()),
    }))

    res.json({
      aprendiz,
      cursos: aprendiz.cursos,
      trabajos: trabajosConEstado,
    })
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el dashboard', error: error.message })
  }
}
