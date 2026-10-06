// Carga todas las imágenes de src/assets y las expone por palabra clave.
// Así evitamos problemas con rutas exactas (tildes, mayúsculas, etc.).
const modulos = import.meta.glob('../assets/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
})

function buscar(contiene) {
  const clave = Object.keys(modulos).find((k) =>
    k.toLowerCase().includes(contiene.toLowerCase())
  )
  return clave ? modulos[clave] : null
}

export const imagenes = {
  jovenes: buscar('jovenesestudiando'),
  profesor: buscar('profesordictando'),
  mecanica: buscar('clasemecanica'),
  analisis: buscar('analisisdedatos'),
  fullstack: buscar('fullstack'),
  grupo: buscar('presentaci'), // "presentaciónGrupo"
}
