let currentWallpaperSource = 'bing'; // 'bing' or 'wallhaven'

async function fetchBingWallpaper() {
  const response = await fetch(
    'https://bing.biturl.top/?resolution=UHD&format=json&index=0&mkt=random'
  );
  const data = await response.json();
  return { url: data.url };
}

async function fetchWallhavenWallpaper() {
  // Get a random page from the top 5 pages of popular wallpapers (120 wallpapers total)
  const randomPage = Math.floor(Math.random() * 5) + 1;
  const response = await fetch(
    `https://wallhaven.cc/api/v1/search?sorting=toplist&ratios=16x9&resolutions=3840x2160&purity=100&page=${randomPage}`
  );
  const result = await response.json();
  if (result && result.data && result.data.length > 0) {
    const randomIndex = Math.floor(Math.random() * result.data.length);
    return { url: result.data[randomIndex].path };
  }
  throw new Error('No Wallhaven wallpapers found');
}

async function fetchRandomWallpaper() {
  if (currentWallpaperSource === 'wallhaven') {
    return fetchWallhavenWallpaper();
  }
  return fetchBingWallpaper();
}
