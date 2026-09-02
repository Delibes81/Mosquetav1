"use client";

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { PRODUCT_IMAGE_BLUR_DATA_URL } from '@/lib/catalog-image';
import type { CatalogProductImage } from '@/lib/catalog';

interface ProductImageGalleryProps {
  images: CatalogProductImage[];
  productName: string;
}

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const currentImage = images[selectedIndex] ?? images[0];
  const hasMultipleImages = images.length > 1;

  function showPrevious() {
    setSelectedIndex((current) => (current - 1 + images.length) % images.length);
  }

  function showNext() {
    setSelectedIndex((current) => (current + 1) % images.length);
  }

  useEffect(() => {
    if (!lightboxOpen) return undefined;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setLightboxOpen(false);
      if (event.key === 'ArrowLeft' && hasMultipleImages) {
        setSelectedIndex((current) => (current - 1 + images.length) % images.length);
      }
      if (event.key === 'ArrowRight' && hasMultipleImages) {
        setSelectedIndex((current) => (current + 1) % images.length);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasMultipleImages, lightboxOpen, images.length]);

  function handleTouchEnd(endX: number) {
    if (touchStart === null || !hasMultipleImages) return;
    const distance = endX - touchStart;
    if (Math.abs(distance) > 50) {
      if (distance > 0) showPrevious();
      else showNext();
    }
    setTouchStart(null);
  }

  return (
    <div>
      <div
        className="group relative min-h-[440px] overflow-hidden rounded-xl border border-gray-200 bg-[#e9ecf2] md:min-h-[620px]"
        onTouchStart={(event) => setTouchStart(event.touches[0]?.clientX ?? null)}
        onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
      >
        <Image
          key={currentImage.id}
          src={currentImage.url}
          alt={currentImage.altText}
          fill
          className="object-contain p-2"
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          placeholder="blur"
          blurDataURL={PRODUCT_IMAGE_BLUR_DATA_URL}
        />

        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-bold text-gray-700 shadow-sm backdrop-blur transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-pink-200"
          aria-label={`Ampliar imagen de ${productName}`}
        >
          <Maximize2 size={15} /> <span className="hidden sm:inline">Ampliar</span>
        </button>

        {hasMultipleImages ? (
          <>
            <button
              type="button"
              onClick={showPrevious}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-gray-800 shadow-md transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-pink-200"
              aria-label="Ver imagen anterior"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={showNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-gray-800 shadow-md transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-pink-200"
              aria-label="Ver imagen siguiente"
            >
              <ChevronRight size={22} />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-gray-950/75 px-3 py-1.5 text-xs font-bold text-white">
              {selectedIndex + 1} / {images.length}
            </span>
          </>
        ) : null}
      </div>

      {hasMultipleImages ? (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2" aria-label="Miniaturas del producto">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`Ver imagen ${index + 1} de ${images.length}`}
              aria-current={index === selectedIndex ? 'true' : undefined}
              className={`relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border-2 bg-[#e9ecf2] transition focus:outline-none focus:ring-4 focus:ring-pink-200 ${
                index === selectedIndex
                  ? 'border-mosqueta-primary shadow-sm'
                  : 'border-transparent hover:border-pink-200'
              }`}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="96px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      ) : null}

      {currentImage.imageStatus === 'referencia' ? (
        <p className="mt-3 text-center text-xs text-gray-500">
          Imagen tomada del catálogo recibido. Se reemplazará por la fotografía final del SKU.
        </p>
      ) : null}

      {lightboxOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Vista ampliada de ${productName}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/90 p-4 sm:p-8"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white p-2.5 text-gray-900 shadow-lg focus:outline-none focus:ring-4 focus:ring-pink-300"
            aria-label="Cerrar imagen ampliada"
          >
            <X size={22} />
          </button>
          <div
            className="relative h-full w-full max-w-6xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={currentImage.url}
              alt={currentImage.altText}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
            {hasMultipleImages ? (
              <>
                <button
                  type="button"
                  onClick={showPrevious}
                  className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-white p-3 text-gray-900 shadow-lg focus:outline-none focus:ring-4 focus:ring-pink-300 sm:left-4"
                  aria-label="Ver imagen anterior"
                >
                  <ChevronLeft size={26} />
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-white p-3 text-gray-900 shadow-lg focus:outline-none focus:ring-4 focus:ring-pink-300 sm:right-4"
                  aria-label="Ver imagen siguiente"
                >
                  <ChevronRight size={26} />
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
