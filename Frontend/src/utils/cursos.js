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
