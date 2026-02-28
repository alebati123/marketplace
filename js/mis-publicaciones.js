/**
 * Lógica para la vista de "Mis Publicaciones"
 */

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('user_token');
    if (!token) {
        window.location.href = 'auth.html';
        return;
    }

    const gallery = document.getElementById('mis-productos-galeria');
    const modal = document.getElementById('edit-modal');
    const closeBtn = document.getElementById('close-edit-modal');
    const editForm = document.getElementById('edit-product-form');

    // Lógica para mostrar/ocultar input de ubicación personalizada en el modal
    const locationRadios = document.querySelectorAll('input[name="edit_location_type"]');
    const locationCustomInput = document.getElementById('edit-location-custom');

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

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price);
    };

    const fetchMyProducts = async () => {
        try {
            const res = await fetch('/api/products/user/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();

            if (res.ok) {
                renderProducts(data);
            } else {
                gallery.innerHTML = '<p>Error al cargar tus publicaciones.</p>';
                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem('user_token');
                    localStorage.removeItem('user_data');
                    localStorage.removeItem('user_name');
                    window.location.href = 'auth.html';
                }
            }
        } catch (error) {
            console.error('Error de red', error);
            gallery.innerHTML = '<p>No se pudo conectar con el servidor.</p>';
        }
    };

    const renderProducts = (products) => {
        gallery.innerHTML = '';

        if (products.length === 0) {
            gallery.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No has publicado ningún artículo todavía.</p>';
            return;
        }

        products.forEach(p => {
            let conditionLabel = p.condition_status;
            let conditionClass = '';
            if (p.condition_status === 'nuevo') {
                conditionLabel = 'Nuevo';
                conditionClass = 'new';
            } else if (p.condition_status === 'usado') {
                conditionLabel = 'Usado';
                conditionClass = 'used';
            } else {
                conditionLabel = 'Como Nuevo';
            }

            const imageUrl = p.image_url || 'https://placehold.co/300x200?text=Sin+Imagen';

            const card = document.createElement('div');
            card.className = 'product-card';

            // Para poder acceder a estos datos en el modal
            card.dataset.id = p.id;
            card.dataset.title = p.title;
            card.dataset.price = p.price;
            card.dataset.description = p.description;
            card.dataset.location_type = p.location_type || 'acordado';
            card.dataset.location_custom = p.location_custom || '';

            card.innerHTML = `
                <div class="product-img">
                    <span class="badge condition ${conditionClass}">${conditionLabel}</span>
                    <img src="${imageUrl}" alt="${p.title}">
                </div>
                <div class="product-info">
                    <span class="product-category">${p.category_name}</span>
                    <h3 class="product-title">${p.title}</h3>
                    <div class="product-price">${formatPrice(p.price)}</div>
                    <div class="actions-footer">
                        <button class="btn-edit" onclick="openEditModal(${p.id})">Editar</button>
                        <button class="btn-delete" onclick="deleteProduct(${p.id})">Eliminar</button>
                    </div>
                </div>
            `;
            gallery.appendChild(card);
        });
    };

    // Funciones Globales para los botones generados dinámicamente
    window.openEditModal = (id) => {
        const card = document.querySelector(`.product-card[data-id="${id}"]`);
        if (!card) return;

        document.getElementById('edit-id').value = id;
        document.getElementById('edit-title').value = card.dataset.title;
        document.getElementById('edit-price').value = card.dataset.price;
        document.getElementById('edit-desc').value = card.dataset.description;

        // Configurar Ubicación
        const locType = card.dataset.location_type;
        const locCustom = card.dataset.location_custom;
        const locCustomInput = document.getElementById('edit-location-custom');

        document.querySelector(`input[name="edit_location_type"][value="${locType}"]`).checked = true;
        if (locType === 'personalizado') {
            locCustomInput.style.display = 'block';
            locCustomInput.required = true;
            locCustomInput.value = locCustom;
        } else {
            locCustomInput.style.display = 'none';
            locCustomInput.required = false;
            locCustomInput.value = '';
        }

        modal.style.display = 'block';
    };

    window.deleteProduct = async (id) => {
        if (!confirm('¿Estás seguro de que deseas eliminar permanentemente esta publicación?')) {
            return;
        }

        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                alert('Publicación eliminada correctamente.');
                fetchMyProducts(); // Recargar grilla
            } else {
                const data = await res.json();
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error(error);
            alert('Fallo de conexión al eliminar.');
        }
    };

    // Cerrar Modal
    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    // Enviar edición
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('edit-id').value;
        const newTitle = document.getElementById('edit-title').value;
        const newPrice = document.getElementById('edit-price').value;
        const newDesc = document.getElementById('edit-desc').value;

        const locType = document.querySelector('input[name="edit_location_type"]:checked').value;
        const locCustom = locType === 'personalizado' ? document.getElementById('edit-location-custom').value : null;

        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: newTitle,
                    price: newPrice,
                    description: newDesc,
                    location_type: locType,
                    location_custom: locCustom
                })
            });

            if (res.ok) {
                alert('¡Publicación actualizada con éxito!');
                modal.style.display = 'none';
                fetchMyProducts();
            } else {
                const data = await res.json();
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error(error);
            alert('Fallo de conexión al guardar cambios.');
        }
    });

    // Iniciar
    fetchMyProducts();
});
