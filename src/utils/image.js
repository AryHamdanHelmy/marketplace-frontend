// Phone cameras produce 4-6 MB images. PHP's upload_max_filesize defaults to
// 2 MB, and when a request body exceeds post_max_size PHP discards the whole
// thing — including the text fields — and returns an HTML warning instead of
// JSON. Redrawing the image at a sane size in the browser avoids all of it.

const DEFAULT_MAX_EDGE = 1600;
const DEFAULT_QUALITY = 0.82;
const DEFAULT_MAX_BYTES = 2 * 1024 * 1024;

export async function downscaleImage(file, options = {}) {
  const {
    maxEdge = DEFAULT_MAX_EDGE,
    quality = DEFAULT_QUALITY,
    maxBytes = DEFAULT_MAX_BYTES,
  } = options;

  if (!file?.type?.startsWith("image/")) return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const { width, height } = bitmap;
  const longest = Math.max(width, height);

  // Already small enough — don't recompress and lose quality for nothing
  if (longest <= maxEdge && file.size <= maxBytes) {
    bitmap.close?.();
    return file;
  }

  const scale = Math.min(1, maxEdge / longest);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);

  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );

  if (!blob) return file;

  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], name, { type: "image/jpeg" });
}

export function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const IMAGE_MAX_BYTES = DEFAULT_MAX_BYTES;