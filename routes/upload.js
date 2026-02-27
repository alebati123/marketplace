const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const authMiddleware = require('../middleware/auth');
const fs = require('fs');
const os = require('os');

// Configuración de Multer para almacenar temporalmente en el servidor
const upload = multer({ dest: os.tmpdir() });

router.post('/imagen', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        console.log("Recibida petición de subida de imagen");
        console.log("Datos del body:", req.body);
        console.log("Archivo recibido:", req.file);

        if (!req.file) {
            console.error("Error: no se detectó ningún archivo");
            return res.status(400).json({ error: 'No se subió ninguna imagen' });
        }

        // Subir a Cloudinary
        console.log("Intentando subir a Cloudinary...");
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'marketplace'
        });

        console.log("Imagen subida con éxito:", result.secure_url);

        // Eliminar archivo temporal
        fs.unlinkSync(req.file.path);

        res.json({
            message: 'Imagen subida exitosamente',
            url: result.secure_url
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al subir la imagen a la nube' });
    }
});

module.exports = router;
