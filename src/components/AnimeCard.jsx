import './AnimeCard.css';

const PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjIwIiBoZWlnaHQ9IjMxMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTExMTIyIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJJbnRlcixzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNDQ0NDY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

export default function AnimeCard({ anime, landscape = false, progress = null, onNavigate }) {
  if (!anime) return null;

  const imageUrl =
    anime.images?.jpg?.large_image_url ||
    anime.images?.jpg?.image_url ||
    anime.image_url ||
    PLACEHOLDER;

  const title = anime.title_english || anime.title || 'Sin título';
  const score = anime.score;
  const genres = anime.genres?.slice(0, 2) || [];

  function handleClick() {
    if (onNavigate && anime.mal_id) {
      onNavigate(anime.mal_id);
    }
  }

  return (
    <div
      className={`anime-card ${landscape ? 'anime-card--landscape' : ''}`}
      onClick={handleClick}
      tabIndex={0}
      role="button"
      aria-label={`Ver detalles de ${title}`}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <div className="anime-card__image-wrapper">
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          className="anime-card__image"
          onError={(e) => { e.target.src = PLACEHOLDER; }}
        />
        {score && (
          <div className="anime-card__badge">
            <span>⭐</span>
            <span>{score.toFixed(1)}</span>
          </div>
        )}
        <div className="anime-card__overlay" />
        <div className="anime-card__bottom">
          <h3 className="anime-card__title">{title}</h3>
          {genres.length > 0 && (
            <div className="anime-card__genres">
              {genres.map(g => (
                <span key={g.mal_id} className="genre-pill">{g.name}</span>
              ))}
            </div>
          )}
          {progress !== null && (
            <div className="anime-card__progress-bar">
              <div
                className="anime-card__progress-fill"
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
