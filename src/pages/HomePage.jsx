import HeroCarousel from '../components/HeroCarousel';
import ContentRow from '../components/ContentRow';
import { useAnimeData } from '../hooks/useAnimeData';

// Datos de ejemplo para "Continuar Viendo"
const CONTINUE_WATCHING = [
  {
    mal_id: 9001,
    title: 'Attack on Titan',
    title_english: 'Attack on Titan',
    images: { jpg: { large_image_url: 'https://cdn.myanimelist.net/images/anime/10/47347l.jpg' } },
    score: 9.0,
    genres: [{ mal_id: 1, name: 'Action' }, { mal_id: 38, name: 'Military' }],
    _progress: 65,
  },
  {
    mal_id: 9002,
    title: 'Demon Slayer',
    title_english: 'Demon Slayer: Kimetsu no Yaiba',
    images: { jpg: { large_image_url: 'https://cdn.myanimelist.net/images/anime/1286/99889l.jpg' } },
    score: 8.7,
    genres: [{ mal_id: 1, name: 'Action' }, { mal_id: 10, name: 'Fantasy' }],
    _progress: 30,
  },
  {
    mal_id: 9003,
    title: 'Jujutsu Kaisen',
    title_english: 'Jujutsu Kaisen',
    images: { jpg: { large_image_url: 'https://cdn.myanimelist.net/images/anime/1171/109222l.jpg' } },
    score: 8.6,
    genres: [{ mal_id: 1, name: 'Action' }, { mal_id: 37, name: 'Supernatural' }],
    _progress: 80,
  },
  {
    mal_id: 9004,
    title: 'One Piece',
    title_english: 'One Piece',
    images: { jpg: { large_image_url: 'https://cdn.myanimelist.net/images/anime/6/73245l.jpg' } },
    score: 9.1,
    genres: [{ mal_id: 1, name: 'Action' }, { mal_id: 2, name: 'Adventure' }],
    _progress: 45,
  },
];

export default function HomePage({ onNavigate, myList, onToggleList }) {
  const { data: heroData, loading: heroLoading } = useAnimeData('/top/anime?filter=airing&limit=5');
  const { data: trending, loading: trendingLoading, error: trendingError, retry: retryTrending } = useAnimeData('/top/anime?filter=airing&limit=20');
  const { data: mostWatched, loading: mostWatchedLoading, error: mostWatchedError, retry: retryMostWatched } = useAnimeData('/top/anime?limit=20');
  const { data: newEpisodes, loading: newEpisodesLoading, error: newEpisodesError, retry: retryNewEpisodes } = useAnimeData('/seasons/now?limit=20');
  const { data: movies, loading: moviesLoading, error: moviesError, retry: retryMovies } = useAnimeData('/top/anime?type=movie&limit=20');
  const { data: action, loading: actionLoading, error: actionError, retry: retryAction } = useAnimeData('/anime?genres=1&limit=20');
  const { data: scifi, loading: scifiLoading, error: scifiError, retry: retryScifi } = useAnimeData('/anime?genres=24&limit=20');
  const { data: romance, loading: romanceLoading, error: romanceError, retry: retryRomance } = useAnimeData('/anime?genres=22&limit=20');
  const { data: recommended, loading: recommendedLoading, error: recommendedError, retry: retryRecommended } = useAnimeData('/recommendations/anime');

  // Aplanar recomendaciones de la API
  const recommendedAnime = recommended?.flatMap(r => r.entry).slice(0, 12) || null;

  return (
    <div className="home-page">
      {/* Hero */}
      {!heroLoading && heroData && (
        <HeroCarousel
          items={heroData}
          onNavigate={onNavigate}
          myList={myList}
          onToggleList={onToggleList}
        />
      )}
      {heroLoading && <div className="hero-placeholder" />}

      {/* Content Rows */}
      <div className="home-page__rows">
        <ContentRow title="En Tendencia" emoji="🔥" data={trending} loading={trendingLoading} error={trendingError} onRetry={retryTrending} onNavigate={onNavigate} />
        <ContentRow title="Más Vistos" emoji="👁" data={mostWatched} loading={mostWatchedLoading} error={mostWatchedError} onRetry={retryMostWatched} onNavigate={onNavigate} />
        <ContentRow title="Nuevos Episodios" emoji="🆕" data={newEpisodes} loading={newEpisodesLoading} error={newEpisodesError} onRetry={retryNewEpisodes} onNavigate={onNavigate} />
        <ContentRow title="Películas Populares" emoji="🎬" data={movies} loading={moviesLoading} error={moviesError} onRetry={retryMovies} landscape={true} onNavigate={onNavigate} />
        <ContentRow title="Anime de Acción" emoji="⚔️" data={action} loading={actionLoading} error={actionError} onRetry={retryAction} onNavigate={onNavigate} />
        <ContentRow title="Anime Sci-Fi" emoji="🚀" data={scifi} loading={scifiLoading} error={scifiError} onRetry={retryScifi} onNavigate={onNavigate} />
        <ContentRow title="Romance" emoji="💕" data={romance} loading={romanceLoading} error={romanceError} onRetry={retryRomance} onNavigate={onNavigate} />
        <ContentRow title="Continuar Viendo" emoji="▶" mockData={CONTINUE_WATCHING} loading={false} onNavigate={onNavigate} />
        <ContentRow title="Recomendados Para Ti" emoji="✨" data={recommendedAnime} loading={recommendedLoading} error={recommendedError} onRetry={retryRecommended} onNavigate={onNavigate} />
      </div>
    </div>
  );
}
