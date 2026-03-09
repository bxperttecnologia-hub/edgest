const { verifyToken } = require('../auth');

function authMiddleware(req, res, next){
  const auth = req.headers["authorization"];
  if (!auth) return res.status(401).json({ error: 'no_token' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'bad_auth' });
  const token = parts[1];
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'invalid_token' });
  req.user = payload;
  next();
}

module.exports = authMiddleware;
