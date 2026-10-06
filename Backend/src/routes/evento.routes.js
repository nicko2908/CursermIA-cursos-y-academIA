import { Router } from 'express'
import {
  createEvento,
  getEventosDocente,
  getEventosAprendiz,
  deleteEvento,
} from '../controllers/evento.controller.js'

const router = Router()

router.post('/', createEvento)
router.get('/docente/:nombre', getEventosDocente)
router.get('/aprendiz/:cedula', getEventosAprendiz)
router.delete('/:id', deleteEvento)

export default router
