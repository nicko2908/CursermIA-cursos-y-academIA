import MainPage from "../views/MainPage.vue"
import LoginAlumno from "../views/LoginAlumno.vue"
import LoginDocente from "../views/LoginDocente.vue"
import MainPageAlumno from "../views/MainPageAlumno.vue"
import MainPageDocente from "../views/MainPageDocente.vue"
import { createRouter, createWebHashHistory } from "vue-router"

const routes = [
    {path:"/", component:MainPage},
    {path:"/login/alumno", component:LoginAlumno},
    {path:"/login/docente", component:LoginDocente},
    {path:"/dashboard/alumno", component:MainPageAlumno},
    {path:"/dashboard/docente", component:MainPageDocente}
]

export const router = createRouter({
    routes,
    history:createWebHashHistory()
})