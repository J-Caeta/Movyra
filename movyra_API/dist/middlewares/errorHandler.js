"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, req, res, next) {
    console.error('❌ Error caught by global handler:', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Erro interno do servidor';
    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
        errors: err.errors || null
    });
}
