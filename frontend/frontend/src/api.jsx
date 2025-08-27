export async function login(username) {
  const r = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username })
  });
  return r.json();
}
export async function suggest({ moodText, mode, temperature, token }) {
  const r = await fetch("/api/suggest", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ moodText, mode, temperature })
  });
  return r.json();
}
export async function addFavorite(song, token) {
  const r = await fetch("/api/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ song })
  });
  return r.json();
}
export async function listFavorites(token) {
  const r = await fetch("/api/favorites", { headers: { Authorization: `Bearer ${token}` } });
  return r.json();
}
export async function evaluate(payload) {
  const r = await fetch("/api/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return r.json();
}
