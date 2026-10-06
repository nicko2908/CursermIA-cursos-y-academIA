// Se importa el modelo Aprendiz para que quede registrado en Mongoose
// y el virtual `cantidadEstudiantes` del modelo Curso pueda resolverlo.
import Aprendiz from '../models/Aprendiz.js'
import Curso from '../models/Curso.js'

// ===== Helpers de validación de horario =====
function aMinutos(hora) {
  const [h, m] = String(hora || '').split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

function bloquesSolapan(a, b) {
  if (Number(a.dia) !== Number(b.dia)) return false
  return (
    aMinutos(a.horaInicio) < aMinutos(b.horaFin) &&
    aMinutos(b.horaInicio) < aMinutos(a.horaFin)
  )
}

// Valida los datos de un curso. Devuelve un mensaje de error o null.
// `idExcluir` sirve para ignorar el propio curso al editar (choque de horario).
async function validarCurso(datos, idExcluir = null) {
  const { docente, cupos, fechaInicio, fechaFin, horario = [] } = datos

  const cuposNum = Number(cupos)
  if (!cuposNum || cuposNum < 1 || cuposNum > 45) {
    return 'Los cupos deben ser un número entre 1 y 45'
  }

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const minInicio = new Date(hoy)
  minInicio.setDate(minInicio.getDate() + 20)

  const inicio = new Date(fechaInicio)
  if (Number.isNaN(inicio.getTime())) {
    return 'La fecha de inicio no es válida'
  }
  // La regla de "+20 días" solo aplica al crear (al editar no se bloquea).
  if (!idExcluir && inicio < minInicio) {
    return 'La fecha de inicio debe ser al menos 20 días después de hoy'
  }

  const fin = new Date(fechaFin)
  if (Number.isNaN(fin.getTime()) || fin <= inicio) {
    return 'La fecha de finalización debe ser posterior a la de inicio'
  }

  if (!Array.isArray(horario) || horario.length === 0) {
    return 'Debes definir al menos un bloque de horario'
  }
  for (const b of horario) {
    if (!(Number(b.dia) >= 1 && Number(b.dia) <= 5)) {
      return 'El horario debe ser de lunes a viernes'
    }
    if (
      aMinutos(b.horaInicio) < 7 * 60 ||
      aMinutos(b.horaFin) > 22 * 60 ||
      aMinutos(b.horaInicio) >= aMinutos(b.horaFin)
    ) {
      return 'El horario debe estar entre 7:00 y 22:00'
    }
  }
  for (let i = 0; i < horario.length; i++) {
    for (let j = i + 1; j < horario.length; j++) {
      if (bloquesSolapan(horario[i], horario[j])) {
        return 'Hay bloques de horario que se cruzan entre sí'
      }
    }
  }

  if (docente) {
    const filtro = { docente }
    if (idExcluir) filtro._id = { $ne: idExcluir }
    const otros = await Curso.find(filtro)
    for (const c of otros) {
      for (const a of horario) {
        for (const b of c.horario || []) {
          if (bloquesSolapan(a, b)) {
            return `El horario choca con el curso "${c.nombre}" de ${docente}`
          }
        }
      }
    }
  }

  return null
}

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
    const error = await validarCurso(req.body)
    if (error) {
      return res.status(400).json({ mensaje: error })
    }

    const { nombre, modalidad, docente, cupos, fechaInicio, fechaFin, horario, nivel, edadMinima } = req.body
    const nuevoCurso = new Curso({
      nombre,
      modalidad,
      docente,
      cupos: Number(cupos),
      fechaInicio,
      fechaFin,
      horario,
      nivel,
      edadMinima,
    })
    await nuevoCurso.save()

    res.status(201).json(nuevoCurso)
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear el curso', error: error.message })
  }
}

// PUT /api/cursos/:id
export const updateCurso = async (req, res) => {
  try {
    const curso = await Curso.findById(req.params.id)
    if (!curso) {
      return res.status(404).json({ mensaje: 'Curso no encontrado' })
    }

    const datos = {
      nombre: req.body.nombre ?? curso.nombre,
      modalidad: req.body.modalidad ?? curso.modalidad,
      docente: req.body.docente ?? curso.docente,
      cupos: req.body.cupos ?? curso.cupos,
      fechaInicio: req.body.fechaInicio ?? curso.fechaInicio,
      fechaFin: req.body.fechaFin ?? curso.fechaFin,
      horario: req.body.horario ?? curso.horario,
      nivel: req.body.nivel ?? curso.nivel,
      edadMinima: req.body.edadMinima ?? curso.edadMinima,
    }

    const error = await validarCurso(datos, req.params.id)
    if (error) {
      return res.status(400).json({ mensaje: error })
    }

    Object.assign(curso, datos)
    await curso.save()

    res.json(curso)
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar el curso', error: error.message })
  }
}

// PUT /api/cursos/:id/activo  -> { activo: true|false }
export const setActivoCurso = async (req, res) => {
  try {
    const activo = req.body.activo === true || req.body.activo === 'true'
    const curso = await Curso.findByIdAndUpdate(req.params.id, { activo }, { new: true })
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
