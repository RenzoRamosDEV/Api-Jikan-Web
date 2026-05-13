import { useState } from 'react';
import { useAnimeData } from '../hooks/useAnimeData';
import ContentRow from './ContentRow';
import './DetailPage.css';

const PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjU2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTExMTIyIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJJbnRlcixzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNDQ0NDY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

export default function DetailPage({ animeId, onBack, myList, onToggleList }) {
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);

  const { data: anime, loading: animeLoading } = useAnimeData(animeId ? `/anime/${animeId}/full` : null);
  const { data: episodes } = useAnimeData(animeId ? `/anime/${animeId}/episodes` : null);
  const { data: characters } = useAnimeData(animeId ? `/anime/${animeId}/characters` : null);
  const { data: pictures } = useAnimeData(animeId ? `/anime/${animeId}/pictures` : null);
  const { data: recommendations, loading: recLoading } = useAnimeData(animeId ? `/anime/${animeId}/recommendations` : null);

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
  const bannerUrl = anime.trailer?.images?.maximum_image_url || imageUrl;
  const title = anime.title_english || anime.title || 'Sin título';
  const synopsis = anime.synopsis || '';
  const genres = anime.genres || [];
  const isInList = myList?.some(m => m.mal_id === anime.mal_id);
  const shortSynopsis = synopsis.length > 300 ? synopsis.slice(0, 300) + '…' : synopsis;

  // Mapear recomendaciones a objetos tipo anime
  const recAnimes = recommendations?.slice(0, 12).map(r => r.entry) || [];

  return (
    <div className="detail-page">
      {/* Banner */}
      <div className="detail-banner">
        <div
          className="detail-banner__bg"
          style={{ backgroundImage: `url(${bannerUrl})` }}
        />
        <div className="detail-banner__gradient" />
        <button className="detail-back-btn" onClick={onBack} aria-label="Volver atrás">
          ← Volver
        </button>
      </div>

      {/* Main Content */}
      <div className="detail-main">
        {/* Info Card */}
        <div className="detail-card glass">
          <div className="detail-card__poster">
            <img
              src={imageUrl}
              alt={title}
              loading="lazy"
              onError={(e) => { e.target.src = PLACEHOLDER; }}
            />
          </div>

          <div className="detail-card__info">
            <h1 className="detail-card__title">{title}</h1>
            {anime.title !== title && (
              <p className="detail-card__alt-title">{anime.title}</p>
            )}

            <div className="detail-card__stats">
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
              {anime.type && (
                <div className="detail-stat">
                  <span className="detail-stat__label">Tipo</span>
                  <span className="detail-stat__value">{anime.type}</span>
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
              {anime.source && (
                <div className="detail-stat">
                  <span className="detail-stat__label">Fuente</span>
                  <span className="detail-stat__value">{anime.source}</span>
                </div>
              )}
              {anime.status && (
                <div className="detail-stat">
                  <span className="detail-stat__label">Estado</span>
                  <span className="detail-stat__value">{anime.status}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="detail-card__actions">
              <button className="btn-primary">▶ Ver Ahora</button>
              <button className="btn-glass" onClick={() => onToggleList && onToggleList(anime)}>
                {isInList ? '✓ En Mi Lista' : '+ Mi Lista'}
              </button>
              <button className="btn-glass">↓ Descargar</button>
            </div>

            {/* Genres */}
            {genres.length > 0 && (
              <div className="detail-card__genres">
                {genres.map(g => (
                  <span key={g.mal_id} className="genre-pill">{g.name}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Synopsis */}
        {synopsis && (
          <section className="detail-section">
            <h2 className="detail-section__title">Synopsis</h2>
            <p className="detail-synopsis">
              {synopsisExpanded ? synopsis : shortSynopsis}
            </p>
            {synopsis.length > 300 && (
              <button
                className="detail-synopsis__toggle"
                onClick={() => setSynopsisExpanded(e => !e)}
              >
                {synopsisExpanded ? 'Show Less ↑' : 'Show More ↓'}
              </button>
            )}
          </section>
        )}

        {/* Episodes */}
        {episodes && episodes.length > 0 && (
          <section className="detail-section">
            <h2 className="detail-section__title">Episodes</h2>
            <div className="detail-episodes">
              {episodes.slice(0, 20).map(ep => (
                <div key={ep.mal_id} className="episode-card glass">
                  <div className="episode-card__num">{ep.episode_id || ep.mal_id}</div>
                  <div className="episode-card__info">
                    <p className="episode-card__title">{ep.title || `Episode ${ep.episode_id}`}</p>
                    {ep.aired && (
                      <p className="episode-card__date">{new Date(ep.aired).toLocaleDateString()}</p>
                    )}
                  </div>
                  <button className="episode-card__play">▶</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Characters */}
        {characters && characters.length > 0 && (
          <section className="detail-section">
            <h2 className="detail-section__title">Characters &amp; Voice Actors</h2>
            <div className="detail-characters">
              {characters.slice(0, 12).map(c => (
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
                      <p className="char-card__va">VA: {c.voice_actors[0].person?.name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Gallery */}
        {pictures && pictures.length > 0 && (
          <section className="detail-section">
            <h2 className="detail-section__title">Gallery</h2>
            <div className="detail-gallery">
              {pictures.slice(0, 12).map((pic, i) => (
                <div key={i} className="gallery-item">
                  <img
                    src={pic.jpg?.large_image_url || pic.jpg?.image_url}
                    alt={`Gallery ${i + 1}`}
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
              title="Related Anime"
              emoji="✨"
              data={recAnimes}
              loading={recLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
}
