import { useRef } from 'react';
import AnimeCard from '../components/AnimeCard';
import './MyListPage.css';

function exportToCSV(myList) {
  const headers = ['mal_id', 'title', 'score', 'genres', 'image_url'];
  const rows = myList.map(a => [
    a.mal_id,
    `"${(a.title || '').replace(/"/g, '""')}"`,
    a.score ?? '',
    `"${(a.genres || []).map(g => g.name).join('|')}"`,
    `"${a.images?.jpg?.large_image_url || a.images?.jpg?.image_url || ''}"`,
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mi-lista-anivision.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  const idx = (name) => headers.indexOf(name);

  return lines.slice(1).map(line => {
    // split respetando comillas
    const cols = [];
    let current = '';
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { cols.push(current); current = ''; continue; }
      current += ch;
    }
    cols.push(current);

    const mal_id = Number(cols[idx('mal_id')]);
    const title = cols[idx('title')] || '';
    const score = cols[idx('score')] ? Number(cols[idx('score')]) : null;
    const genreNames = cols[idx('genres')] ? cols[idx('genres')].split('|').filter(Boolean) : [];
    const image_url = cols[idx('image_url')] || '';

    return {
      mal_id,
      title,
      score,
      genres: genreNames.map((name, i) => ({ mal_id: i, name })),
      images: { jpg: { large_image_url: image_url, image_url } },
    };
  }).filter(a => a.mal_id);
}

export default function MyListPage({ myList, onToggleList, onNavigate, onImportList }) {
  const fileInputRef = useRef(null);
  const isEmpty = !myList || myList.length === 0;

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseCSV(ev.target.result);
      if (parsed.length > 0) onImportList(parsed);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="mylist-page">
      <div className="mylist-page__header">
        <div className="mylist-page__header-left">
          <h1 className="mylist-page__title">Mi Lista</h1>
          {!isEmpty && (
            <span className="mylist-page__count">{myList.length} anime{myList.length !== 1 ? 's' : ''}</span>
          )}
        </div>
        <div className="mylist-page__actions">
          {!isEmpty && (
            <button className="mylist-btn mylist-btn--export" onClick={() => exportToCSV(myList)}>
              ↓ Exportar CSV
            </button>
          )}
          <button className="mylist-btn mylist-btn--import" onClick={() => fileInputRef.current?.click()}>
            ↑ Importar CSV
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
        </div>
      </div>

      {isEmpty ? (
        <div className="mylist-page__empty">
          <p className="mylist-page__empty-icon">📋</p>
          <p className="mylist-page__empty-text">Tu lista está vacía</p>
          <p className="mylist-page__empty-sub">Agrega animes desde su página de detalle o importa un CSV</p>
        </div>
      ) : (
        <div className="mylist-page__grid">
          {myList.map((anime) => (
            <AnimeCard
              key={anime.mal_id}
              anime={anime}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
