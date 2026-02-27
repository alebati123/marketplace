/**
 * Lógica específica para inicio.html
 */

document.addEventListener('DOMContentLoaded', () => {
    // Buscar en publicaciones
    const searchButton = document.querySelector('.search-bar button');
    const searchInput = document.querySelector('.search-bar input');

    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            window.location.href = `publicaciones.html?q=${encodeURIComponent(query)}`;
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchButton.click();
        }
    });

    // Mapeo básico de iconos según slug (fallback genérico)
    const getCategoryIcon = (slug) => {
        const icons = {
            'tecnologia': 'bx bx-mobile-alt', 'electronica': 'bx bx-mobile-alt',
            'hogar': 'bx bx-home', 'vehiculos': 'bx bx-car',
            'ropa': 'bx bxs-t-shirt', 'indumentaria': 'bx bxs-t-shirt',
            'deportes': 'bx bx-football', 'muebles': 'bx bx-chair',
            'herramientas': 'bx bx-wrench', 'otros': 'bx bx-package'
        };
        for (let key in icons) {
            if (slug.includes(key)) return icons[key];
        }
        return 'bx bx-category'; // genérico
    };

    // Cargar categorías dinámicas
    const loadCategories = async () => {
        const grid = document.getElementById('categorias-grid');
        if (!grid) return;

        try {
            const res = await fetch('http://127.0.0.1:3000/api/categories');
            const data = await res.json();
            if (res.ok) {
                grid.innerHTML = '';
                if (data.length === 0) {
                    grid.innerHTML = '<p style="grid-column: 1/-1;">No hay categorías configuradas.</p>';
                    return;
                }
                data.forEach(cat => {
                    const iconClass = getCategoryIcon(cat.slug);
                    const link = document.createElement('a');
                    link.href = `publicaciones.html?cat=${cat.slug}`;
                    link.className = 'category-card';
                    link.innerHTML = `
                        <div class="cat-icon"><i class='${iconClass}'></i></div>
                        <h3>${cat.name}</h3>
                    `;
                    grid.appendChild(link);
                });
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            grid.innerHTML = '<p style="grid-column: 1/-1;">Error cargando categorías.</p>';
        }
    };
    loadCategories();

    // Cargar publicaciones destacadas
    const loadFeaturedProducts = async () => {
        const grid = document.getElementById('productos-destacados');
        if (!grid) return;

        try {
            const res = await fetch('http://127.0.0.1:3000/api/products');
            const data = await res.json();

            if (res.ok) {
                grid.innerHTML = '';
                // Mostrar solo los primeros 4 para el home
                const featured = data.slice(0, 4);

                if (featured.length === 0) {
                    grid.innerHTML = '<p>No hay publicaciones recientes.</p>';
                    return;
                }

                featured.forEach(p => {
                    let conditionLabel = p.condition_status === 'nuevo' ? 'Nuevo' : (p.condition_status === 'usado' ? 'Usado' : 'Como Nuevo');
                    let conditionClass = p.condition_status === 'nuevo' ? 'new' : (p.condition_status === 'usado' ? 'used' : '');
                    const imageUrl = p.image_url || 'https://placehold.co/400x300?text=Sin+Imagen';

                    const formatPrice = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(p.price);

                    const card = document.createElement('div');
                    card.className = 'product-card';
                    // Hacer la tarjeta interactiva
                    card.innerHTML = `
                        <a href="producto.html?id=${p.id}" style="text-decoration: none; color: inherit; display: block;">
                            <div class="product-img">
                                <span class="badge condition ${conditionClass}">${conditionLabel}</span>
                                <img src="${imageUrl}" alt="${p.title}">
                            </div>
                            <div class="product-info">
                                <span class="product-category">${p.category_name}</span>
                                <h3 class="product-title">${p.title}</h3>
                                <div class="product-price">${formatPrice}</div>
                                <div class="product-footer">
                                    <span class="seller"><i class='bx bx-user'></i> ${p.seller_name}</span>
                                </div>
                            </div>
                        </a>
                    `;
                    grid.appendChild(card);
                });
            } else {
                grid.innerHTML = '<p>No se pudieron cargar los productos.</p>';
            }
        } catch (err) {
            console.error(err);
            grid.innerHTML = '<p>Error de conexión con el catálogo.</p>';
        }
    };

    loadFeaturedProducts();
});
