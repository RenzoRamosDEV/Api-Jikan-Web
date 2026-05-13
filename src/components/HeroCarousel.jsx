import { useState, useEffect, useRef } from 'react';
import { useCarousel } from '../hooks/useCarousel';
import './HeroCarousel.css';

const PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwNTA1MDgiLz48L3N2Zz4=';

export default function HeroCarousel({ items, onNavigate, myList, onToggleList }) {
  const { currentIndex, goTo, pause, resume } = useCarousel(items, 6000);
  const [transitioning, setTransitioning] = useState(false);
  const prevIndexRef = useRef(currentIndex);

  useEffect(() => {
    if (prevIndexRef.current !== currentIndex) {
      setTransitioning(true);
      const t = setTimeout(() => setTransitioning(false), 1200);
      prevIndexRef.current = currentIndex;
      return () => clearTimeout(t);
    }
  }, [currentIndex]);

  if (!items || items.length === 0) {
    return <div className="hero-carousel hero-carousel--empty" />;
  }

  const anime = items[currentIndex];
  const imageUrl =
    anime?.trailer?.images?.maximum_image_url ||
    anime?.images?.jpg?.large_image_url ||
    anime?.images?.jpg?.image_url ||
    PLACEHOLDER;

  const title = anime?.title_english || anime?.title || 'Sin título';
  const score = anime?.score;
  const year = anime?.year || anime?.aired?.prop?.from?.year;
  const episodes = anime?.episodes;
  const studio = anime?.studios?.[0]?.name;
  const genres = anime?.genres?.slice(0, 4) || [];
  const synopsis = anime?.synopsis || '';
  const isInList = myList?.some(m => m.mal_id === anime?.mal_id);
  const rank = anime?.rank;

  function handleMoreInfo() {
    if (onNavigate && anime?.mal_id) {
      onNavigate(anime.mal_id);
    }
  }

  function handleToggleList(e) {
    e.stopPropagation();
    if (onToggleList && anime) onToggleList(anime);
  }

  return (
    <div
      className="hero-carousel"
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      {/* Right image panel */}
      <div className="hero-carousel__image-panel">
        {items.map((item, i) => {
          const bg =
            item?.trailer?.images?.maximum_image_url ||
            item?.images?.jpg?.large_image_url ||
            item?.images?.jpg?.image_url ||
            PLACEHOLDER;
          return (
            <div
              key={item.mal_id || i}
              className={`hero-carousel__slide ${i === currentIndex ? 'hero-carousel__slide--active' : ''}`}
            >
              <div
                className="hero-carousel__bg"
                style={{ backgroundImage: `url(${bg})` }}
              />
            </div>
          );
        })}
        {/* Fade from left (blends into bg-primary) */}
        <div className="hero-carousel__fade-left" />
        {/* Fade from bottom */}
        <div className="hero-carousel__gradient-bottom" />
      </div>

      {/* Slide Indicators */}
      <div className="hero-carousel__dots">
        {items.map((_, i) => (
          <button
            key={i}
            className={`hero-carousel__dot ${i === currentIndex ? 'hero-carousel__dot--active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Ir a la diapositiva ${i + 1}`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="hero-carousel__content">
        <div className="hero-carousel__badge">
          ⭐ {rank ? `TRENDING #${rank}` : 'TRENDING'}
        </div>

        <h1 className="hero-carousel__title">{title}</h1>

        <div className="hero-carousel__meta">
          {score && <span className="hero-carousel__meta-item">⭐ {score.toFixed(1)}</span>}
          {year && <span className="hero-carousel__meta-item">{year}</span>}
          {episodes && <span className="hero-carousel__meta-item">{episodes} Episodios</span>}
          {studio && <span className="hero-carousel__meta-item">{studio}</span>}
        </div>

        {genres.length > 0 && (
          <div className="hero-carousel__genres">
            {genres.map(g => (
              <span key={g.mal_id} className="genre-pill">{g.name}</span>
            ))}
          </div>
        )}

        {synopsis && (
          <p className="hero-carousel__synopsis">
            {synopsis.length > 200 ? synopsis.slice(0, 200) + '…' : synopsis}
          </p>
        )}

        <div className="hero-carousel__actions">
          <button className="btn-primary" onClick={handleMoreInfo}>
            ▶ Ver Ahora
          </button>
          <button className="btn-glass" onClick={handleToggleList}>
            {isInList ? '✓ En Mi Lista' : '+ Agregar'}
          </button>
          <button className="btn-text" onClick={handleMoreInfo}>
            ℹ Más Info
          </button>
        </div>
      </div>
    </div>
  );
}
