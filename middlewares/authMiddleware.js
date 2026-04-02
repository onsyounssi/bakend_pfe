// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");

// ─────────────────────────────────────────────
// Middleware: vérifier le token JWT
// ─────────────────────────────────────────────
exports.protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Accès non autorisé : token manquant" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: decoded.role,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
};

// ─────────────────────────────────────────────
// Middleware: autoriser selon le(s) rôle(s)
// ─────────────────────────────────────────────
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Accès refusé. Rôle requis : ${roles.join(', ')}`
      });
    }
    next();
  };
};