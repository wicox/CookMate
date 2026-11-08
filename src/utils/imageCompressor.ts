/**
 * Compress an uploaded image file into a compact Base64 thumbnail string
 * for lightweight JSON storage and fast loading.
 */
export async function compressImageToThumbnail(
  file: File,
  maxWidth = 600,
  maxHeight = 450,
  quality = 0.78
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserving dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context could not be created'));
          return;
        }

        // Draw with smoothing for high-fidelity thumbnail
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to lightweight JPEG data URL
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Nie udało się załadować grafiki'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Błąd odczytu pliku'));
    reader.readAsDataURL(file);
  });
}

/**
 * Validate URL or DataURL image
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  return url.startsWith('data:image/') || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
}
