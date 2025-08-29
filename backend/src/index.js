import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { buildPrompt } from "./prompts.js";
import { searchTracks } from "./spotify.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seed = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "seedSongs.json"), "utf8"));
import { quickHeuristics, saveEvaluation } from "./evaluator.js";
import { issueToken, authMiddleware, addFavorite, getFavorites } from "./user.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5050;

// replace the previous openai initialization with a dynamic import (safe if package isn't installed)
let openai = null;
if (process.env.OPENAI_API_KEY) {
  try {
    const { OpenAI } = await import("openai");
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  } catch (err) {
    console.warn("openai package not installed or failed to load — continuing without AI:", err.message);
    openai = null;
  }
}

app.get("/health", (_, res) => res.json({ ok: true }));

// ---- User System (simple username-based token) ----
//post api
   
app.post("/api/login", (req, res) => {
  const { username } = req.body || {};
  if (!username) return res.status(400).json({ error: "username required" });
  const token = issueToken(username.trim());
  res.json({ token, username });
});  
  
app.get("/api/favorites", authMiddleware, (req, res) => {
  res.json({ favorites: getFavorites(req.user) });
});   
  
app.post("/api/favorites", authMiddleware, (req, res) => {
  const { song } = req.body || {};
  if (!song?.title || !song?.artist) return res.status(400).json({ error: "invalid song" });
  addFavorite(req.user, song);
  res.json({ ok: true });
});    

// ---- Suggestion endpoint (core) ----
app.post("/api/suggest", async (req, res) => {
  try {
    const { moodText = "", mode = "zero-shot", temperature = 0.7, top_p = 0.9, top_k } = req.body || {};
      const prompt = buildPrompt({ mode, moodText });

    let aiSongs = [];
    let rationale = "Used fallback seeds due to missing AI key.";
    if (openai) {
      // request concise JSON
      const resp = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature,
        top_p,
        ...(top_k !== undefined ? { top_k } : {}),
        messages: [
          { role: "system", content: "Return ONLY JSON with keys songs (array) and rationale (string)." },
          { role: "user", content: prompt }
        ]
      });
      const raw = resp.choices?.[0]?.message?.content?.trim() || "{}";
      const parsed = safeJson(raw);
      aiSongs = parsed.songs || [];
      rationale = parsed.rationale || "—";
    }

    // Fallback if AI empty
    if (!aiSongs.length) {
      const key = normalizeMood(moodText);
      aiSongs = seed[key] || seed["calm"];
      rationale = "Fallback: matched closest mood in seed list.";
    }

    // Enrich with Spotify links
    const enriched = await enrichWithSpotify(aiSongs);

    const heur = quickHeuristics(enriched);
    res.json({ songs: enriched, rationale, heuristics: heur, mode, temperature });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---- Evaluation logging  done ----
app.post("/api/evaluate", (req, res) => {
  const payload = req.body || {};
  saveEvaluation(payload);
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`Backend on http://localhost:${PORT}`));

// utils
// function
function normalizeMood(text) {
  const t = text.toLowerCase();
  if (t.includes("happy") || t.includes("joy")) return "happy";
  if (t.includes("sad") || t.includes("down")) return "sad";
  if (t.includes("energetic") || t.includes("gym")) return "energetic";
  return "calm";
}
function safeJson(str) {
  try { return JSON.parse(str); } catch { return {}; }
}
async function enrichWithSpotify(list) {
  // If AI returned songs with title+artist, search Spotify for each; else try one query by mood.
  const out = [];
  for (const s of list.slice(0, 5)) {
    const q = `${s.title} ${s.artist}`;
    const found = await searchTracks(q);
    if (found[0]) out.push({ ...s, spotifyUrl: found[0].spotifyUrl });
    else out.push({ ...s, spotifyUrl: null });
  }
  if (!out.length) {
    const fallback = await searchTracks("mood music");
    return fallback;
  }
  return out;
}
