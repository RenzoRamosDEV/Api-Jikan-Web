import { useState } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import DetailPage from './components/DetailPage';
import { useLocalStorage } from './hooks/useLocalStorage';
import './pages/HomePage.css';
import './App.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'detail'
  const [selectedAnimeId, setSelectedAnimeId] = useState(null);
  const [navigationHistory, setNavigationHistory] = useState([]);
  const [myList, setMyList] = useLocalStorage('anivision-mylist', []);

  function navigateToDetail(id) {
    setNavigationHistory(prev => [...prev, currentPage]);
    setSelectedAnimeId(id);
    setCurrentPage('detail');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function navigateHome() {
    setCurrentPage('home');
    setSelectedAnimeId(null);
    setNavigationHistory([]);
  }

  function toggleMyList(anime) {
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
  }

  return (
    <div className="app">
      <Navbar onNavigateHome={navigateHome} currentPage={currentPage} />

      <main className="app__main">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={navigateToDetail}
            myList={myList}
            onToggleList={toggleMyList}
          />
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
