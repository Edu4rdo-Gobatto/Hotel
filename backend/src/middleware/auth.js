import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'hotel-mosquito-secret';

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '8h' });
}

export function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token ausente.' });
  }
  try {
    req.user = jwt.verify(auth.slice(7), SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}

export function gerenteOnly(req, res, next) {
  if (req.user?.perfil?.toLowerCase() !== 'gerente') {
    return res.status(403).json({ error: 'Acesso restrito a gerentes.' });
  }
  next();
}
