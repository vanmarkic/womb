import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import './Gallery.css';

interface MediaItem {
  type: 'photo' | 'video';
  file: string;
  author?: string;
  caption?: string;
}

interface GalleryProps {
  items: MediaItem[];
  lang: 'en' | 'fr';
}

export function Gallery({ items, lang }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
    document.body.style.overflow = '';
  };

  const goToPrevious = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + items.length) % items.length);
  };

  const goToNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % items.length);
  };

  // Keyboard navigation
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'Escape':
          closeLightbox();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex]);

  // Touch gestures
  const handleTouchStart = (e: TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }

    setTouchStartX(null);
  };

  const selectedItem = selectedIndex !== null ? items[selectedIndex] : null;

  return (
    <div class="gallery">
      <div class="gallery-grid">
        {items.map((item, index) => (
          <button
            key={index}
            class="gallery-item"
            onClick={() => openLightbox(index)}
            aria-label={`View ${item.type} ${index + 1}`}
          >
            {item.type === 'photo' ? (
              <img
                src={item.file}
                alt={item.caption || `Gallery item ${index + 1}`}
                loading="lazy"
              />
            ) : (
              <div class="video-thumbnail">
                <video src={item.file} muted />
                <span class="video-icon">▶</span>
              </div>
            )}
            {item.author && (
              <span class="gallery-author">© {item.author}</span>
            )}
          </button>
        ))}
      </div>

      {selectedIndex !== null && selectedItem && (
        <div
          class="lightbox-overlay"
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div class="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              class="lightbox-close"
              onClick={closeLightbox}
              aria-label="Close"
            >
              ×
            </button>

            <button
              class="lightbox-nav lightbox-prev"
              onClick={goToPrevious}
              aria-label="Previous"
            >
              ‹
            </button>

            <div class="lightbox-media">
              {selectedItem.type === 'photo' ? (
                <img
                  src={selectedItem.file}
                  alt={selectedItem.caption || 'Gallery image'}
                />
              ) : (
                <video
                  src={selectedItem.file}
                  controls
                  autoPlay
                />
              )}
              {selectedItem.caption && (
                <p class="lightbox-caption">{selectedItem.caption}</p>
              )}
              {selectedItem.author && (
                <p class="lightbox-author">© {selectedItem.author}</p>
              )}
            </div>

            <button
              class="lightbox-nav lightbox-next"
              onClick={goToNext}
              aria-label="Next"
            >
              ›
            </button>

            <div class="lightbox-counter">
              {selectedIndex + 1} / {items.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}