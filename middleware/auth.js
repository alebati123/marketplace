const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Leer el token del header (formato: "Bearer token...")
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token.' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const secret = process.env.JWT_SECRET || 'secret_fallback_123';
        const decoded = jwt.verify(token, secret);

        // Agregar usuario decodificado a la request
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido o expirado.' });
    }
};
