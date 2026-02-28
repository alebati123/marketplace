const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = [
    'terminos.html', 'servicios.html', 'publicaciones.html',
    'producto.html', 'nosotros.html', 'crear-publicacion.html',
    'auth.html', 'inicio.html', 'admin.html', 'mis-publicaciones.html'
];

files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Match occurrences of 'Quiero Vender' accounting for whitespace
        const regex = /Quiero\s+Vender/g;

        let originalLength = content.length;

        if (regex.test(content)) {
            content = content.replace(regex, 'Publicar');
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated ${file}`);
        } else {
            console.log(`No changes needed for ${file}`);
        }
    }
});
