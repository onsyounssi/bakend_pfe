const errorMiddleware = (err, req, res, next) => {
    console.error("DEBUG ERROR:", err.stack);

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode).json({
        message: err.message,
        // On n'envoie le stack trace qu'en développement (facultatif ici)
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = errorMiddleware;
