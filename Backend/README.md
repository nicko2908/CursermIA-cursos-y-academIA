# Backend CursemIA

API REST del proyecto **CursemIA** (gestión de cursos). Está construida con la
arquitectura **MVC** (Modelo - Controlador; la Vista la maneja el frontend por
separado), usando **Express**, **Mongoose** y **MongoDB** (MongoDB Compass).

## Estructura (MVC)

```
Backend/
├── .env                    # Variables de entorno (reemplaza los valores)
├── .env.example            # Plantilla de referencia
├── package.json
└── src/
    ├── index.js            # Punto de entrada: conecta BD y levanta el servidor
    ├── app.js              # Configuración de Express y rutas
    ├── config/
    │   └── db.js           # Conexión a MongoDB
    ├── models/             # MODELOS (M de MVC)
    │   ├── Aprendiz.js
    │   ├── Profesor.js
    │   └── Curso.js
    ├── controllers/        # CONTROLADORES (C de MVC)
    │   ├── aprendiz.controller.js
    │   ├── profesor.controller.js
    │   └── curso.controller.js
    └── routes/             # Definición de endpoints
        ├── aprendiz.routes.js
        ├── profesor.routes.js
        └── curso.routes.js
```

## Requisitos

- Node.js (versión 16 o superior)
- MongoDB instalado y corriendo (o MongoDB Atlas)
- MongoDB Compass (para visualizar la base de datos)

## Instalación y ejecución

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Configura las variables de entorno. El archivo `.env` ya está creado; solo
   reemplaza `MONGODB_URI` si tu conexión es distinta:

   ```env
   PORT=4000
   MONGODB_URI=mongodb://127.0.0.1:27017/cursemia
   ```

3. Levanta el servidor en modo desarrollo (con reinicio automático):

   ```bash
   npm run dev
   ```

   O en modo normal:

   ```bash
   npm start
   ```

El servidor quedará corriendo en `http://localhost:4000`.

## Endpoints

| Método | Ruta                 | Descripción                        |
|--------|----------------------|------------------------------------|
| GET    | `/api/aprendices`    | Listar todos los aprendices        |
| GET    | `/api/aprendices/:id`| Obtener un aprendiz por cédula     |
| POST   | `/api/aprendices`    | Crear un aprendiz                  |
| PUT    | `/api/aprendices/:id`| Actualizar un aprendiz             |
| DELETE | `/api/aprendices/:id`| Eliminar un aprendiz               |
| GET    | `/api/profesores`    | Listar todos los profesores        |
| GET    | `/api/profesores/:id`| Obtener un profesor por cédula     |
| POST   | `/api/profesores`    | Crear un profesor                  |
| PUT    | `/api/profesores/:id`| Actualizar un profesor             |
| DELETE | `/api/profesores/:id`| Eliminar un profesor               |
| GET    | `/api/cursos`        | Listar cursos (con conteo de alumnos) |
| GET    | `/api/cursos/:id`    | Obtener un curso                   |
| POST   | `/api/cursos`        | Crear un curso                     |
| PUT    | `/api/cursos/:id`    | Actualizar un curso                |
| DELETE | `/api/cursos/:id`    | Eliminar un curso                  |

## Modelos de datos

### Aprendiz
- `_id` (String): la **cédula** actúa como ID.
- `nombre`, `apellido`, `correo`, `telefono`, `fechaNacimiento`.
- `curso` (ObjectId del Curso o `null`): confirma si pertenece a un curso. Si
  tiene valor, ese valor **es** el id del curso.

### Profesor
- `_id` (String): la **cédula** actúa como ID.
- `nombre`, `apellido`, `correo`, `telefono`, `fechaNacimiento`.

### Curso
- `_id` (autogenerado por MongoDB).
- `nombre`, `fechaInicio`, `fechaFin`.
- `modalidad`: `"virtual"` o `"presencial"`.
- `cantidadEstudiantes` (virtual): conteo automático de aprendices inscritos.
  Aparece al consultar con `GET /api/cursos`.

## Ejemplos de peticiones (JSON)

### Crear aprendiz
```json
POST /api/aprendices
{
  "_id": "1234567890",
  "nombre": "Ana",
  "apellido": "Pérez",
  "correo": "ana@correo.com",
  "telefono": "3001234567",
  "fechaNacimiento": "2005-03-15",
  "curso": "64a1f2b3c4d5e6f7a8b9c0d1"
}
```
> Si el aprendiz no pertenece a un curso, envía `"curso": null` u omite el campo.

### Crear profesor
```json
POST /api/profesores
{
  "_id": "9876543210",
  "nombre": "Luis",
  "apellido": "García",
  "correo": "luis@correo.com",
  "telefono": "3019876543",
  "fechaNacimiento": "1985-08-20"
}
```

### Crear curso
```json
POST /api/cursos
{
  "nombre": "Introducción a la Programación",
  "fechaInicio": "2026-02-01",
  "fechaFin": "2026-06-30",
  "modalidad": "virtual"
}
```

## Conexión con el frontend

El frontend (Vue 3) se conectará a esta API usando **axios** (no fetch).
El backend ya incluye **CORS** habilitado para permitir esas peticiones desde
otro puerto. La URL base del backend es `http://localhost:4000/api`.
