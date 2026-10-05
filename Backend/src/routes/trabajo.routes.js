import { Router } from 'express'
import {
  getTrabajos,
  getTrabajo,
  createTrabajo,
  updateTrabajo,
  deleteTrabajo,
} from '../controllers/trabajo.controller.js'

const router = Router()

router.get('/', getTrabajos)
router.get('/:id', getTrabajo)
router.post('/', createTrabajo)
router.put('/:id', updateTrabajo)
router.delete('/:id', deleteTrabajo)

export default router
