icos# Reglas del Proyecto: Medicos Platform

Este documento define las reglas y convenciones que el agente de IA debe seguir al trabajar en el proyecto "Medicos Platform".

## 1. Pila Tecnológica Principal

- **Framework:** Next.js (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Backend y Base de Datos:** Supabase (utilizar el cliente de `src/lib/supabase.ts`)
- **Autenticación:** Supabase Auth
- **Hosting y Notificaciones:** Firebase
- **Pruebas:** Jest

## 2. Flujo de Trabajo de Desarrollo

1.  **Análisis:** Antes de escribir código, analiza los archivos existentes para comprender la arquitectura y los patrones actuales. Presta especial atención a `src/app`, `src/components`, `src/hooks` y `src/lib`.
2.  **Planificación:** Para cualquier solicitud de nueva característica o refactorización, describe brevemente el plan de implementación.
3.  **Implementación:** Escribe código limpio, legible y mantenible que se adhiera a las convenciones del proyecto.
4.  **Verificación:** Después de realizar cambios en el código, ejecuta los comandos de linter y pruebas para asegurar la calidad y evitar regresiones. Los comandos relevantes son `npm run lint` y `npm test`.

## 3. Convenciones de Código

- **Componentes:** Todos los componentes de React deben ser funcionales y utilizar Hooks. Mantenlos pequeños y enfocados en una sola responsabilidad.
- **Hooks Personalizados:** Utiliza los hooks existentes en `src/hooks` siempre que sea posible, especialmente `useSupabase.ts` para interactuar con la base de datos.
- **Tipado:** Se debe utilizar TypeScript de forma estricta. Define tipos claros para props, estado y datos de la API en `src/types`.
- **Manejo de Estado:** Para el estado global, utiliza el `AuthContext` que se encuentra en `src/contexts/AuthContext.tsx`.
- **Gestión de Paquetes:** Utiliza `npm` para instalar o gestionar dependencias.

## 4. Estructura de Archivos

- **Páginas/Rutas:** Dentro de `src/app`.
- **Componentes Reutilizables:** Dentro de `src/components`, organizados por funcionalidad (ej. `auth`, `dashboard`).
- **Hooks Personalizados:** Dentro de `src/hooks`.
- **Librerías/Clientes (Supabase, Firebase):** Dentro de `src/lib`.
- **Tipos Globales:** Dentro de `src/types`.
- **Funciones de Utilidad:** Dentro de `src/utils`.
