// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Configuración de variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
    origin: '*', // Permitir peticiones desde cualquier origen (Live Server, etc)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos
// Servimos toda la raíz del proyecto front-end temporalmente o la carpeta public
app.use(express.static(__dirname));

// Importar Rutas
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const uploadRoutes = require('./routes/upload');
const categoryRoutes = require('./routes/categories');

// Rutas base
app.get('/api/health', (req, res) => {
    res.json({ message: 'API del Marketplace funcionando correctamente' });
});

// Registrar Rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/media', uploadRoutes);
app.use('/api/categories', categoryRoutes);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    console.log(`Accede a la web desde: http://localhost:${PORT}/inicio.html`);
});
