async function searchLyrics() {
  const songTitle = document.getElementById('songTitle').value.trim();
  const artistName = document.getElementById('artistName').value.trim();
  const loadingDiv = document.getElementById('loading');
  const errorDiv = document.getElementById('error');
  const lyricsDiv = document.getElementById('lyricsResult');

  if (!songTitle) {
    errorDiv.textContent = 'Please enter a song title';
    errorDiv.style.display = 'block';
    return;
  }

  loadingDiv.style.display = 'block';
  errorDiv.style.display = 'none';
  lyricsDiv.textContent = '';

  try {
    // First, get the song URL
    const searchResponse = await fetch(`/api/search?songTitle=${encodeURIComponent(songTitle)}&artistName=${encodeURIComponent(artistName)}`);
    const searchData = await searchResponse.json();

    if (searchData.error) {
      throw new Error(searchData.error);
    }

    // Then, get the lyrics
    const lyricsResponse = await fetch(`/api/lyrics?url=${encodeURIComponent(searchData.url)}`);
    const lyricsData = await lyricsResponse.json();

    if (lyricsData.error) {
      throw new Error(lyricsData.error);
    }

    lyricsDiv.textContent = lyricsData.lyrics;

    // Clear input fields after successful lyrics fetch
    document.getElementById('songTitle').value = '';
    document.getElementById('artistName').value = '';

  } catch (error) {
    errorDiv.textContent = error.message;
    errorDiv.style.display = 'block';
  } finally {
    loadingDiv.style.display = 'none';
  }
}

// Allow Enter key to trigger search instead of Search button.
document.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    searchLyrics();
  }
});