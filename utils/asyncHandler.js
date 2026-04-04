/**
 * asyncHandler - Utilitaire pour envelopper les fonctions asynchrones 
 * et transmettre les erreurs au middleware global.
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
