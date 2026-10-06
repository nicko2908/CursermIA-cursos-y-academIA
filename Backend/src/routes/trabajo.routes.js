import { Router } from 'express'
import {
  getTrabajos,
  getTrabajosPorDocente,
  getTrabajo,
  createTrabajo,
  updateTrabajo,
  deleteTrabajo,
} from '../controllers/trabajo.controller.js'

const router = Router()

router.get('/', getTrabajos)
// Ruta especial antes de /:id para evitar conflictos
router.get('/docente/:nombre', getTrabajosPorDocente)
router.get('/:id', getTrabajo)
router.post('/', createTrabajo)
router.put('/:id', updateTrabajo)
router.delete('/:id', deleteTrabajo)

export default router
