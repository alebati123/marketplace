/**
 * Logica JS para Crear Publicación
 */

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fotos-input');
    const previewContainer = document.getElementById('preview-container');

    // Manejo visual de carga de imagen para el preview (solo visual)
    fileInput.addEventListener('change', function (e) {
        const files = Array.from(e.target.files);

        // Limpiar para este ejemplo basico
        previewContainer.innerHTML = '';

        if (files.length > 5) {
            alert('Solo se permiten hasta 5 fotos.');
            fileInput.value = ''; // reset
            return;
        }

        files.forEach((file, index) => {
            if (!file.type.startsWith('image/')) { return; }

            const reader = new FileReader();

            reader.onload = function (e) {
                const imgWrap = document.createElement('div');
                imgWrap.style.cssText = `
                    width: 100px; height: 100px; 
                    border-radius: 8px; overflow: hidden; 
                    position: relative; border: 1px solid #E2E8F0;
                `;

                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';

                // Boton eliminar foto del preview (simulado)
                const deleteBtn = document.createElement('div');
                deleteBtn.innerHTML = "<i class='bx bx-x'></i>";
                deleteBtn.style.cssText = `
                    position: absolute; top: 4px; right: 4px; 
                    background: rgba(0,0,0,0.6); color: white; border-radius: 50%; 
                    width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;
                    cursor: pointer; font-size: 14px;
                `;
                deleteBtn.onclick = () => imgWrap.remove(); // Solo quita visualmente rapido

                if (index === 0) {
                    const badge = document.createElement('span');
                    badge.textContent = "Principal";
                    badge.style.cssText = `
                        position: absolute; bottom: 0; left: 0; width: 100%; 
                        background: rgba(79, 70, 229, 0.9); color: white; 
                        font-size: 10px; text-align: center; padding: 2px 0;
                    `;
                    imgWrap.appendChild(badge);
                }

                imgWrap.appendChild(img);
                imgWrap.appendChild(deleteBtn);
                previewContainer.appendChild(imgWrap);
            }

            reader.readAsDataURL(file);
        });
    });

    // Cargar categorías dinámicamente desde la BD
    const categorySelect = document.getElementById('categoria');
    const loadCategories = async () => {
        try {
            const res = await fetch('http://127.0.0.1:3000/api/categories');
            const categories = await res.json();

            categorySelect.innerHTML = '<option value="" disabled selected>Selecciona una...</option>';
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id; // pasamos el ID real de SQL
                option.textContent = cat.name;
                categorySelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error cargando categorías:', error);
            categorySelect.innerHTML = '<option value="" disabled selected>Error al cargar categorías</option>';
        }
    };
    loadCategories();

    // Enviar formulario al backend
    const formCrear = document.getElementById('form-crear');

    formCrear.addEventListener('submit', async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('user_token');
        if (!token) {
            alert('Debes iniciar sesión para publicar un artículo');
            window.location.href = 'auth.html';
            return;
        }

        // Obtener datos del formulario
        const title = document.getElementById('titulo').value;
        const category_id = parseInt(categorySelect.value); // Obtenemos el ID numérico directamente

        const condition_status = document.getElementById('estado').value;
        const price = document.getElementById('precio').value;
        const description = document.getElementById('descripcion').value;

        // Subir Imagen (si hay alguna)
        let image_url = null;
        if (fileInput.files.length > 0) {
            const formData = new FormData();
            formData.append('image', fileInput.files[0]); // Solo primera foto por ahora

            try {
                // Mostrar estado de carga (opcional visual)
                const submitBtn = formCrear.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = "<i class='bx bx-loader bx-spin'></i> Subiendo imagen...";
                submitBtn.disabled = true;

                const uploadRes = await fetch('http://127.0.0.1:3000/api/media/imagen', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    image_url = uploadData.url;
                } else {
                    const errorText = await uploadRes.text();
                    console.error("Error backend imagen:", errorText);
                    alert('Error subiendo imagen. Verifica Cloudinary. Usando imagen nula.');
                }
            } catch (err) {
                console.error("Error fetch imagen:", err);
                alert('No se pudo contactar al servidor para subir foto.');
            } finally {
                // Restaurar botón
                const submitBtn = formCrear.querySelector('button[type="submit"]');
                submitBtn.innerHTML = "Publicar Artículo";
                submitBtn.disabled = false;
            }
        }

        // Enviar publicación a backend
        try {
            const res = await fetch('http://127.0.0.1:3000/api/products', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title, category_id, description, price, condition_status, image_url
                })
            });

            if (res.ok) {
                alert('¡Publicación creada exitosamente!');
                window.location.href = 'inicio.html';
            } else {
                const errData = await res.json();
                alert('No se pudo crear: ' + (errData.error || JSON.stringify(errData)));
            }

        } catch (error) {
            console.error("Error post producto:", error);
            alert('Error crítico de red al guardar publicación.');
        }

    });
});
