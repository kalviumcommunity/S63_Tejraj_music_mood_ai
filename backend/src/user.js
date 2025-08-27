import jwt from "jsonwebtoken";
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
