import { useState, useCallback } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AnimePage from './pages/AnimePage';
import DetailPage from './components/DetailPage';
import { useLocalStorage } from './hooks/useLocalStorage';
import './pages/HomePage.css';
import './App.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'anime' | 'detail'
  const [selectedAnimeId, setSelectedAnimeId] = useState(null);
  const [navigationHistory, setNavigationHistory] = useState([]);
  const [myList, setMyList] = useLocalStorage('anivision-mylist', []);

  const navigateToDetail = useCallback((id) => {
    setNavigationHistory(prev => [...prev, currentPage]);
    setSelectedAnimeId(id);
    setCurrentPage('detail');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentPage]);

  const navigateHome = useCallback(() => {
    setCurrentPage('home');
    setSelectedAnimeId(null);
    setNavigationHistory([]);
  }, []);

  const navigateToAnime = useCallback(() => {
    setCurrentPage('anime');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const toggleMyList = useCallback((anime) => {
    setMyList(prev => {
      const exists = prev.some(m => m.mal_id === anime.mal_id);
      if (exists) {
        return prev.filter(m => m.mal_id !== anime.mal_id);
      }
      return [...prev, {
        mal_id: anime.mal_id,
        title: anime.title_english || anime.title,
        images: anime.images,
        score: anime.score,
        genres: anime.genres,
      }];
    });
  }, [setMyList]);

  return (
    <div className="app">
      <Navbar onNavigateHome={navigateHome} onNavigateAnime={navigateToAnime} currentPage={currentPage} />

      <main className="app__main">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={navigateToDetail}
            myList={myList}
            onToggleList={toggleMyList}
          />
        )}
        {currentPage === 'anime' && (
          <AnimePage onNavigate={navigateToDetail} />
        )}
        {currentPage === 'detail' && (
          <DetailPage
            animeId={selectedAnimeId}
            onBack={navigateHome}
            myList={myList}
            onToggleList={toggleMyList}
          />
        )}
      </main>
    </div>
  );
}
