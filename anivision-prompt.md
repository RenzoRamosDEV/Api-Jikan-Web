# 🎌 AniVision — Futuristic Anime Streaming App
## Prompt de Desarrollo Completo

---

## REGLA IMPORTANTE 

Nunca uses npm para instalar cosas ni nada, en todo caso usa pnpm

## OBJETIVO

Crea una aplicación web completa de streaming de anime con una interfaz futurista de lujo inspirada en **Apple TV+**, **visionOS** y **Apple Vision Pro**, usando el lenguaje de diseño **"Liquid Glass"**. La UI debe sentirse cinemática, ultra-premium, inmersiva, minimal y elegante, diseñada para pantallas grandes y ambientes oscuros.

Usa datos **reales** consumidos desde la API pública de Jikan:

> **Base URL:** `https://api.jikan.moe/v4`

---

## STACK TÉCNICO

- **React** (functional components + hooks)
- **CSS-in-JS** o CSS custom properties para el sistema de diseño
- **Fetch API** o **axios** para llamadas a Jikan
- Sin librerías de UI externas — diseño 100% custom
- Soporte para teclado/remote navigation (focus states)

---

## SISTEMA DE DISEÑO — "LIQUID GLASS"

### Paleta de Colores

```css
--bg-primary:       #050508;
--bg-secondary:     #0a0a12;
--bg-tertiary:      #0f0f1a;
--glass-white:      rgba(255, 255, 255, 0.06);
--glass-border:     rgba(255, 255, 255, 0.10);
--glass-blur:       blur(24px);
--accent-purple:    #7C3AED;
--accent-neon:      #A855F7;
--accent-blue:      #3B82F6;
--accent-cyan:      #06B6D4;
--text-primary:     #FFFFFF;
--text-secondary:   rgba(255, 255, 255, 0.65);
--text-muted:       rgba(255, 255, 255, 0.35);
--glow-purple:      rgba(124, 58, 237, 0.4);
--glow-blue:        rgba(59, 130, 246, 0.3);
```

### Reglas de Glassmorphism

Cada panel y card debe aplicar:

```css
background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(24px) saturate(180%);
-webkit-backdrop-filter: blur(24px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 20px;
box-shadow:
  0 8px 32px rgba(0, 0, 0, 0.6),
  0 0 0 0.5px rgba(255, 255, 255, 0.05) inset,
  0 1px 0 rgba(255, 255, 255, 0.1) inset;
```

### Tipografía

| Elemento | Tamaño | Peso | Notas |
|----------|--------|------|-------|
| Hero title | `72px` | `800` | `letter-spacing: -2px` |
| Section title | `22px` | `700` | — |
| Body | `16px` | `400` | `line-height: 1.6` |
| Badge / label | `12px` | `600` | `letter-spacing: 0.5px` |

**Font stack:** `SF Pro Display` → `Inter` → `system-ui`

---

## ENDPOINTS DE JIKAN API

```
GET /top/anime?filter=airing&limit=5      → Hero carousel (trending/airing)
GET /top/anime?limit=20                   → Top Anime / Most Watched
GET /seasons/now?limit=20                 → New Episodes this season
GET /top/anime?type=movie&limit=20        → Popular Movies
GET /anime?genres=1&limit=20             → Action Anime  (genre_id = 1)
GET /anime?genres=24&limit=20            → Sci-Fi Anime  (genre_id = 24)
GET /anime?genres=22&limit=20            → Romance       (genre_id = 22)
GET /recommendations/anime               → Recommended For You
GET /anime/{id}/full                     → Detail page — datos completos
GET /anime/{id}/episodes                 → Lista de episodios
GET /anime/{id}/characters               → Personajes & Voice Actors
GET /anime/{id}/pictures                 → Galería de screenshots
GET /anime/{id}/recommendations          → Anime relacionado
```

> ⚠️ **Rate limit:** Jikan permite ~3 req/s. Implementa cache local con `useState`/`useRef` y `setTimeout` entre requests para evitar errores 429.

---

## ESTRUCTURA DE PÁGINAS

### 1 · HOMEPAGE

#### Hero Section — Fullscreen

- **Altura:** `100vh`
- **Fondo:** `images.jpg.large_image_url` del anime seleccionado con efecto **Ken Burns** (zoom lento + paneo con CSS `@keyframes`)
- **Overlay gradiente:**

```css
background:
  linear-gradient(
    to right,
    rgba(5, 5, 8, 0.95) 30%,
    rgba(5, 5, 8, 0.40) 60%,
    transparent 100%
  ),
  linear-gradient(
    to top,
    rgba(5, 5, 8, 1.00) 0%,
    transparent 40%
  );
```

- Rota **automáticamente** cada 6 segundos entre los 5 animes del endpoint de airing
- Transición entre slides: **crossfade suave de 1.2 s**

**Contenido del Hero (alineado a la izquierda):**

```
[Indicadores de slide — dots]
[Badge: ⭐ TRENDING #1]
[Título del anime — 72px bold]
[Score ⭐ X.X  ·  Año  ·  Episodios  ·  Estudio]
[Géneros — pills translúcidas]
[Sinopsis — máx 3 líneas truncadas]
[▶ Watch Now]  [+ Add to List]  [ℹ More Info]
```

**Estilos de botones:**

| Botón | Estilo |
|-------|--------|
| Watch Now | `background: #fff; color: #000; font-weight: 700` — sólido premium |
| Add to List | Glass con borde `rgba(255,255,255,0.3)` |
| More Info | Solo texto con ícono, sin fondo |

---

#### Secciones Horizontales Scrollables

Crea **9 filas** en el siguiente orden:

| # | Título | Fuente de datos |
|---|--------|-----------------|
| 1 | 🔥 Trending Now | `/top/anime?filter=airing` |
| 2 | 👁 Most Watched | `/top/anime` |
| 3 | 🆕 New Episodes | `/seasons/now` |
| 4 | 🎬 Popular Movies | `/top/anime?type=movie` |
| 5 | ⚔️ Action Anime | `/anime?genres=1` |
| 6 | 🚀 Sci-Fi Anime | `/anime?genres=24` |
| 7 | 💕 Romance | `/anime?genres=22` |
| 8 | ▶ Continue Watching | Mock local con progress bars |
| 9 | ✨ Recommended For You | `/recommendations/anime` |

Cada fila incluye:
- Título de sección + flecha `"See All →"`
- Scroll horizontal con `overflow-x: auto` y `scroll-snap-type: x mandatory`
- Scrollbar nativo oculto con CSS

---

### 2 · ANIME CARDS

**Dimensiones:** `220 × 310 px` (portrait) · `320 × 180 px` (landscape para películas)

**Contenido de cada card:**
- Thumbnail (`images.jpg.large_image_url`)
- Overlay gradiente desde abajo
- Rating badge (top-right): `⭐ 8.7`
- Título (bottom, bold)
- Géneros — máx 2, pills tiny
- Progress bar morada al fondo (solo en "Continue Watching")

**Hover / Focus state:**

```css
transform: scale(1.08) translateY(-8px);
box-shadow:
  0 0 0 2px rgba(168, 85, 247, 0.8),
  0 20px 60px rgba(0, 0, 0, 0.8),
  0 0 40px rgba(124, 58, 237, 0.3);
transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
```

---

### 3 · DETAIL PAGE

Cuando el usuario hace click en una card, navega a la vista de detalle. Esta página debe sentirse **inmersiva y cinematográfica**.

**Layout general:**

```
┌──────────────────────────────────────────────────────────┐
│  BANNER FULLSCREEN  (imagen de fondo + blur + overlay)   │
│  ┌──────────┐  Título del Anime                          │
│  │  Poster  │  ★ 9.1  ·  2024  ·  TV  ·  24 eps        │
│  │  glass   │  Studio: MAPPA  ·  Source: Manga           │
│  └──────────┘  [▶ Watch Now]  [+ My List]  [↓ Download] │
│                Géneros: Action, Sci-Fi, Drama             │
└──────────────────────────────────────────────────────────┘

  [Sinopsis completa — expandible]

  [EPISODIOS — lista horizontal scrollable con thumbnails]

  [PERSONAJES & VOICE ACTORS — cards horizontales]

  [GALERÍA — grid de screenshots]

  [ANIME RELACIONADO — fila de cards]
```

**Secciones de la Detail Page:**

| # | Sección | Endpoint |
|---|---------|----------|
| 1 | Hero Banner | `/anime/{id}/full` — campo `images` |
| 2 | Info Block (glass card) | `/anime/{id}/full` — metadatos |
| 3 | Sinopsis expandible | `/anime/{id}/full` — campo `synopsis` |
| 4 | Episodios | `/anime/{id}/episodes` |
| 5 | Personajes & Voice Actors | `/anime/{id}/characters` |
| 6 | Galería de Screenshots | `/anime/{id}/pictures` |
| 7 | Anime Relacionado | `/anime/{id}/recommendations` |

---

### 4 · NAVIGATION BAR

**Posición:** `position: fixed; top: 0; z-index: 100`

```css
background: rgba(5, 5, 8, 0.70);
backdrop-filter: blur(40px);
border-bottom: 1px solid rgba(255, 255, 255, 0.06);
```

**Items:**

- **Logo** "AniVision" (izquierda) — tipografía con gradiente purple
- **Nav links:** Home · Trending · Movies · Series · My List · Search
- **Íconos** Apple-style: 🔍 Search · 🔔 Notifications · 👤 Profile
- **Active state:** underline con gradiente purple + glow sutil

---

## ANIMACIONES Y TRANSICIONES

| Evento | Animación |
|--------|-----------|
| Page load | Fade-in + slide-up staggered por sección |
| Hero slide change | Crossfade 1.2 s + título fade-up |
| Card hover | Scale 1.08 + glow purple + lift |
| Card click | Scale 0.97 → navigate con fade |
| Section scroll | Smooth momentum scroll |
| Detail page open | Fade in desde abajo |
| Image load | Skeleton shimmer → fade reveal |

---

## ESTADOS DE UI

### Loading — Skeleton con Shimmer

```css
background: linear-gradient(
  90deg,
  rgba(255, 255, 255, 0.03) 0%,
  rgba(255, 255, 255, 0.08) 50%,
  rgba(255, 255, 255, 0.03) 100%
);
background-size: 200% 100%;
animation: shimmer 1.5s infinite;
```

> Sin spinners — solo skeleton screens que replican la forma del contenido real.

### Error

Glass card con mensaje elegante y botón "Retry" con ícono.

### Empty State

Ilustración minimal + mensaje descriptivo.

---

## ARQUITECTURA DE COMPONENTES

```
App
├── Navbar
├── HomePage
│   ├── HeroCarousel
│   │   └── HeroSlide           × 5
│   └── ContentRow              × 9
│       └── AnimeCard
└── DetailPage
    ├── DetailHero
    ├── EpisodeList
    ├── CharacterGrid
    ├── Gallery
    └── RecommendationRow
        └── AnimeCard
```

### Custom Hooks

| Hook | Responsabilidad |
|------|-----------------|
| `useAnimeData(endpoint)` | Fetch + cache + estados loading/error |
| `useCarousel(items, interval)` | Auto-rotate del hero cada 6 s |
| `useLocalStorage(key)` | Persistencia de "My List" |

---

## CHECKLIST DE CALIDAD

- [ ] Diseño exclusivamente **dark mode** — sin toggle de light mode
- [ ] Fuente `Inter` cargada desde Google Fonts como fallback
- [ ] Todas las imágenes con `loading="lazy"` y placeholder gris
- [ ] Rate limit de Jikan respetado: máx 3 req/s con `setTimeout`
- [ ] SPA funcional con routing simulado via `useState` (Home ↔ Detail)
- [ ] Resolución base optimizada: **1920 × 1080** (TV screen)
- [ ] Focus states navegables con teclado (TV remote simulation)
- [ ] Sin librerías de UI externas — todo CSS custom
- [ ] Cards con `scroll-snap-align: start` para scroll preciso
- [ ] Imágenes con fallback si Jikan no retorna imagen

---

## EXPERIENCIA OBJETIVO

> La app debe sentirse como si **Apple** hubiera diseñado **Crunchyroll**.  
> Cinemática · Futurista · Elegante · Inmersiva · Premium · Fluida · Minimalista · Ultra-pulida.
