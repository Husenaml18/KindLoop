interface PexelsPhoto {
  src: { large: string; medium: string };
}

interface PexelsSearchResponse {
  photos: PexelsPhoto[];
}

async function fetchFromPexels(count: number): Promise<string[]> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return [];

  const url = `https://api.pexels.com/v1/search?query=gift&per_page=${count}&orientation=square`;
  const res = await fetch(url, {
    headers: { Authorization: apiKey },
    next: { revalidate: 60 * 60 * 24 },
  });
  if (!res.ok) return [];

  const data = (await res.json()) as PexelsSearchResponse;
  return data.photos.map((p) => p.src.large);
}

function fallbackPhotos(count: number): string[] {
  return Array.from(
    { length: count },
    (_, i) => `https://picsum.photos/seed/kindloop-gift-${i}/600/600`
  );
}

export async function getGiftPhotos(count: number): Promise<string[]> {
  try {
    const photos = await fetchFromPexels(count);
    if (photos.length > 0) return photos;
  } catch {
    // fall through to the keyless placeholder source
  }
  return fallbackPhotos(count);
}
