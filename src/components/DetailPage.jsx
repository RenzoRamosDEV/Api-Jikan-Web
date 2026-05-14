import { useState, useEffect } from 'react';
import { useAnimeData } from '../hooks/useAnimeData';
import ContentRow from './ContentRow';
import './DetailPage.css';

const PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjU2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTExMTIyIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJJbnRlcixzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNDQ0NDY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

export default function DetailPage({ animeId, onBack, onNavigate, myList, onToggleList }) {
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const [charactersExpanded, setCharactersExpanded] = useState(false);
  const CHARS_INITIAL = 8;
  const [bannerIndex, setBannerIndex] = useState(0);

  const { data: anime, loading: animeLoading } = useAnimeData(animeId ? `/anime/${animeId}/full` : null);
  const { data: characters } = useAnimeData(animeId ? `/anime/${animeId}/characters` : null);
  const { data: pictures } = useAnimeData(animeId ? `/anime/${animeId}/pictures` : null);
  const { data: recommendations, loading: recLoading } = useAnimeData(animeId ? `/anime/${animeId}/recommendations` : null);

  useEffect(() => {
    if (!pictures || pictures.length <= 1) return;
    const interval = setInterval(() => {
      setBannerIndex(i => (i + 1) % pictures.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [pictures]);

  if (animeLoading) {
    return (
      <div className="detail-page detail-page--loading">
        <div className="detail-loading">
          <div className="detail-loading__bar shimmer" />
          <div className="detail-loading__poster shimmer" />
        </div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="detail-page detail-page--error">
        <button className="detail-back-btn" onClick={onBack}>← Volver</button>
        <p>No se pudieron cargar los detalles del anime.</p>
      </div>
    );
  }

  const imageUrl = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || PLACEHOLDER;
  const bannerUrl = pictures?.[bannerIndex]?.jpg?.large_image_url || anime.trailer?.images?.maximum_image_url || imageUrl;
  const title = anime.title_english || anime.title || 'Sin título';
  const synopsis = anime.synopsis || '';
  const genres = anime.genres || [];
  const isInList = myList?.some(m => m.mal_id === anime.mal_id);
  const shortSynopsis = synopsis.length > 300 ? synopsis.slice(0, 300) + '…' : synopsis;

  // Mapear recomendaciones a objetos tipo anime
  const recAnimes = recommendations?.slice(0, 10).map(r => r.entry) || [];

  return (
    <div className="detail-page">
      {/* Banner */}
      <div className="detail-banner">
        {(pictures && pictures.length > 0 ? pictures : [{ jpg: { large_image_url: bannerUrl } }]).map((pic, i) => (
          <div
            key={i}
            className="detail-banner__bg"
            style={{
              backgroundImage: `url(${pic.jpg?.large_image_url || bannerUrl})`,
              opacity: i === bannerIndex ? 1 : 0,
            }}
          />
        ))}
        <div className="detail-banner__gradient" />
        <button className="detail-back-btn" onClick={onBack} aria-label="Volver atrás">
          ← Volver
        </button>
      </div>

      {/* Main Content */}
      <div className="detail-main">
        {/* Info Card */}
        <div className="detail-card glass">
          {/* Fila superior: título + stats clave + géneros + botón */}
          <div className="detail-card__header">
            <div className="detail-card__header-left">
              <h1 className="detail-card__title">{title}</h1>
              {anime.title !== title && (
                <p className="detail-card__alt-title">{anime.title}</p>
              )}
            </div>
            <div className="detail-card__header-right">
              <div className="detail-card__header-actions">
                {genres.length > 0 && (
                  <div className="detail-card__genres">
                    {genres.map(g => (
                      <span key={g.mal_id} className="genre-pill">{g.name}</span>
                    ))}
                  </div>
                )}
                <button className="btn-glass" onClick={() => onToggleList && onToggleList(anime)}>
                  {isInList ? '✓ En Mi Lista' : '+ Mi Lista'}
                </button>
              </div>
            </div>
          </div>

          {/* Separador */}
          <div className="detail-card__divider" />

          {/* Fila inferior: póster | stats extra | sinopsis */}
          <div className="detail-card__body">
            <div className="detail-card__poster">
              <img
                src={imageUrl}
                alt={title}
                loading="lazy"
                onError={(e) => { e.target.src = PLACEHOLDER; }}
              />
            </div>

            <div className="detail-card__meta">
              {anime.score && (
                <div className="detail-stat">
                  <span className="detail-stat__label">Puntuación</span>
                  <span className="detail-stat__value">⭐ {anime.score.toFixed(1)}</span>
                </div>
              )}
              {anime.rank && (
                <div className="detail-stat">
                  <span className="detail-stat__label">Ranking</span>
                  <span className="detail-stat__value">#{anime.rank}</span>
                </div>
              )}
              {(anime.year || anime.aired?.prop?.from?.year) && (
                <div className="detail-stat">
                  <span className="detail-stat__label">Año</span>
                  <span className="detail-stat__value">{anime.year || anime.aired?.prop?.from?.year}</span>
                </div>
              )}
              {anime.episodes && (
                <div className="detail-stat">
                  <span className="detail-stat__label">Episodios</span>
                  <span className="detail-stat__value">{anime.episodes}</span>
                </div>
              )}
              {anime.studios?.[0] && (
                <div className="detail-stat">
                  <span className="detail-stat__label">Estudio</span>
                  <span className="detail-stat__value">{anime.studios[0].name}</span>
                </div>
              )}
            </div>

            {synopsis && (
              <div className="detail-card__synopsis">
                <h2 className="detail-section__title">Sinopsis</h2>
                <p className="detail-synopsis">{synopsis}</p>
              </div>
            )}
          </div>
        </div>


        {/* Characters */}
        {characters && characters.length > 0 && (
          <section className="detail-section">
            <h2 className="detail-section__title">Personajes y Actores de Voz</h2>
            <div className="detail-characters">
              {(charactersExpanded ? characters : characters.slice(0, CHARS_INITIAL)).map(c => (
                <div key={c.character?.mal_id} className="char-card glass">
                  <img
                    src={c.character?.images?.jpg?.image_url || PLACEHOLDER}
                    alt={c.character?.name}
                    loading="lazy"
                    className="char-card__img"
                    onError={(e) => { e.target.src = PLACEHOLDER; }}
                  />
                  <div className="char-card__info">
                    <p className="char-card__name">{c.character?.name}</p>
                    <p className="char-card__role">{c.role}</p>
                    {c.voice_actors?.[0] && (
                      <p className="char-card__va">Voz: {c.voice_actors[0].person?.name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {characters.length > CHARS_INITIAL && (
              <button
                className="detail-synopsis__toggle"
                onClick={() => setCharactersExpanded(e => !e)}
              >
                {charactersExpanded ? 'Ver menos ↑' : `Ver todos (${characters.length}) ↓`}
              </button>
            )}
          </section>
        )}

        {/* Gallery */}
        {pictures && pictures.length > 0 && (
          <section className="detail-section">
            <h2 className="detail-section__title">Galería</h2>
            <div className="detail-gallery">
              {pictures.slice(0, 5).map((pic, i) => (
                <div key={i} className="gallery-item">
                  <img
                    src={pic.jpg?.large_image_url || pic.jpg?.image_url}
                    alt={`Imagen ${i + 1}`}
                    loading="lazy"
                    onError={(e) => { e.target.src = PLACEHOLDER; }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Anime */}
        {recAnimes.length > 0 && (
          <div className="detail-section detail-section--row">
            <ContentRow
              title="Anime Relacionado"
              emoji="✨"
              data={recAnimes}
              loading={recLoading}
              limit={10}
              onNavigate={onNavigate}
            />
          </div>
        )}
      </div>
    </div>
  );
}
