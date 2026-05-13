import { memo } from 'react';
import './SkeletonCard.css';

function SkeletonCard({ landscape = false }) {
  return (
    <div
      className={`skeleton-card ${landscape ? 'skeleton-card--landscape' : ''}`}
      aria-busy="true"
      aria-label="Cargando contenido..."
    >
      <div className="skeleton-image skeleton-shimmer" />
      <div className="skeleton-content">
        <div className="skeleton-line skeleton-shimmer" style={{ width: '80%', height: '14px' }} />
        <div className="skeleton-line skeleton-shimmer" style={{ width: '50%', height: '12px', marginTop: '6px' }} />
      </div>
    </div>
  );
}

export default memo(SkeletonCard);
