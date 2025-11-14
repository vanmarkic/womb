import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import * as Dialog from '@radix-ui/react-dialog';
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
  const [isOpen, setIsOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
    setSelectedIndex(null);
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
    if (!isOpen) return;

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
  }, [isOpen, selectedIndex]);

  // Touch gestures
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }

    touchStartX.current = null;
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

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay class="dialog-overlay" onClick={closeLightbox} />
          <Dialog.Content
            class="dialog-content"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {selectedItem && (
              <>
                <Dialog.Close class="dialog-close" aria-label="Close">
                  ×
                </Dialog.Close>

                <button
                  class="dialog-nav dialog-prev"
                  onClick={goToPrevious}
                  aria-label="Previous"
                >
                  ‹
                </button>

                <div class="dialog-media">
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
                    <p class="dialog-caption">{selectedItem.caption}</p>
                  )}
                  {selectedItem.author && (
                    <p class="dialog-author">© {selectedItem.author}</p>
                  )}
                </div>

                <button
                  class="dialog-nav dialog-next"
                  onClick={goToNext}
                  aria-label="Next"
                >
                  ›
                </button>

                <div class="dialog-counter">
                  {selectedIndex + 1} / {items.length}
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}