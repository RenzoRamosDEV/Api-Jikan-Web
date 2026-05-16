import { useState, useCallback, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AnimePage from './pages/AnimePage';
import MyListPage from './pages/MyListPage';
import DetailPage from './components/DetailPage';
import { useLocalStorage } from './hooks/useLocalStorage';
import './pages/HomePage.css';
import './App.css';

function parseHash() {
  const hash = window.location.hash.slice(1); // quita el #
  if (!hash) return { page: 'home', id: null };
  const [page, id] = hash.split('/');
  return { page: page || 'home', id: id ? Number(id) : null };
}

function setHash(page, id = null) {
  window.location.hash = id ? `${page}/${id}` : page;
}

export default function App() {
  const [nav, setNav] = useState(parseHash);
  const [navigationHistory, setNavigationHistory] = useState([]);
  const [animeListPage, setAnimeListPage] = useLocalStorage('anivision-animepage', 1);
  const [myList, setMyList] = useLocalStorage('anivision-mylist', []);
  const [notifications, setNotifications] = useState([]);

  // Sincronizar cuando el usuario usa los botones atrás/adelante del navegador
  useEffect(() => {
    const onHashChange = () => setNav(parseHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigateToDetail = useCallback((id) => {
    setNavigationHistory(prev => [...prev, nav.page]);
    setHash('detail', id);
    setNav({ page: 'detail', id });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [nav.page]);

  const navigateHome = useCallback(() => {
    setNavigationHistory([]);
    setHash('home');
    setNav({ page: 'home', id: null });
  }, []);

  const navigateBack = useCallback(() => {
    const prev = navigationHistory[navigationHistory.length - 1] || 'home';
    setNavigationHistory(h => h.slice(0, -1));
    setHash(prev);
    setNav({ page: prev, id: null });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [navigationHistory]);

  const navigateToAnime = useCallback(() => {
    setHash('anime');
    setNav({ page: 'anime', id: null });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const navigateToMyList = useCallback(() => {
    setHash('mylist');
    setNav({ page: 'mylist', id: null });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const importMyList = useCallback((parsed) => {
    setMyList(prev => {
      const existingIds = new Set(prev.map(a => a.mal_id));
      const newItems = parsed.filter(a => !existingIds.has(a.mal_id));
      return [...prev, ...newItems];
    });
  }, [setMyList]);

  const toggleMyList = useCallback((anime) => {
    setMyList(prev => {
      const exists = prev.some(m => m.mal_id === anime.mal_id);
      if (!exists) {
        setNotifications(n => [{
          mal_id: anime.mal_id,
          title: anime.title_english || anime.title,
          image: anime.images?.jpg?.small_image_url,
          time: Date.now(),
        }, ...n]);
      }
      if (exists) return prev.filter(m => m.mal_id !== anime.mal_id);
      return [...prev, {
        mal_id: anime.mal_id,
        title: anime.title_english || anime.title,
        images: anime.images,
        score: anime.score,
        genres: anime.genres,
      }];
    });
  }, [setMyList]);

  const { page, id: selectedAnimeId } = nav;

  return (
    <div className="app">
      <Navbar
        onNavigateHome={navigateHome}
        onNavigateAnime={navigateToAnime}
        onNavigateMyList={navigateToMyList}
        currentPage={page}
        notifications={notifications}
        onClearNotif={() => setNotifications([])}
        onNavigateDetail={navigateToDetail}
      />

      <main className="app__main">
        {page === 'home' && (
          <HomePage onNavigate={navigateToDetail} myList={myList} onToggleList={toggleMyList} />
        )}
        {page === 'anime' && (
          <AnimePage onNavigate={navigateToDetail} page={animeListPage} onPageChange={setAnimeListPage} />
        )}
        {page === 'mylist' && (
          <MyListPage myList={myList} onToggleList={toggleMyList} onNavigate={navigateToDetail} onImportList={importMyList} />
        )}
        {page === 'detail' && (
          <DetailPage
            animeId={selectedAnimeId}
            onBack={navigateBack}
            onNavigate={navigateToDetail}
            myList={myList}
            onToggleList={toggleMyList}
          />
        )}
      </main>
    </div>
  );
}
