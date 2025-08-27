import React, { useState } from "react";
import { login, suggest, addFavorite, listFavorites, evaluate } from "./api";

const MODES = [
  "zero-shot",
  "one-shot",
  "multi-shot",
  "chain-of-thought",
  "dynamic-prompt"
];

export default function App() {
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [moodText, setMoodText] = useState("happy and nostalgic");
  const [mode, setMode] = useState("zero-shot");
  const [temperature, setTemperature] = useState(0.7);
  const [songs, setSongs] = useState([]);
  const [rationale, setRationale] = useState("");
  const [heur, setHeur] = useState({});
  const [favorites, setFavorites] = useState([]);

  async function doLogin() {
    const r = await login(username.trim() || "guest");
    setToken(r.token);
    refreshFavs(r.token);
  }
  async function refreshFavs(tok = token) {
    if (!tok) return;
    const r = await listFavorites(tok);
    setFavorites(r.favorites || []);
  }
  async function getSuggestions() {
    const r = await suggest({ moodText, mode, temperature, token });
    setSongs(r.songs || []);
    setRationale(r.rationale || "");
    setHeur(r.heuristics || {});
    // log automatic eval
    await evaluate({
      mode,
      temperature,
      moodText,
      heuristics: r.heuristics,
      count: (r.songs || []).length
    });
  }
  async function fav(song) {
    if (!token) return alert("Login first");
    await addFavorite(song, token);
    refreshFavs();
  }

  return (
    <div style={{ fontFamily: "Inter, system-ui", maxWidth: 900, margin: "40px auto" }}>
      <h1>🎶 AI Mood → Song Suggester</h1>

      <section style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr 1fr" }}>
        <div>
          <label>Mood text</label>
          <textarea rows={3} value={moodText} onChange={(e)=>setMoodText(e.target.value)} style={{width:"100%"}}/>
        </div>
        <div>
          <label>Prompting mode</label>
          <select value={mode} onChange={(e)=>setMode(e.target.value)} style={{width:"100%", height: 36}}>
            {MODES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <label style={{display:"block", marginTop:12}}>Temperature: {temperature}</label>
          <input type="range" min="0" max="1" step="0.1" value={temperature} onChange={(e)=>setTemperature(Number(e.target.value))}/>
          <button onClick={getSuggestions} style={{marginTop:12}}>Get Suggestions</button>
        </div>
        <div>
          <label>Username</label>
          <input value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="e.g. tejraj" style={{width:"100%", height: 32}}/>
          <button onClick={doLogin} style={{marginTop:8}}>Login</button>
          <div style={{marginTop:12}}>
            <strong>Favorites ({favorites.length})</strong>
            <ul>
              {favorites.map((f,i)=><li key={i}>{f.title} — {f.artist}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <hr style={{margin:"20px 0"}}/>

      <p><em>Rationale:</em> {rationale}</p>
      <p><em>Heuristics:</em> items={heur.itemCount} | titleArtistOK={String(heur.titleArtistOK)}</p>

      <ul>
        {songs.map((s, i) => (
          <li key={i} style={{marginBottom:8}}>
            {s.title} — {s.artist} {s.spotifyUrl && <a href={s.spotifyUrl} target="_blank">Play</a>}
            <button style={{marginLeft:8}} onClick={()=>fav(s)}>★ Favorite</button>
            <button style={{marginLeft:8}} onClick={()=>evaluate({ vote:"up", song:s, mode, temperature })}>👍</button>
            <button style={{marginLeft:4}} onClick={()=>evaluate({ vote:"down", song:s, mode, temperature })}>👎</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
