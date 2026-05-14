import HeroCarousel from '../components/HeroCarousel';
import ContentRow from '../components/ContentRow';
import { useAnimeData } from '../hooks/useAnimeData';


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
        <ContentRow title="Películas Populares" emoji="🎬" data={movies} loading={moviesLoading} error={moviesError} onRetry={retryMovies} onNavigate={onNavigate} />
        <ContentRow title="Anime de Acción" emoji="⚔️" data={action} loading={actionLoading} error={actionError} onRetry={retryAction} onNavigate={onNavigate} />
        <ContentRow title="Anime Sci-Fi" emoji="🚀" data={scifi} loading={scifiLoading} error={scifiError} onRetry={retryScifi} onNavigate={onNavigate} />
        <ContentRow title="Romance" emoji="💕" data={romance} loading={romanceLoading} error={romanceError} onRetry={retryRomance} onNavigate={onNavigate} />
<ContentRow title="Recomendados Para Ti" emoji="✨" data={recommendedAnime} loading={recommendedLoading} error={recommendedError} onRetry={retryRecommended} onNavigate={onNavigate} />
      </div>
    </div>
  );
}
