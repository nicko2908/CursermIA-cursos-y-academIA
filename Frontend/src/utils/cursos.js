// Utilidades de color para los cursos (color determinista según el nombre)

const COLORES = [
  '#2064e3',
  '#0ea5a5',
  '#7c3aed',
  '#e36414',
  '#c2255c',
  '#2f9e44',
]

export function hashTexto(texto) {
  const s = String(texto)
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export function colorCurso(nombre) {
  return COLORES[hashTexto(nombre) % COLORES.length]
}

// Edad en años a partir de una fecha de nacimiento (o null si no hay fecha)
export function edadDesde(fechaNacimiento) {
  if (!fechaNacimiento) return null
  const n = new Date(fechaNacimiento)
  if (Number.isNaN(n.getTime())) return null
  const hoy = new Date()
  let edad = hoy.getFullYear() - n.getFullYear()
  const m = hoy.getMonth() - n.getMonth()
  if (m < 0 || (m === 0 && hoy.getDate() < n.getDate())) edad--
  return edad
}

// Nivel que se exige como prerrequisito según el nivel del curso
export function nivelRequerido(nivel) {
  if (nivel === 'Intermedio') return 'Básico'
  if (nivel === 'Alto') return 'Intermedio'
  return null
}

// Promedio general de un curso (0–100), determinista a partir del nombre y el total de estudiantes
export function promedioCurso(nombreCurso, totalEstudiantes) {
  const n = Math.max(1, Number(totalEstudiantes) || 0)
  let suma = 0
  for (let i = 0; i < n; i++) {
    suma += 55 + (hashTexto(`${nombreCurso}-est-${i}`) % 46) // 55..100
  }
  return Math.round(suma / n)
}
