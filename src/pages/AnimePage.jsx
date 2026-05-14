import { useState, useCallback, useEffect } from 'react';
import AnimeCard from '../components/AnimeCard';
import SkeletonCard from '../components/SkeletonCard';
import './AnimePage.css';

const TIPOS = [
  { label: 'TV', value: 'tv' },
  { label: 'Película', value: 'movie' },
  { label: 'OVA', value: 'ova' },
  { label: 'Special', value: 'special' },
  { label: 'ONA', value: 'ona' },
  { label: 'Música', value: 'music' },
];

const GENEROS = [
  { label: 'Acción', value: '1' },
  { label: 'Aventura', value: '2' },
  { label: 'Comedia', value: '4' },
  { label: 'Drama', value: '8' },
  { label: 'Fantasía', value: '10' },
  { label: 'Horror', value: '14' },
  { label: 'Misterio', value: '7' },
  { label: 'Romance', value: '22' },
  { label: 'Sci-Fi', value: '24' },
  { label: 'Slice of Life', value: '36' },
  { label: 'Sobrenatural', value: '37' },
  { label: 'Deportes', value: '30' },
  { label: 'Thriller', value: '41' },
  { label: 'Shounen', value: '27' },
  { label: 'Shoujo', value: '25' },
  { label: 'Isekai', value: '62' },
  { label: 'Mecha', value: '18' },
  { label: 'Música', value: '19' },
  { label: 'Psicológico', value: '40' },
  { label: 'Histórico', value: '13' },
];

const ESTADOS = [
  { label: 'En emisión', value: 'airing' },
  { label: 'Finalizado', value: 'complete' },
  { label: 'Próximamente', value: 'upcoming' },
];

const CLASIFICACIONES = [
  { label: 'Todos los públicos', value: 'g' },
  { label: 'Niños (PG)', value: 'pg' },
  { label: 'Teens (PG-13)', value: 'pg13' },
  { label: 'Adultos (R-17)', value: 'r17' },
  { label: 'Violencia/Mild (R+)', value: 'r' },
];

const ORDENAR = [
  { label: 'Puntuación', value: 'score' },
  { label: 'Popularidad', value: 'popularity' },
  { label: 'Más reciente', value: 'start_date' },
  { label: 'Título A-Z', value: 'title' },
  { label: 'Miembros', value: 'members' },
  { label: 'Rank', value: 'rank' },
  { label: 'Episodios', value: 'episodes' },
];

const SKELETONS = Array(25).fill(null);
const MIN_YEAR = 1950;
const MAX_YEAR = new Date().getFullYear();
const PER_PAGE = 25;

const defaultFilters = {
  q: '',
  tipo: '',
  genero: '',
  yearMin: MIN_YEAR,
  yearMax: MAX_YEAR,
  estado: '',
  clasificacion: '',
  minScore: 0,
  ordenar: 'score',
};

export default function AnimePage({ onNavigate, page = 1, onPageChange }) {
  const [filters, setFilters] = useState(defaultFilters);
  const [activeFilters, setActiveFilters] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastPage, setLastPage] = useState(1);

  const setPage = useCallback((p) => {
    onPageChange?.(p);
  }, [onPageChange]);

  const buildUrl = useCallback((f, p) => {
    const params = new URLSearchParams();
    params.set('limit', String(PER_PAGE));
    params.set('page', String(p));
    params.set('order_by', f?.ordenar || 'score');
    params.set('sort', f?.ordenar === 'title' ? 'asc' : 'desc');
    if (f?.q) params.set('q', f.q);
    if (f?.tipo) params.set('type', f.tipo);
    if (f?.genero) params.set('genres', f.genero);
    if (f?.estado) params.set('status', f.estado);
    if (f?.clasificacion) params.set('rating', f.clasificacion);
    if (f?.minScore > 0) params.set('min_score', String(f.minScore));
    if (f?.yearMin > MIN_YEAR) params.set('start_date', `${f.yearMin}-01-01`);
    if (f?.yearMax < MAX_YEAR) params.set('end_date', `${f.yearMax}-12-31`);
    return `https://api.jikan.moe/v4/anime?${params.toString()}`;
  }, []);

  const fetchPage = useCallback(async (f, p) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(buildUrl(f, p));
      if (!res.ok) throw new Error('Error al cargar');
      const json = await res.json();
      setResults(json.data || []);
      setLastPage(json.pagination?.last_visible_page || 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [buildUrl]);

  useEffect(() => { fetchPage(null, page); }, []);

  const handleSearch = useCallback(() => {
    setActiveFilters(filters);
    setPage(1);
    fetchPage(filters, 1);
  }, [filters, fetchPage]);

  const handleClear = useCallback(() => {
    setFilters(defaultFilters);
    setActiveFilters(null);
    setPage(1);
    fetchPage(null, 1);
  }, [fetchPage]);

  const goToPage = useCallback((p) => {
    setPage(p);
    fetchPage(activeFilters, p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeFilters, fetchPage]);

  const pageNumbers = () => {
    const pages = [];
    const delta = 2;
    const left = Math.max(1, page - delta);
    const right = Math.min(lastPage, page + delta);
    if (left > 1) { pages.push(1); if (left > 2) pages.push('...'); }
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < lastPage) { if (right < lastPage - 1) pages.push('...'); pages.push(lastPage); }
    return pages;
  };

  const set = (key) => (e) => setFilters(f => ({ ...f, [key]: e.target.value }));

  return (
    <div className="anime-page">
      {/* Sidebar */}
      <aside className="anime-page__sidebar">
        <h2 className="anime-page__sidebar-title">Filtros</h2>

        {/* Búsqueda por texto */}
        <div className="anime-filter">
          <label className="anime-filter__label">BÚSQUEDA</label>
          <div className="anime-filter__search-wrap">
            <svg className="anime-filter__search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              className="anime-filter__input"
              placeholder="Nombre del anime..."
              value={filters.q}
              onChange={set('q')}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>

        <div className="anime-filter__divider" />

        {/* Género */}
        <div className="anime-filter">
          <label className="anime-filter__label">GÉNERO</label>
          <select className="anime-filter__select" value={filters.genero} onChange={set('genero')}>
            <option value="">Todos</option>
            {GENEROS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </div>

        {/* Clasificación */}
        <div className="anime-filter">
          <label className="anime-filter__label">CLASIFICACIÓN</label>
          <select className="anime-filter__select" value={filters.clasificacion} onChange={set('clasificacion')}>
            <option value="">Todas</option>
            {CLASIFICACIONES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        {/* Ordenar */}
        <div className="anime-filter">
          <label className="anime-filter__label">ORDENAR POR</label>
          <select className="anime-filter__select" value={filters.ordenar} onChange={set('ordenar')}>
            {ORDENAR.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>


        <div className="anime-filter__divider" />

        <button className="anime-filter__btn-search" onClick={handleSearch}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          Buscar
        </button>
        <button className="anime-filter__btn-clear" onClick={handleClear}>
          Limpiar filtros
        </button>
      </aside>

      {/* Right column */}
      <div className="anime-page__right">
        <section className="anime-page__grid">
          {loading && SKELETONS.map((_, i) => (
            <div key={i} className="anime-page__card-wrap"><SkeletonCard /></div>
          ))}
          {!loading && error && <div className="anime-page__message">Error: {error}</div>}
          {!loading && !error && results.length === 0 && <div className="anime-page__message">Sin resultados.</div>}
          {!loading && results.map((anime, i) => (
            <div key={anime.mal_id || i} className="anime-page__card-wrap">
              <AnimeCard anime={anime} onNavigate={onNavigate} />
            </div>
          ))}
        </section>

        {!loading && lastPage > 1 && (
          <div className="anime-page__pagination">
            <button className="anime-page__page-btn" onClick={() => goToPage(page - 1)} disabled={page === 1}>‹</button>
            {pageNumbers().map((p, i) =>
              p === '...'
                ? <span key={`e-${i}`} className="anime-page__page-ellipsis">…</span>
                : <button key={p} className={`anime-page__page-btn ${p === page ? 'anime-page__page-btn--active' : ''}`} onClick={() => goToPage(p)}>{p}</button>
            )}
            <button className="anime-page__page-btn" onClick={() => goToPage(page + 1)} disabled={page === lastPage}>›</button>
          </div>
        )}
      </div>
    </div>
  );
}
