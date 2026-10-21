# Lapticon

Encargos entre viajeros, ruta piloto Bogotá → Montreal. MVP en Next.js + Supabase, en español e inglés.

## Puesta en marcha

1. **Supabase**: crea un proyecto, abre *SQL Editor*, pega `supabase/schema.sql` y ejecútalo.
2. En *Authentication > URL Configuration*, pon la URL del sitio (por ejemplo `https://lapticon.vercel.app`) y agrega `https://lapticon.vercel.app/auth/callback` a las URLs de redirección.
3. Copia `.env.example` a `.env.local` y llena los valores de *Project Settings > API*.
4. `npm install` y `npm run dev`.

## Vercel

Importa el repositorio en Vercel y agrega las mismas tres variables de `.env.example`.

## Qué incluye

- Página pública bilingüe (`/`), registro (`/registro`) e inicio de sesión (`/login`).
- `/app`: explorar encargos abiertos con filtros por peso, categoría, fecha y nivel de quien encarga.
- Publicar encargos con foto, medidas, peso, términos obligatorios y reglas para medicinas.
- Publicar viajes, aceptar encargos, seguimiento del estado y calificación de ambos lados.
- El WhatsApp de cada persona solo se comparte cuando un encargo es aceptado.

El nivel de quien encarga depende de cuántos encargos ha completado: Nuevo (0), Bronce (1+), Plata (3+), Oro (10+).
