/**
 * Lógica para cargar publicaciones favoritas del usuario actual
 */

document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('productos-galeria');
    const resultsCount = document.querySelector('.results-count');

    const fetchFavorites = async () => {
        try {
            const token = localStorage.getItem('user_token');
            if (!token) {
                gallery.innerHTML = '<div class="no-results"><h3>Inicia sesión para ver tus favoritos.</h3><p>Guarda los artículos que más te gusten para encontrarlos rápido.</p></div>';
                resultsCount.textContent = `(0)`;
                return;
            }

            const response = await fetch('/api/favorites', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('user_token');
                    window.location.href = 'auth.html';
                }
                throw new Error('Error al obtener favoritos');
            }

            const favorites = await response.json();
            renderFavorites(favorites);

        } catch (error) {
            console.error('Error cargando favoritos:', error);
            gallery.innerHTML = '<div class="no-results"><h3>Error del servidor</h3><p>No se pudieron cargar tus favoritos. Intenta de nuevo más tarde.</p></div>';
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0
        }).format(price);
    };

    const renderFavorites = (products) => {
        gallery.innerHTML = '';
        resultsCount.textContent = `(${products.length})`;

        if (products.length === 0) {
            gallery.innerHTML = `
                <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 4rem;">
                    <i class='bx bx-heart' style="font-size: 4rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <h3>No tienes favoritos guardados</h3>
                    <p>Explora el catálogo y usa el corazón para guardar lo que te interesa.</p>
                    <a href="publicaciones.html" class="btn btn-primary" style="margin-top: 1rem;">Ir al Catálogo</a>
                </div>
            `;
            return;
        }

        products.forEach(p => {
            let conditionLabel = '';
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

            const card = document.createElement('a');
            card.href = `producto.html?id=${p.id}`;
            card.className = 'product-card';

            // Re-usamos toggleFavorite asincrono. Como ya están en favoritos, renderizan "Rojo".
            // Si el usuario da a la X o elimina, puede recargar la pagina.
            card.innerHTML = `
                <div class="product-img" style="position: relative;">
                    <button class="btn-favorite" title="Quitar de favoritos" style="position: absolute; top: 10px; right: 10px; background: rgba(255,255,255,0.9); border: none; border-radius: 50%; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.2); z-index: 10;" 
                        onclick="event.preventDefault(); window.toggleFavorite(${p.id}, this.querySelector('i')).then(() => window.location.reload())">
                        <i class='bx bxs-heart' style="font-size: 1.4rem; color: #e74c3c;"></i>
                    </button>
                    ${conditionLabel ? `<span class="badge condition ${conditionClass}">${conditionLabel}</span>` : ''}
                    <img src="${imageUrl}" alt="${p.title}">
                </div>
                <div class="product-info">
                    <span class="product-category">${p.category_name}</span>
                    <h3 class="product-title">${p.title}</h3>
                    <div class="product-price">${formatPrice(p.price)}</div>
                    <div class="product-footer">
                        <span class="seller"><i class='bx bx-user'></i> ${p.seller_name}</span>
                        <span class="date" style="font-size: 0.8rem; color: #999;"><i class='bx bx-time-five'></i> Guardado</span>
                    </div>
                </div>
            `;
            gallery.appendChild(card);
        });
    };

    // Load en startup
    fetchFavorites();
});

