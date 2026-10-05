import Entrega from '../models/Entrega.js'
import Trabajo from '../models/Trabajo.js'
import Aprendiz from '../models/Aprendiz.js'

// GET /api/entregas?trabajo=<id>&aprendiz=<cedula>
export const getEntregas = async (req, res) => {
  try {
    const filtro = {}
    if (req.query.trabajo) filtro.trabajo = req.query.trabajo
    if (req.query.aprendiz) filtro.aprendiz = req.query.aprendiz

    const entregas = await Entrega.find(filtro).populate('trabajo').populate('aprendiz')
    res.json(entregas)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener las entregas', error: error.message })
  }
}

// GET /api/entregas/:id
export const getEntrega = async (req, res) => {
  try {
    const entrega = await Entrega.findById(req.params.id).populate('trabajo').populate('aprendiz')
    if (!entrega) {
      return res.status(404).json({ mensaje: 'Entrega no encontrada' })
    }
    res.json(entrega)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener la entrega', error: error.message })
  }
}

// POST /api/entregas
export const createEntrega = async (req, res) => {
  try {
    const { trabajo, aprendiz } = req.body

    if (!trabajo || !aprendiz) {
      return res.status(400).json({ mensaje: 'Se requiere trabajo y aprendiz' })
    }

    const trabajoExiste = await Trabajo.findById(trabajo)
    if (!trabajoExiste) {
      return res.status(400).json({ mensaje: 'El trabajo indicado no existe' })
    }

    const aprendizExiste = await Aprendiz.findById(aprendiz)
    if (!aprendizExiste) {
      return res.status(400).json({ mensaje: 'El aprendiz indicado no existe' })
    }

    const nuevaEntrega = new Entrega({ trabajo, aprendiz })
    await nuevaEntrega.save()

    res.status(201).json(nuevaEntrega)
  } catch (error) {
    // Si el aprendiz ya entregó, el índice único devuelve un error de duplicado
    if (error.code === 11000) {
      return res.status(409).json({ mensaje: 'El aprendiz ya entregó este trabajo' })
    }
    res.status(400).json({ mensaje: 'Error al crear la entrega', error: error.message })
  }
}

// DELETE /api/entregas/:id
export const deleteEntrega = async (req, res) => {
  try {
    const entrega = await Entrega.findByIdAndDelete(req.params.id)
    if (!entrega) {
      return res.status(404).json({ mensaje: 'Entrega no encontrada' })
    }
    res.json({ mensaje: 'Entrega eliminada', entrega })
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar la entrega', error: error.message })
  }
}
