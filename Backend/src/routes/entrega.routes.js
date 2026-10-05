import { Router } from 'express'
import {
  getEntregas,
  getEntrega,
  createEntrega,
  deleteEntrega,
} from '../controllers/entrega.controller.js'

const router = Router()

router.get('/', getEntregas)
router.get('/:id', getEntrega)
router.post('/', createEntrega)
router.delete('/:id', deleteEntrega)

export default router
