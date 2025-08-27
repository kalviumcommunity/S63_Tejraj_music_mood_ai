import jwt from "jsonwebtoken";
 System-and-user-prompt
const users = new Map();
export function issueToken(username) {
  if (!users.has(username)) users.set(username, { favorites: [] });
  return jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "7d" });
}
export function authMiddleware(req,res,next){
  const t = (req.headers.authorization||"").startsWith("Bearer ") ? req.headers.authorization.slice(7) : null;
  if (!t) return res.status(401).json({error:"No token"});
  try { req.user = jwt.verify(t, process.env.JWT_SECRET).username; next(); } catch { res.status(401).json({error:"Bad token"}); }
}
export function addFavorite(username, song){ users.get(username).favorites.push(song) }
export function getFavorites(username){ return users.get(username)?.favorites || [] }
=======

const JWT_SECRET = process.env.JWT_SECRET || (() => {
  console.warn("WARNING: JWT_SECRET not set. Falling back to development secret.");
  return "dev-secret";
})();

const favorites = new Map();

export function issueToken(username) {
  if (!username) throw new Error("username required");
  return jwt.sign({ username }, JWT_SECRET, { expiresIn: "30d" });
}

export function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) return res.status(401).json({ error: "missing token" });
  const token = m[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload.username;
    next();
  } catch (e) {
    return res.status(401).json({ error: "invalid token" });
  }
}

export function addFavorite(username, song) {
  if (!favorites.has(username)) favorites.set(username, []);
  favorites.get(username).push(song);
}

export function getFavorites(username) {
  return favorites.get(username) || [];
}
 main
