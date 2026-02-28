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

        // Match both active and non-active catalogue tab, accounting for whitespace
        const regex1 = /<li>\s*<a href="publicaciones\.html"\s+class="nav-item">\s*Catálogo\s*<\/a>\s*<\/li>/g;
        const regex2 = /<li>\s*<a href="publicaciones\.html"\s+class="nav-item active">\s*Catálogo\s*<\/a>\s*<\/li>/g;

        const replacement1 = `<li><a href="publicaciones.html" class="nav-item">Catálogo</a></li>\n            <li><a href="servicios.html" class="nav-item">Servicios</a></li>`;
        const replacement2 = `<li><a href="publicaciones.html" class="nav-item active">Catálogo</a></li>\n            <li><a href="servicios.html" class="nav-item">Servicios</a></li>`;

        let originalLength = content.length;

        // Only replace if 'servicios.html' isn't already there right next to it
        if (!content.includes('href="servicios.html"')) {
            content = content.replace(regex1, replacement1);
            content = content.replace(regex2, replacement2);
        }

        if (content.length !== originalLength) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated ${file}`);
        } else {
            console.log(`No changes needed for ${file}`);
        }
    }
});
