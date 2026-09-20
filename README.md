# EmprendeMos

EmprendeMos es una app multitenant pensada para dueños de emprendimientos y pequeños negocios que hoy organizan todo por WhatsApp, Excel o cuadernos: les da un lugar único para cargar productos, clientes, presupuestos, pedidos y cobros, sin perder tiempo en configuraciones complicadas.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase](https://supabase.com) (Postgres + Auth + Row Level Security)
- [Zod](https://zod.dev) para validación
- [React Hook Form](https://react-hook-form.com) para formularios
- [@react-pdf/renderer](https://react-pdf.org) para generar los PDF de presupuestos

## Puesta en marcha local

```bash
npm install
cp .env.example .env.local
```

Completá `.env.local` con las credenciales de tu proyecto de Supabase (ver siguiente sección) y después:

```bash
npm run dev
```

La app queda disponible en [http://localhost:3000](http://localhost:3000).

## Configurar Supabase

1. Creá un proyecto en [supabase.com](https://supabase.com).
2. En **Project Settings → API** vas a encontrar:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (nunca la expongas en el cliente)

### Aplicar las migraciones

Contra un proyecto remoto:

```bash
npx supabase link --project-ref <ref-de-tu-proyecto>
npx supabase db push
```

Para desarrollo local con Docker (Supabase local):

```bash
npx supabase start
```

Al levantar el entorno local, las migraciones en `supabase/migrations/` se aplican automáticamente.

### Cargar datos de ejemplo

`supabase/seed.sql` es una plantilla con IDs de ejemplo (placeholders), pensada sobre todo para el entorno local:

- Local: `npx supabase db reset` aplica migraciones + `seed.sql` de una sola vez.
- Remoto: `psql <connection-string> -f supabase/seed.sql` (ajustando los IDs si hace falta).

**Recomendado:** en vez de tocar `seed.sql` a mano, usá el botón **"Cargar datos de ejemplo"** que aparece en el dashboard de la app una vez que iniciaste sesión. Crea productos, clientes, presupuestos y ventas de ejemplo (todos marcados como "(ejemplo)") directamente sobre tu negocio real, respetando RLS, y podés borrarlos cuando quieras.

## Test de aislamiento multitenant (RLS)

`supabase/tests/rls_isolation.sql` verifica, contra Postgres real, que las políticas de Row Level Security de `supabase/migrations/0002_rls.sql` aíslan correctamente los datos entre negocios: un usuario solo puede leer y escribir los datos de su propio `business_id`, no puede ver los datos de otro negocio, y tampoco puede insertar ni reasignar filas hacia un `business_id` ajeno (las cláusulas `with check` lo rechazan).

Para correrlo:

```bash
npx supabase start
psql "$(npx supabase status -o json | node -e "process.stdin.once('data',d=>console.log(JSON.parse(d).DB_URL))")" \
  -f supabase/tests/rls_isolation.sql
```

(o directamente `psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f supabase/tests/rls_isolation.sql`)

Si no tenés `psql` a mano, contra un proyecto remoto ya enlazado (`npx supabase link --project-ref <ref>`) también funciona:

```bash
SUPABASE_ACCESS_TOKEN=<tu access token de supabase.com/dashboard/account/tokens> \
SUPABASE_DB_PASSWORD=<contraseña de la base> \
npx supabase db query --linked -f supabase/tests/rls_isolation.sql
```

Este test se corrió y pasó contra el proyecto de producción antes del lanzamiento inicial.

## Limpieza de datos antes de salir a producción

`supabase/scripts/` tiene dos scripts para dejar la base limpia antes de que entren usuarios reales, corridos igual que el test de arriba (`npx supabase db query --linked -f <script>`):

- `cleanup_test_data.sql` — borra puntualmente el tenant de prueba usado durante el desarrollo (negocio y usuario de QA específicos), sin tocar nada más.
- `reset_all_data.sql` — reset total: borra **todos** los negocios, perfiles y usuarios de Auth. Tiene una guarda (`select 1/0`) que hay que borrar a mano después de revisar el preview de conteos, para que no se pueda ejecutar por accidente con un `-f` descuidado.

Ninguno de los dos toca el schema, las migraciones ni las políticas de RLS — solo datos.

## Estructura del proyecto

- `app/` — rutas de Next.js (App Router): páginas, layouts, server actions expuestas por ruta.
- `components/` — componentes de UI reutilizables (`components/ui`) y de layout (`components/layout`).
- `lib/` — lógica de negocio: server actions, validaciones (Zod), clientes de Supabase, utilidades de pricing.
- `types/` — tipos compartidos, incluyendo los tipos generados del esquema de la base.
- `supabase/` — migraciones SQL, seed de datos de ejemplo y tests de RLS.

## Deploy

### Vercel

1. Conectá el repositorio en [vercel.com](https://vercel.com).
2. Configurá las 3 variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) en Project Settings → Environment Variables.
3. Deploy.

### Supabase (producción)

1. Creá un proyecto de Supabase para producción.
2. Aplicá las migraciones: `npx supabase link --project-ref <ref-prod>` y `npx supabase db push`.
3. En **Authentication → URL Configuration**, agregá la URL de producción con `/auth/callback` a las Redirect URLs permitidas.

## Alcance del MVP

Implementado:

- Autenticación y onboarding multitenant (creación de negocio + perfil)
- Productos con costeo (materiales, mano de obra, otros costos) y precio sugerido
- Gestión de clientes
- Presupuestos con ítems y exportación a PDF
- Pedidos (desde presupuesto aceptado o venta directa)
- Pagos y caja (registro de ingresos/egresos)
- Dashboard con KPIs del negocio
- Catálogo público por negocio
- Carga de datos de ejemplo

Fuera de alcance en este MVP (a propósito):

- Facturación electrónica / AFIP
- Integración real con Mercado Pago (pagos son registro manual)
- WhatsApp Business API oficial
- Integración con Instagram
- E-commerce completo (carrito, checkout online)
- Contabilidad formal
- Permisos avanzados / múltiples sucursales
- Múltiples negocios por usuario
