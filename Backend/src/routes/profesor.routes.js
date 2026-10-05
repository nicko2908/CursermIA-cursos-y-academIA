import { Router } from 'express'
import {
  getProfesores,
  getProfesor,
  createProfesor,
  updateProfesor,
  deleteProfesor,
  loginProfesor,
  getTrabajosProfesor,
} from '../controllers/profesor.controller.js'

const router = Router()

// Rutas especiales (antes de /:id para evitar conflictos)
router.post('/login', loginProfesor)
router.get('/:id/trabajos', getTrabajosProfesor)

// CRUD
router.get('/', getProfesores)
router.get('/:id', getProfesor)
router.post('/', createProfesor)
router.put('/:id', updateProfesor)
router.delete('/:id', deleteProfesor)

export default router
