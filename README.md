# Rifly

Aplicación en **Vue 3 + Vite + Vue Router**, construida a partir de los prototipos
_Rifly Mobile_ y _Rifly Desktop_ de Claude Design.

Landing/flujo de rifas online, **responsive**: por debajo de 1024px usa el layout del
prototipo Mobile (tarjeta centrada, menú hamburguesa, barra de compra fija); a partir
de 1024px usa el layout del prototipo Desktop (nav superior, grids de 2/3/4 columnas,
panel de compra sticky). Navegación con **URLs reales**, no con estado interno.

## Requisitos

- Node.js 18+ (recomendado 20+)

## Uso

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # build de producción en /dist
npm run preview  # sirve el build
```

## Rutas

| Ruta            | Vista                                   |
| --------------- | ---------------------------------------- |
| `/`              | Home (hero, cómo funciona, features, testimonios, agenda, FAQ) |
| `/rifas`         | Listado de rifas activas                  |
| `/rifas/:id`     | Detalle de una rifa + selector de cantidad |
| `/login`         | Ingreso (correo/contraseña + Google)      |

Usa `vue-router` en modo `history` (URLs limpias, sin `#`). Al desplegar en un
hosting estático (Netlify, Vercel, nginx, etc.) configura el **rewrite a
`index.html`** para rutas desconocidas, como en cualquier SPA — si no, recargar
`/rifas/tech` directamente en el servidor dará 404.

## Estructura

```
src/
  App.vue                 Chrome de la app (header + drawer) según la ruta
  router/index.js         Definición de rutas y scroll a anclas (#como-funciona, etc.)
  composables/useNav.js   Navegación (goHome, goRifas, selectRifa...) y estado del menú
  data/content.js         Contenido: pasos, features, testimonios, agenda, FAQs, rifas
  components/
    AppHeader.vue         Header responsive: hamburguesa (mobile) / nav inline (desktop)
    SideMenu.vue           Drawer lateral (mobile)
    BrandLogo.vue          Marca Rifly
    BaseIcon.vue           Wrapper SVG para iconos
  views/
    HomeView.vue           Hero, cómo funciona, features, testimonios, agenda, FAQ, CTA, footer
    RifasView.vue          Listado de rifas (lista mobile / grid 3 cols desktop)
    DetailView.vue         Detalle: barra fija (mobile) / panel sticky (desktop)
    LoginView.vue          Ingreso, layout centrado en ambos breakpoints
  assets/
    hero-premio.svg        Placeholder del premio (ver nota abajo)
```

Cada vista y componente que difiere entre mobile y desktop lo resuelve con
`@media (min-width: 1024px)` dentro de su propio `<style scoped>`, en vez de
mantener dos árboles de componentes duplicados.

## Nota sobre la imagen del hero

El prototipo referencia `assets/hero-premio.png`. Ese binario supera el límite de
importación (256 KB) de la herramienta de diseño y llegó truncado, así que se
incluye un **placeholder ilustrado** en `src/assets/hero-premio.svg`.

Para usar la foto real: exporta `hero-premio.png` desde el proyecto de Claude Design,
colócala en `src/assets/` y en `src/views/HomeView.vue` cambia el import:

```js
import heroPremio from '../assets/hero-premio.png'
```
