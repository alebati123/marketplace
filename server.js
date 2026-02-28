// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Configuración de variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares

// 1. Optimización: Comprime las respuestas del servidor para sitios más rápidos en móviles
app.use(compression());

// 2. Seguridad: Oculta headers sensibles de Express y protege contra ataques XSS
app.use(helmet({
    contentSecurityPolicy: false, // Apagado temporalmente para no bloquear CDNs externas mágicamente
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false, // CLAVE: Permite que el Popup de Google Auth se comunique con nuestra pestaña
    crossOriginResourcePolicy: false
}));

// 3. Seguridad: Limita las peticiones repetitivas (Prevención de DDoS y Fuerza Bruta)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 500, // Limita cada IP a 500 peticiones por ventana
    message: { error: 'Demasiadas peticiones desde esta IP. Por favor, intenta de nuevo más tarde.' }
});
app.use('/api/', apiLimiter);

// 4. Configuración Base (Añadiendo límite de tamaño estricto para evitar ataques de memoria)
app.use(cors({
    origin: '*', // Permitir peticiones desde cualquier origen (Live Server, etc)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Archivos estáticos
// Servimos toda la raíz del proyecto front-end temporalmente o la carpeta public
app.use(express.static(__dirname));

// Importar Rutas
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const uploadRoutes = require('./routes/upload');
const categoryRoutes = require('./routes/categories');
const userRoutes = require('./routes/users');
const favoritesRoutes = require('./routes/favorites');

// Rutas base

app.get('/api/health', (req, res) => {
    res.json({ message: 'API del Marketplace funcionando correctamente' });
});

// Redirigir el tráfico raíz (/) hacia el archivo inicio.html
app.get('/', (req, res) => {
    res.redirect('/inicio.html');
});

// Registrar Rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/favorites', favoritesRoutes);

// Manejo de roles/accesos
app.use((err, req, res, next) => {
    // Este es un placeholder para un middleware de manejo de errores o roles
    // La línea `favoritesRoutes);` en la instrucción original parece ser un error tipográfico.
    // Se ha eliminado para mantener la sintaxis correcta.
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    console.log(`Accede a la web desde: http://localhost:${PORT}/inicio.html`);
});
