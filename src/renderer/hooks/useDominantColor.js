import { useEffect, useState } from "react";

const cache = new Map();
const SAMPLE_SIZE = 32;
const DARKEN_FACTOR = 0.55;
const MIN_ALPHA_TO_COUNT = 200;

function extractColor(img) {
  const canvas = document.createElement("canvas");
  canvas.width = SAMPLE_SIZE;
  canvas.height = SAMPLE_SIZE;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < MIN_ALPHA_TO_COUNT) continue;
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    count += 1;
  }
  if (count === 0) return null;

  r = Math.round((r / count) * DARKEN_FACTOR);
  g = Math.round((g / count) * DARKEN_FACTOR);
  b = Math.round((b / count) * DARKEN_FACTOR);
  return `rgba(${r}, ${g}, ${b}, 0.45)`;
}

// Extrae un color promedio (oscurecido para contrastar con texto blanco) de la
// portada vía canvas, sin depender de una librería externa como node-vibrant.
export function useDominantColor(coverUrl) {
  const [color, setColor] = useState(() => (coverUrl ? (cache.get(coverUrl) ?? null) : null));

  useEffect(() => {
    if (!coverUrl) {
      setColor(null);
      return undefined;
    }
    if (cache.has(coverUrl)) {
      setColor(cache.get(coverUrl));
      return undefined;
    }

    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      const extracted = extractColor(img);
      cache.set(coverUrl, extracted);
      setColor(extracted);
    };
    img.onerror = () => {
      if (!cancelled) setColor(null);
    };
    img.src = coverUrl;

    return () => {
      cancelled = true;
    };
  }, [coverUrl]);

  return color;
}
