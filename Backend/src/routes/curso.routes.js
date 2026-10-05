import { Router } from 'express'
import {
  getCursos,
  getCurso,
  createCurso,
  updateCurso,
  deleteCurso,
} from '../controllers/curso.controller.js'

const router = Router()

router.get('/', getCursos)
router.get('/:id', getCurso)
router.post('/', createCurso)
router.put('/:id', updateCurso)
router.delete('/:id', deleteCurso)

export default router
