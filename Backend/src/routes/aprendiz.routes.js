import { Router } from 'express'
import {
  getAprendices,
  getAprendiz,
  createAprendiz,
  updateAprendiz,
  deleteAprendiz,
  loginAprendiz,
  getDashboardAprendiz,
} from '../controllers/aprendiz.controller.js'

const router = Router()

// Rutas especiales (antes de /:id para evitar conflictos)
router.post('/login', loginAprendiz)
router.get('/:id/dashboard', getDashboardAprendiz)

// CRUD
router.get('/', getAprendices)
router.get('/:id', getAprendiz)
router.post('/', createAprendiz)
router.put('/:id', updateAprendiz)
router.delete('/:id', deleteAprendiz)

export default router
