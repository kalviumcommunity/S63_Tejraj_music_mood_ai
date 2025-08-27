// Tiny evaluation logger + simple heuristics.
// Stores feedback & runs in-memory checks before saving.

import fs from "fs";
const EVAL_PATH = new URL("../data/evals.json", import.meta.url);

export function quickHeuristics(songs = []) {
  const itemCount = songs.length;
  const titleArtistOK = songs.every(
    (s) => s.title && s.artist && typeof s.title === "string" && typeof s.artist === "string"
  );
  return { itemCount, titleArtistOK };
}

export function saveEvaluation(record) {
  let db = [];
  try {
    db = JSON.parse(fs.readFileSync(EVAL_PATH, "utf8"));
  } catch {}
  db.push({ ...record, ts: new Date().toISOString() });
  fs.writeFileSync(EVAL_PATH, JSON.stringify(db, null, 2), "utf8");
}
