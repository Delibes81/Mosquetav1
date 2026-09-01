"use client";

export const CATALOG_IMAGE_BUCKET = 'catalog-products';
export const CATALOG_IMAGE_MAX_FILES = 10;
export const CATALOG_IMAGE_MAX_SOURCE_BYTES = 20 * 1024 * 1024;
export const CATALOG_IMAGE_MAX_EDGE = 2000;

const acceptedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

function canvasToWebp(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('El navegador no pudo generar el archivo WebP.')),
      'image/webp',
      0.82,
    );
  });
}

export async function optimizeCatalogImage(file: File) {
  if (!acceptedTypes.has(file.type)) {
    throw new Error(`${file.name}: usa una imagen JPG, PNG o WebP.`);
  }
  if (file.size > CATALOG_IMAGE_MAX_SOURCE_BYTES) {
    throw new Error(`${file.name}: supera el límite de 20 MB.`);
  }

  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    const scale = Math.min(1, CATALOG_IMAGE_MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { alpha: false });

    if (!context) throw new Error('No se pudo preparar la imagen para optimizarla.');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await canvasToWebp(canvas);
    return { blob, width, height };
  } finally {
    bitmap.close();
  }
}
