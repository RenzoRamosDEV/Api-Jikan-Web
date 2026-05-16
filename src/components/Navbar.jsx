import { useState, useCallback, useRef, useEffect } from 'react';
import './Navbar.css';

const NAV_LINKS = ['Inicio', 'Anime', 'Mi Lista'];

export default function Navbar({
  onNavigateHome,
  onNavigateAnime,
  onNavigateMyList,
  onNavigateDetail,
  currentPage,
  notifications = [],
  onClearNotif,
}) {
  const [activeLink, setActiveLink] = useState('Inicio');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLinkClick = useCallback((link) => {
    setActiveLink(link);
    if (link === 'Inicio') onNavigateHome();
    if (link === 'Anime') onNavigateAnime?.();
    if (link === 'Mi Lista') onNavigateMyList?.();
  }, [onNavigateHome, onNavigateAnime, onNavigateMyList]);

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery('');
    setResults([]);
  };

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=6&sfw=true`);
        const data = await res.json();
        setResults(data.data || []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, [query]);

  const handleResultClick = (anime) => {
    closeSearch();
    onNavigateDetail?.(anime.mal_id);
  };

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <button className="navbar__logo" onClick={onNavigateHome} aria-label="Go to home">
          <span className="navbar__logo-icon">⬡</span>
          <span className="navbar__logo-text gradient-text">AniVision</span>
        </button>

        <ul className="navbar__links">
          {NAV_LINKS.map(link => (
            <li key={link}>
              <button
                className={`navbar__link ${activeLink === link ? 'navbar__link--active' : ''}`}
                onClick={() => handleLinkClick(link)}
              >
                {link}
              </button>
            </li>
          ))}
        </ul>

        <div className="navbar__icons">
          {/* Search */}
          <button className={`navbar__icon-btn ${searchOpen ? 'navbar__icon-btn--hidden' : ''}`} aria-label="Buscar" onClick={openSearch}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>

          {searchOpen && (
            <div className="navbar__search-overlay">
              <div className="navbar__search-box">
                <svg className="navbar__search-icon-inner" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  ref={inputRef}
                  className="navbar__search-input"
                  type="text"
                  placeholder="Buscar anime..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Escape' && closeSearch()}
                />
                <button className="navbar__search-close" onClick={closeSearch} aria-label="Cerrar">✕</button>
              </div>
              {(results.length > 0 || searching) && (
                <div className="navbar__search-dropdown">
                  {searching && <div className="navbar__search-loading">Buscando...</div>}
                  {!searching && results.map(anime => (
                    <button
                      key={anime.mal_id}
                      className="navbar__search-result"
                      onClick={() => handleResultClick(anime)}
                    >
                      <img
                        src={anime.images?.jpg?.small_image_url}
                        alt={anime.title}
                        className="navbar__search-result-img"
                      />
                      <div className="navbar__search-result-info">
                        <span className="navbar__search-result-title">{anime.title_english || anime.title}</span>
                        <span className="navbar__search-result-score">★ {anime.score ?? '—'}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notifications */}
          <div className="navbar__notif-wrap" ref={notifRef}>
            <button
              className="navbar__icon-btn navbar__notif-btn"
              aria-label="Notificaciones"
              onClick={() => setNotifOpen(o => !o)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {notifications.length > 0 && (
                <span className="navbar__notif-badge">{notifications.length > 99 ? '99+' : notifications.length}</span>
              )}
            </button>

            {notifOpen && (
              <div className="navbar__notif-dropdown">
                <div className="navbar__notif-header">
                  <span>Notificaciones</span>
                  {notifications.length > 0 && (
                    <button className="navbar__notif-clear" onClick={() => { onClearNotif(); setNotifOpen(false); }}>
                      Limpiar
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="navbar__notif-empty">Sin notificaciones</div>
                ) : (
                  notifications.map(n => (
                    <div key={`${n.mal_id}-${n.time}`} className="navbar__notif-item">
                      <img src={n.image} alt={n.title} className="navbar__notif-img" />
                      <div className="navbar__notif-info">
                        <span className="navbar__notif-text">Añadido a Mi Lista</span>
                        <span className="navbar__notif-title">{n.title}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <button className="navbar__profile" aria-label="Perfil">
            <span>A</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
