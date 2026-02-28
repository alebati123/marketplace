const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const authMiddleware = require('../middleware/auth');
const fs = require('fs');
const os = require('os');

// Configuración de Multer para almacenar temporalmente en el servidor
const upload = multer({ dest: os.tmpdir() });

router.post('/imagen', authMiddleware, upload.array('images', 5), async (req, res) => {
    try {
        console.log("Recibida petición de subida de múltiples imágenes");
        console.log("Archivos recibidos:", req.files?.length);

        if (!req.files || req.files.length === 0) {
            console.error("Error: no se detectaron archivos");
            return res.status(400).json({ error: 'No se subió ninguna imagen' });
        }

        const uploadPromises = req.files.map(async (file) => {
            console.log(`Intentando subir ${file.originalname} a Cloudinary...`);
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'marketplace'
            });
            // Eliminar archivo temporal local
            fs.unlinkSync(file.path);
            return result.secure_url;
        });

        const urls = await Promise.all(uploadPromises);
        console.log("Imágenes subidas con éxito:", urls);

        res.json({
            message: 'Imágenes subidas exitosamente',
            urls: urls // Devolvemos el array de URLs
        });

    } catch (error) {
        console.error("Error subiendo imágenes:", error);
        res.status(500).json({ error: 'Error al subir las imágenes a la nube' });
    }
});

module.exports = router;
