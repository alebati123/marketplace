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
            Swal.fire("Aviso", 'Solo se permiten hasta 5 fotos.', "info");
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
            const res = await fetch('/api/categories');
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

    // Lógica para mostrar/ocultar input de ubicación personalizada
    const locationRadios = document.querySelectorAll('input[name="location_type"]');
    const locationCustomInput = document.getElementById('location_custom');

    locationRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'personalizado') {
                locationCustomInput.style.display = 'block';
                locationCustomInput.required = true;
            } else {
                locationCustomInput.style.display = 'none';
                locationCustomInput.required = false;
            }
        });
    });

    // Lógica para toggle "Producto" vs "Servicio"
    const radioPubType = document.querySelectorAll('input[name="pub_type"]');
    const grpCategoria = document.getElementById('grp-categoria');
    const grpEstado = document.getElementById('grp-estado');
    const inputCategoria = document.getElementById('categoria');
    const inputEstado = document.getElementById('estado');
    const inputTitulo = document.getElementById('titulo');
    const headerTitle = document.querySelector('.create-header h1');
    const submitBtn = document.querySelector('button[type="submit"]');

    const locHeader = document.getElementById('loc-header');
    const locRadio1 = document.getElementById('loc-radio-1');
    const locRadio2 = document.getElementById('loc-radio-2');
    const locCustom = document.getElementById('location_custom');
    const descHeader = document.getElementById('desc-header');
    const inputDesc = document.getElementById('descripcion');

    radioPubType.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'servicio') {
                grpCategoria.style.display = 'none';
                grpEstado.style.display = 'none';
                inputCategoria.required = false;
                inputEstado.required = false;
                if (inputTitulo) inputTitulo.placeholder = "Ej: Pintor, Albañilería, Flete";
                if (headerTitle) headerTitle.innerHTML = "Publicar un Servicio";
                if (submitBtn) submitBtn.innerHTML = "<i class='bx bx-check-circle'></i> Publicar Servicio Ahora";

                if (locHeader) locHeader.innerHTML = "Zonas de Cobertura / Atención *";
                if (locRadio1) locRadio1.innerHTML = "Solo de forma Remota / Online";
                if (locRadio2) locRadio2.innerHTML = "A domicilio en zonas específicas";
                if (locCustom) locCustom.placeholder = "Ej: Capital Federal, Mar del Plata y alrededores...";
                if (descHeader) descHeader.innerHTML = "Detalles del Servicio *";
                if (inputDesc) inputDesc.placeholder = "Describe tu experiencia, los trabajos que realizas, horarios de atención, etc.";
            } else {
                grpCategoria.style.display = 'block';
                grpEstado.style.display = 'block';
                inputCategoria.required = true;
                inputEstado.required = true;
                if (inputTitulo) inputTitulo.placeholder = "Ej: PlayStation 5 con 2 controles";
                if (headerTitle) headerTitle.innerHTML = "Publicar un Artículo";
                if (submitBtn) submitBtn.innerHTML = "<i class='bx bx-check-circle'></i> Publicar Artículo Ahora";

                if (locHeader) locHeader.innerHTML = "Ubicación de Entrega *";
                if (locRadio1) locRadio1.innerHTML = "Punto de encuentro a acordar";
                if (locRadio2) locRadio2.innerHTML = "Dirección / Barrio específico";
                if (locCustom) locCustom.placeholder = "Ej: Palermo Soho, cerca de Plaza Italia";
                if (descHeader) descHeader.innerHTML = "Descripción *";
                if (inputDesc) inputDesc.placeholder = "Describe los detalles, tiempo de uso, si tiene accesorios, etc.";
            }
        });
    });

    // Enviar formulario al backend
    const formCrear = document.getElementById('form-crear');

    formCrear.addEventListener('submit', async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('user_token');
        if (!token) {
            Swal.fire("Aviso", 'Debes iniciar sesión para publicar un artículo', "info");
            window.location.href = 'auth.html';
            return;
        }

        const pub_type = document.querySelector('input[name="pub_type"]:checked').value;
        const title = document.getElementById('titulo').value;

        // Si es servicio, forzamos la busqueda del ID de categoria "Servicios" en el DOM
        let category_id;
        let condition_status;

        if (pub_type === 'servicio') {
            const servicioOption = Array.from(categorySelect.options).find(opt => opt.text.trim().toLowerCase().includes('servicio'));
            if (!servicioOption) {
                Swal.fire("Aviso", "Error crítico: No se encontró la categoría 'Servicios' en la Base de Datos. Contacta al soporte.", "info");
                return;
            }
            category_id = parseInt(servicioOption.value);
            condition_status = 'nuevo'; // Los servicios no tienen "desgaste físico", se mapea como 'nuevo' por default
        } else {
            category_id = parseInt(categorySelect.value);
            condition_status = document.getElementById('estado').value;
        }

        const price = document.getElementById('precio').value;
        const description = document.getElementById('descripcion').value;

        // Nuevos campos de ubicación
        const location_type = document.querySelector('input[name="location_type"]:checked').value;
        const location_custom = location_type === 'personalizado' ? document.getElementById('location_custom').value : null;

        // Subir Imagen(es)
        let image_url = null;
        let additional_images = null;

        if (fileInput.files.length > 0) {
            const formData = new FormData();
            // Limita a 5 por seguridad front
            const filesToUpload = Array.from(fileInput.files).slice(0, 5);
            filesToUpload.forEach(file => {
                formData.append('images', file);
            });

            try {
                // Mostrar estado de carga (opcional visual)
                const submitBtn = formCrear.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = "<i class='bx bx-loader bx-spin'></i> Subiendo imágenes...";
                submitBtn.disabled = true;

                const uploadRes = await fetch('/api/media/imagen', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    // No seteamos Content-Type, fetch lo pone solo con FormData
                    body: formData
                });

                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();

                    if (uploadData.urls && uploadData.urls.length > 0) {
                        image_url = uploadData.urls[0]; // La primera es la principal
                        if (uploadData.urls.length > 1) {
                            additional_images = JSON.stringify(uploadData.urls.slice(1)); // El resto son extra
                        }
                    }
                } else {
                    const errorText = await uploadRes.text();
                    console.error("Error backend imagen:", errorText);
                    Swal.fire("Aviso", 'Error subiendo imágenes. Verifica Cloudinary. Usando imagen nula.', "info");
                }
            } catch (err) {
                console.error("Error fetch imagen:", err);
                Swal.fire("Aviso", 'No se pudo contactar al servidor para subir foto.', "info");
            } finally {
                // Restaurar botón
                const submitBtn = formCrear.querySelector('button[type="submit"]');
                submitBtn.innerHTML = "Publicar Artículo";
                submitBtn.disabled = false;
            }
        }

        // Enviar publicación a backend
        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title, category_id, description, price, condition_status, image_url, additional_images, location_type, location_custom
                })
            });

            if (res.ok) {
                Swal.fire("Aviso", '¡Publicación creada exitosamente!', "info");
                window.location.href = 'inicio.html';
            } else {
                const errData = await res.json();
                Swal.fire("Aviso", 'No se pudo crear: ' + (errData.error || JSON.stringify(errData)), "info");
            }

        } catch (error) {
            console.error("Error post producto:", error);
            Swal.fire("Aviso", 'Error crítico de red al guardar publicación.', "info");
        }

    });
});

