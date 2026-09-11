# Ya-Ya — Esqueleto del proyecto (MVP)

Red social + marketplace de servicios para emprendedores. Este repositorio contiene el
punto de partida técnico definido en la propuesta del proyecto: backend en NestJS,
frontend en Next.js, PostgreSQL y Redis, todo orquestado con Docker Compose.

Corresponde a la actividad **B1 (Configuración de entorno, arquitectura base y CI/CD)**
del cronograma.

## Estructura

```
yaya-starter/
├── backend/          # API NestJS (puerto 3001)
├── frontend/          # App Next.js (puerto 3000)
├── docker-compose.yml # Orquesta postgres, redis, backend y frontend
└── .github/workflows/ # CI: lint + build en cada Pull Request
```

## Requisitos previos

- Docker y Docker Compose instalados
- Node.js 20+ (solo si quieren correr algo fuera de Docker)

## Cómo levantar el entorno (todo el equipo debería poder hacer esto igual)

1. Cloná el repositorio.
2. Copiá los archivos de ejemplo de variables de entorno:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
3. Levantá todo con Docker Compose:
   ```bash
   docker compose up --build
   ```
4. Verificá que todo esté conectado:
   - Backend: http://localhost:3001/health → debería responder `{"status":"ok"}`
   - Frontend: http://localhost:3000 → debería mostrar el estado de conexión con el backend

## Flujo de trabajo en Git

- `main`: código estable, siempre desplegable.
- `develop`: rama de integración del equipo.
- `feature/nombre-de-la-tarea`: una rama por cada actividad del cronograma (ej.
  `feature/b3-autenticacion-rut`).

Antes de mergear una `feature/*` a `develop`, se necesita al menos una revisión (Pull
Request) de otro integrante del equipo. El CI (GitHub Actions) corre automáticamente
lint y build en cada PR.

## Próximos pasos (según el cronograma)

- **B2**: modelar el resto de las entidades (perfiles, servicios, cotizaciones, reseñas,
  suscripciones) en `backend/src/`.
- **B3**: implementar autenticación y verificación de identidad (RUT).
- **B4** en adelante: seguir el orden del Gantt.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend | NestJS + TypeORM |
| Base de datos | PostgreSQL 16 |
| Caché / colas | Redis 7 |
| Búsqueda (a integrar en B6) | Meilisearch |
| Pagos (a integrar en B12) | Mercado Pago |
