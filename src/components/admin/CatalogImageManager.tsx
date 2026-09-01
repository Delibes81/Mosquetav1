"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import { ChevronLeft, ChevronRight, GripVertical, ImagePlus, LoaderCircle, UploadCloud } from 'lucide-react';
import {
  registerCatalogImagesAction,
  reorderCatalogImagesAction,
} from '@/app/admin/productos/actions';
import {
  CATALOG_IMAGE_BUCKET,
  CATALOG_IMAGE_MAX_FILES,
  optimizeCatalogImage,
} from '@/lib/admin/catalog-image-client';
import type { AdminCatalogImage } from '@/lib/admin/catalog-types';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';

interface CatalogImageManagerProps {
  productId: string;
  variantId: string;
  images: AdminCatalogImage[];
  disabled?: boolean;
}

function moveItem<T>(items: T[], from: number, to: number) {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export default function CatalogImageManager({
  productId,
  variantId,
  images,
  disabled = false,
}: CatalogImageManagerProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [orderedImages, setOrderedImages] = useState(images);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const [savingOrder, startSavingOrder] = useTransition();

  async function persistOrder(nextImages: AdminCatalogImage[], previousImages: AdminCatalogImage[]) {
    setOrderedImages(nextImages);
    setFeedback(null);

    startSavingOrder(async () => {
      const result = await reorderCatalogImagesAction({
        productId,
        variantId,
        imageIds: nextImages.map((image) => image.id),
      });

      if (result.status === 'error') {
        setOrderedImages(previousImages);
        setFeedback({ kind: 'error', message: result.message });
        return;
      }

      setFeedback({ kind: 'success', message: result.message });
      router.refresh();
    });
  }

  function changePosition(from: number, to: number) {
    if (savingOrder || to < 0 || to >= orderedImages.length || from === to) return;
    const previous = orderedImages;
    void persistOrder(moveItem(previous, from, to), previous);
  }

  function handleImageDrop(targetId: string) {
    if (!draggedId || draggedId === targetId || savingOrder) return;
    const from = orderedImages.findIndex((image) => image.id === draggedId);
    const to = orderedImages.findIndex((image) => image.id === targetId);
    if (from >= 0 && to >= 0) changePosition(from, to);
    setDraggedId(null);
  }

  async function uploadFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    if (disabled || uploading || files.length === 0) return;
    if (files.length > CATALOG_IMAGE_MAX_FILES) {
      setFeedback({ kind: 'error', message: 'Puedes cargar un máximo de 10 imágenes a la vez.' });
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const uploadedObjectPaths: string[] = [];
    const storagePaths: string[] = [];
    setUploading(true);
    setFeedback(null);

    try {
      for (const [index, file] of files.entries()) {
        setProgress(`Optimizando ${index + 1} de ${files.length}: ${file.name}`);
        const optimized = await optimizeCatalogImage(file);
        if (optimized.blob.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name}: el WebP optimizado todavía supera 10 MB.`);
        }

        const objectPath = `${productId}/${variantId}/${crypto.randomUUID()}.webp`;
        setProgress(`Subiendo ${index + 1} de ${files.length} en WebP…`);
        const { error } = await supabase.storage
          .from(CATALOG_IMAGE_BUCKET)
          .upload(objectPath, optimized.blob, {
            cacheControl: '31536000',
            contentType: 'image/webp',
            upsert: false,
          });

        if (error) throw new Error(`No se pudo subir ${file.name}: ${error.message}`);
        uploadedObjectPaths.push(objectPath);
        storagePaths.push(`${CATALOG_IMAGE_BUCKET}/${objectPath}`);
      }

      setProgress('Registrando las imágenes en la galería…');
      const result = await registerCatalogImagesAction({ productId, variantId, storagePaths });
      if (result.status === 'error') {
        await supabase.storage.from(CATALOG_IMAGE_BUCKET).remove(uploadedObjectPaths);
        throw new Error(result.message);
      }

      setFeedback({ kind: 'success', message: result.message });
      if (inputRef.current) inputRef.current.value = '';
      router.refresh();
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: error instanceof Error ? error.message : 'No se pudieron cargar las imágenes.',
      });
    } finally {
      setUploading(false);
      setProgress('');
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-montserrat text-lg font-extrabold text-slate-950">Galería del producto</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Arrastra las imágenes para ordenarlas. La primera se usa como portada en el catálogo.
          </p>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          {orderedImages.length} {orderedImages.length === 1 ? 'imagen' : 'imágenes'}
        </div>
      </div>

      {feedback ? (
        <div
          role="status"
          className={`mt-5 rounded-xl px-4 py-3 text-sm font-semibold ${
            feedback.kind === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      {orderedImages.length > 0 ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orderedImages.map((image, index) => (
            <article
              key={image.id}
              draggable={!disabled && !savingOrder}
              onDragStart={() => setDraggedId(image.id)}
              onDragEnd={() => setDraggedId(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleImageDrop(image.id)}
              className={`overflow-hidden rounded-2xl border bg-white transition ${
                draggedId === image.id ? 'border-mosqueta-primary opacity-60' : 'border-slate-200'
              }`}
            >
              <div className="relative aspect-[4/3] bg-slate-100">
                <Image
                  src={image.url}
                  alt={image.altText || `Imagen ${index + 1} del producto`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-contain p-2"
                />
                <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
                  {index === 0 ? (
                    <span className="rounded-full bg-mosqueta-primary px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white shadow">
                      Principal
                    </span>
                  ) : null}
                  <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-slate-700 shadow">
                    {image.imageStatus === 'final' ? 'Final · WebP' : 'Referencia'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 border-t border-slate-100 px-3 py-2.5">
                <GripVertical size={17} className="shrink-0 text-slate-400" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-600">
                  Posición {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => changePosition(index, index - 1)}
                  disabled={disabled || savingOrder || index === 0}
                  aria-label={`Mover imagen ${index + 1} a la izquierda`}
                  className="rounded-lg border border-slate-200 p-1.5 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => changePosition(index, index + 1)}
                  disabled={disabled || savingOrder || index === orderedImages.length - 1}
                  aria-label={`Mover imagen ${index + 1} a la derecha`}
                  className="rounded-lg border border-slate-200 p-1.5 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
          <ImagePlus className="mx-auto text-slate-400" size={32} />
          <p className="mt-2 text-sm font-bold text-slate-700">Este producto todavía no tiene imágenes.</p>
        </div>
      )}

      <label
        className={`mt-5 flex min-h-36 flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-6 text-center transition ${
          disabled || uploading
            ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-60'
            : 'cursor-pointer border-pink-200 bg-pink-50/50 hover:border-mosqueta-primary hover:bg-pink-50'
        }`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void uploadFiles(event.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          disabled={disabled || uploading}
          onChange={(event) => event.target.files && void uploadFiles(event.target.files)}
          className="sr-only"
        />
        {uploading ? (
          <LoaderCircle className="animate-spin text-mosqueta-primary" size={28} />
        ) : (
          <UploadCloud className="text-mosqueta-primary" size={30} />
        )}
        <span className="mt-2 text-sm font-extrabold text-slate-800">
          {uploading ? progress : 'Arrastra imágenes aquí o haz clic para seleccionarlas'}
        </span>
        <span className="mt-1 text-xs text-slate-500">
          JPG, PNG o WebP · máximo 20 MB cada una · hasta 10 por carga
        </span>
        <span className="mt-1 text-xs font-semibold text-mosqueta-primary">
          Se convierten a WebP y se reducen a un máximo de 2000 px antes de subir.
        </span>
      </label>

      {savingOrder ? (
        <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
          <LoaderCircle className="animate-spin" size={14} /> Guardando orden…
        </p>
      ) : null}
    </section>
  );
}
