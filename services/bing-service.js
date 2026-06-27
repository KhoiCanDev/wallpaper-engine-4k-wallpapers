async function fetchRandomWallpaper() {
  const response = await fetch(
    'https://bing.biturl.top/?resolution=UHD&format=json&index=0&mkt=random'
  );
  return response.json();
}
