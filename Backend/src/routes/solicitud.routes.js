import { Router } from 'express'
import {
  createSolicitud,
  getSolicitudes,
  getSolicitudesAprendiz,
  getSolicitudesDocente,
  updateEstadoSolicitud,
  getResumenSolicitudes,
} from '../controllers/solicitud.controller.js'

const router = Router()

router.post('/', createSolicitud)
router.get('/', getSolicitudes)
router.get('/resumen', getResumenSolicitudes)
router.get('/aprendiz/:cedula', getSolicitudesAprendiz)
router.get('/docente/:nombre', getSolicitudesDocente)
router.put('/:id/estado', updateEstadoSolicitud)

export default router
