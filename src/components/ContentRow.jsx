import { useRef, useEffect } from 'react';
import AnimeCard from './AnimeCard';
import SkeletonCard from './SkeletonCard';
import './ContentRow.css';

const SKELETONS = Array(8).fill(null);

export default function ContentRow({
  title,
  emoji,
  data,
  loading,
  error,
  onRetry,
  landscape = false,
  onNavigate,
  mockData = null,
}) {
  const items = mockData || data;
  const isEmpty = !loading && !error && (!items || items.length === 0);
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function handleWheel(e) {
      e.preventDefault();
      el.scrollBy({ left: e.deltaY || e.deltaX, behavior: 'smooth' });
    }

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <section className="content-row">
      <div className="content-row__header">
        <h2 className="content-row__title">{title}</h2>
        <button className="content-row__see-all">Ver todo →</button>
      </div>

      <div className="content-row__scroll-container" ref={scrollRef}>
        <div className="content-row__track">
          {loading && SKELETONS.map((_, i) => (
            <SkeletonCard key={i} landscape={landscape} />
          ))}
          {error && (
            <div className="content-row__error">
              <span>No se pudo cargar esta sección.</span>
              {onRetry && (
                <button className="content-row__retry" onClick={onRetry}>
                  Reintentar
                </button>
              )}
            </div>
          )}
          {isEmpty && !mockData && (
            <div className="content-row__empty">Sin contenido disponible.</div>
          )}
          {!loading && items && items.slice(0, 10).map((anime, i) => (
            <AnimeCard
              key={anime?.mal_id || i}
              anime={anime}
              landscape={landscape}
              progress={anime?._progress || null}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
