# Kümelen — API (Backend Hono)

Versión mejorada y organizada del README para el backend de Kümelen.

Esta API está construida con TypeScript y Hono, pensada para desplegarse en Railway y ser consumida por un frontend en Next.js que vive en otro repositorio.

Índice
- [Descripción](#descripción)
- [Características principales](#características-principales)
- [Stack tecnológico](#stack-tecnológico)
- [Librerías y dependencias](#librerías-y-dependencias)
- [Arquitectura y estructura](#arquitectura-y-estructura)
- [Requisitos](#requisitos)
- [Instalación y ejecución (desarrollo)](#instalación-y-ejecución-desarrollo)
- [Variables de entorno recomendadas](#variables-de-entorno-recomendadas)
- [Endpoints relevantes (resumen)](#endpoints-relevantes-resumen)
- [Integración y despliegue en Railway](#integración-y-despliegue-en-railway)
- [Roadmap / Próximos pasos](#roadmap--próximos-pasos)
- [Contribuir](#contribuir)
- [Licencia y contacto](#licencia-y-contacto)

## Descripción

Backend de Kümelen: API REST que centraliza lógica de negocio para el catálogo de productos/servicios, POS (punto de venta), CMS básico y gestión de usuarios/roles. Está diseñada para ser modular, segura y fácil de desplegar en Railway.

## Características principales

- Autenticación y autorización (roles: admin, content_manager, pos_user, etc.).
- CRUD de catálogo (productos, terapias/servicios, categorías).
- Funcionalidad básica de POS: sesiones de caja, registro de ventas y reportes simples.
- CMS simple: páginas, bloques y referencias a media externa (Cloudflare R2 u S3).
- Integración con PostgreSQL (Prisma) y almacenamiento de objetos (R2).

## Stack tecnológico

- Lenguaje: TypeScript
- Runtime: Node.js
- Framework HTTP: Hono
- ORM: Prisma (PostgreSQL)
- Validación: Zod
- Almacenamiento de media: Cloudflare R2 

## Librerías y dependencias

Principales dependencias:
- hono, @hono/node-server
- zod, @hono/zod-validator
- pino, pino-pretty
- @prisma/client, prisma
- dotenv

Herramientas de desarrollo:
- typescript, tsx
- husky, lint-staged

## Arquitectura y estructura

Estructura actual del proyecto:

```
src/
  server.ts           # punto de entrada Hono
  config/             # env, constantes
  core/               # logger u otros core utils
  db/                 # prisma client, helpers
  middleware/         # logging, error handler
  routes/             # definición de rutas
prisma/
  schema.prisma       # modelo de datos
  generated/          # cliente Prisma (output custom del schema)
```

## Requisitos

- Node.js (versión recomendada acorde al proyecto)
- npm
- PostgreSQL local o en Railway

## Instalación y ejecución (desarrollo)

1) Clona el repo

```powershell
git clone https://github.com/demodogo/kumelen-api.git
cd kumelen-api
```

2) Instala dependencias

```powershell
npm install
```

3) Crea un archivo `.env` (usa las variables listadas más abajo)

4) Genera Prisma Client y aplica migraciones locales (desarrollo)

```powershell
npm run prisma:generate
npm run prisma:migrate
```

5) Ejecuta en modo desarrollo

```powershell
npm run dev
```

### Scripts recomendados (package.json)

Estos scripts deben existir en tu `package.json` y coinciden con la configuración actual del proyecto:

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:migrate:deploy": "prisma migrate deploy"
  }
}
```

## Variables de entorno recomendadas

Configura estas variables en un archivo `.env` o a través del panel de Railway:

```
PORT=8080
DATABASE_URL="postgresql://user:password@host:5432/kumelen_db"
JWT_SECRET="secretJwtSecure"
NODE_ENV=development

R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_ENDPOINT=
```

## Endpoints relevantes (resumen)

- Auth
  - POST /auth/login
  - POST /auth/refresh

- Users
  - GET /users
  - POST /users

- Catalog
  - GET /catalog/products
  - POST /catalog/products
  - GET /catalog/services

- POS
  - POST /pos/sessions/open
  - POST /pos/sessions/close
  - POST /pos/sales
  - GET  /pos/sales?from=&to=

- CMS
  - GET  /cms/pages/:slug
  - POST /cms/pages
  - GET  /cms/pages/:slug/blocks
  - POST /cms/pages/:slug/blocks

## Integración y despliegue en Railway

Configuración típica en Railway:

- Servicio Node.js para la API
- Servicio PostgreSQL (opcionalmente administrado por Railway)
- Variables de entorno definidas en el dashboard

Build & Start (ejemplo):
```
Build: npm install && npm run build
Start: npm run start
```

## Roadmap / Próximos pasos

- Implementar módulo Auth y gestión de roles (prioridad alta).
- Modelo y endpoints CRUD para catálogo (productos y servicios).
- Módulo POS con sesiones y registro de ventas.
- Módulo CMS para páginas y bloques, con almacenamiento en R2.
- Integraciones futuras: pagos (Webpay), agenda, mejoras en observabilidad.

## Contribuir

- Haz un fork del repositorio y crea una rama para tu aporte.
- Sigue las convenciones de código del proyecto.
- Abre un Pull Request describiendo claramente los cambios.

## Licencia y contacto

- Licencia: MIT (o la que definas para el proyecto).
- Contacto: demodogo (GitHub), email opcional.
