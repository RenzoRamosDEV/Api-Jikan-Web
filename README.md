# AniVision — Plataforma de Anime con API Jikan

Una aplicación web de streaming de anime construida con **React 19** y **Vite**, que consume la [API pública de Jikan](https://jikan.moe/) (API no oficial de MyAnimeList).

## Características

- Carrusel hero animado con los animes más populares en emisión
- Filas de contenido con scroll horizontal por categorías
- Página de detalle con sinopsis, episodios, personajes y galería
- Sistema de "Mi Lista" persistido en localStorage
- Skeleton loaders durante la carga de datos
- Caché de peticiones para evitar llamadas duplicadas a la API
- Diseño responsivo con estética oscura y efectos glassmorphism

## Tecnologías

- **React 19** — Biblioteca de interfaz de usuario
- **Vite 8** — Bundler y servidor de desarrollo
- **API Jikan v4** — Datos de anime (MyAnimeList)
- **CSS Modules** — Estilos por componente
- **localStorage** — Persistencia de lista de favoritos

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/RenzoRamosDEV/Api-Jikan-Web.git
cd Api-Jikan-Web

# Instalar dependencias
pnpm install

# Ejecutar en modo desarrollo
pnpm dev
```

## Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `pnpm dev` | Inicia el servidor de desarrollo |
| `pnpm build` | Genera la build de producción |
| `pnpm preview` | Previsualiza la build de producción |
| `pnpm lint` | Ejecuta ESLint en el proyecto |

## Estructura del proyecto

```
src/
├── components/       # Componentes reutilizables
│   ├── AnimeCard     # Tarjeta de anime
│   ├── ContentRow    # Fila de contenido con scroll
│   ├── DetailPage    # Página de detalle del anime
│   ├── HeroCarousel  # Carrusel principal
│   ├── Navbar        # Barra de navegación
│   └── SkeletonCard  # Loader tipo skeleton
├── hooks/            # Custom hooks de React
│   ├── useAnimeData  # Fetch a la API de Jikan
│   ├── useCarousel   # Control del carrusel
│   └── useLocalStorage # Persistencia en localStorage
└── pages/            # Páginas de la aplicación
    └── HomePage      # Página principal
```

## API utilizada

Este proyecto utiliza [Jikan API v4](https://docs.api.jikan.moe/), una API REST no oficial de MyAnimeList que no requiere autenticación.

## Licencia

MIT
