import MainPage from "../views/MainPage.vue"
import CursosView from "../views/CursosView.vue"
import FaqsView from "../views/FaqsView.vue"
import LoginAlumno from "../views/LoginAlumno.vue"
import LoginDocente from "../views/LoginDocente.vue"
import RegistroAprendiz from "../views/RegistroAprendiz.vue"
import MainPageAlumno from "../views/MainPageAlumno.vue"
import AlumnoMisCursos from "../views/AlumnoMisCursos.vue"
import AlumnoMisTareas from "../views/AlumnoMisTareas.vue"
import AlumnoMisCalificaciones from "../views/AlumnoMisCalificaciones.vue"
import AlumnoCronograma from "../views/AlumnoCronograma.vue"
import AlumnoCursos from "../views/AlumnoCursos.vue"
import AlumnoCursoDetalle from "../views/AlumnoCursoDetalle.vue"
import MainPageDocente from "../views/MainPageDocente.vue"
import DocenteMisCursos from "../views/DocenteMisCursos.vue"
import DocenteTrabajos from "../views/DocenteTrabajos.vue"
import DocenteCronograma from "../views/DocenteCronograma.vue"
import DocenteSolicitudes from "../views/DocenteSolicitudes.vue"
import DocenteCursoDetalle from "../views/DocenteCursoDetalle.vue"
import LoginCoordinador from "../views/LoginCoordinador.vue"
import MainPageCoordinador from "../views/MainPageCoordinador.vue"
import CoordinadorCursosActivos from "../views/CoordinadorCursosActivos.vue"
import CoordinadorCursoDetalle from "../views/CoordinadorCursoDetalle.vue"
import CoordinadorEstudiantes from "../views/CoordinadorEstudiantes.vue"
import { createRouter, createWebHashHistory } from "vue-router"

const routes = [
    {path:"/", component:MainPage},
    {path:"/cursos", component:CursosView},
    {path:"/faqs", component:FaqsView},
    {path:"/login/alumno", component:LoginAlumno},
    {path:"/login/docente", component:LoginDocente},
    {path:"/registro/alumno", component:RegistroAprendiz},
    {path:"/login/coordinador", component:LoginCoordinador},
    {
        path:"/dashboard/alumno",
        component:MainPageAlumno,
        children:[
            {path:"", component:AlumnoMisCursos},
            {path:"tareas", component:AlumnoMisTareas},
            {path:"cronograma", component:AlumnoCronograma},
            {path:"calificaciones", component:AlumnoMisCalificaciones},
            {path:"cursos", component:AlumnoCursos},
            {path:"curso/:nombre", component:AlumnoCursoDetalle}
        ]
    },
    {
        path:"/dashboard/docente",
        component:MainPageDocente,
        children:[
            {path:"", component:DocenteMisCursos},
            {path:"trabajos", component:DocenteTrabajos},
            {path:"cronograma", component:DocenteCronograma},
            {path:"solicitudes", component:DocenteSolicitudes},
            {path:"curso/:nombre", component:DocenteCursoDetalle}
        ]
    },
    {
        path:"/dashboard/coordinador",
        component:MainPageCoordinador,
        children:[
            {path:"", component:CoordinadorCursosActivos},
            {path:"curso/:id", component:CoordinadorCursoDetalle},
            {path:"estudiantes", component:CoordinadorEstudiantes}
        ]
    }
]

export const router = createRouter({
    routes,
    history:createWebHashHistory()
})
