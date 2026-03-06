const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = [
    'terminos.html', 'servicios.html', 'publicaciones.html',
    'producto.html', 'nosotros.html', 'crear-publicacion.html',
    'auth.html', 'inicio.html', 'admin.html', 'mis-publicaciones.html',
    'mis-favoritos.html', 'perfil.html'
];

files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Buscar el bloque <footer class="footer">...</footer> y reemplazarlo
        // Usamos una expresión regular que coincida con <footer class="footer"> y capture todo hasta </footer> usando non-greedy (.*?)
        // y con flag 's' (dotAll) para que el punto coincida con saltos de línea.
        const footerRegex = /<footer class="footer">.*?<\/footer>/s;

        const replacement = `<footer class="footer"></footer>`;

        const newContent = content.replace(footerRegex, replacement);

        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Updated footer in ${file}`);
        } else {
            console.log(`No change needed for ${file}`);
        }
    }
});
