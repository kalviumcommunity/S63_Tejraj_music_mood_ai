import dotenv from "dotenv";
dotenv.config();

let cachedToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) return cachedToken;

  const resp = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET
        ).toString("base64")
    },
    body: new URLSearchParams({ grant_type: "client_credentials" })
  });

  if (!resp.ok) throw new Error("Spotify auth failed");
  const data = await resp.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
}

export async function searchTracks(query) {
  try {
    const token = await getAccessToken();
    const url = new URL("https://api.spotify.com/v1/search");
    url.searchParams.set("q", query);
    url.searchParams.set("type", "track");
    url.searchParams.set("limit", "5");

    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!resp.ok) throw new Error("Spotify search failed");
    const data = await resp.json();
    return (data.tracks?.items || []).map((t) => ({
      title: t.name,
      artist: t.artists?.map((a) => a.name).join(", "),
      spotifyUrl: t.external_urls?.spotify
    }));
  } catch (e) {
    // graceful fallback
    return [];
  }
}
