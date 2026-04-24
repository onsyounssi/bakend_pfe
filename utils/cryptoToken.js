const crypto = require('crypto');

/** Token URL-safe à mettre dans le lien (non hashé dans l’email) */
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

/** Version à stocker en base (hash SHA-256 du token) */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = { generateResetToken, hashToken };
