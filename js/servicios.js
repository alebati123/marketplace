/**
 * Lógica para cargar y filtrar publicaciones dinámicas en el catálogo
 */

document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('productos-galeria');
    const resultsCount = document.querySelector('.results-count');

    // Filtros UI
    // Filtros UI fijos
    const searchInput = document.getElementById('filter-search');
    const conditionCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    const sortSelect = document.querySelector('.sort-by select');
    const btnApplyFilters = document.querySelector('.filter-group button');
    const priceMinInput = document.querySelectorAll('.price-range input')[0];
    const priceMaxInput = document.querySelectorAll('.price-range input')[1];
    const toggleFiltersBtn = document.getElementById('toggle-filters-btn');
    const sidebarFilters = document.querySelector('.sidebar-filters');
    const categoryList = document.getElementById('category-list');

    // Variable para los radios dinámicos
    let categoryRadios = [];

    if (toggleFiltersBtn) {
        toggleFiltersBtn.addEventListener('click', () => {
            sidebarFilters.classList.toggle('show');
        });
    }

    // Estado actual de los filtros
    let currentFilters = {
        search: '',
        category: 'all',
        condition: '',
        sort: '',
        min_price: '',
        max_price: ''
    };

    // Inicializar desde URL si hay query '?q=' o '?cat='
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('q')) {
        currentFilters.search = urlParams.get('q');
        searchInput.value = currentFilters.search;
    }
    if (urlParams.has('cat')) {
        currentFilters.category = urlParams.get('cat');
    }

    const fetchProducts = async () => {
        try {
            let url = '/api/products';
            const params = new URLSearchParams();
            if (currentFilters.search) params.append('search', currentFilters.search);
            // Forza siempre a buscar bajo la manta de 'servicios'
            params.append('category', 'servicios');

            if (currentFilters.sort) params.append('sort', currentFilters.sort);
            if (currentFilters.min_price) params.append('min_price', currentFilters.min_price);
            if (currentFilters.max_price) params.append('max_price', currentFilters.max_price);

            let queryUrl = `${url}?${params.toString()}`;

            const res = await fetch(queryUrl);
            const data = await res.json();

            if (res.ok) {
                renderProducts(data);
            } else {
                console.error('Error fetching products', data);
                gallery.innerHTML = '<p>Error al cargar el catálogo.</p>';
            }
        } catch (error) {
            console.error('Error de red', error);
            gallery.innerHTML = '<p>No se pudo conectar con el servidor.</p>';
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price);
    };

    const renderProducts = (products) => {
        gallery.innerHTML = '';
        resultsCount.textContent = `(${products.length})`;

        if (products.length === 0) {
            gallery.innerHTML = '<p style="grid-column: 1/-1;">No se encontraron productos con estos filtros.</p>';
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

            const card = document.createElement('a');
            card.href = `producto.html?id=${p.id}`;
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-img">
                    <img src="${imageUrl}" alt="${p.title}">
                </div>
                <div class="product-info">
                    <span class="product-category">${p.category_name}</span>
                    <h3 class="product-title">${p.title}</h3>
                    <div class="product-price">${formatPrice(p.price)}</div>
                    <div class="product-footer">
                        <span class="seller"><i class='bx bx-user'></i> ${p.seller_name}</span>
                    </div>
                </div>
            `;
            gallery.appendChild(card);
        });
    };

    // Actualizar filtros desde DOM
    const applyFilters = () => {
        currentFilters.search = searchInput ? searchInput.value.trim() : '';

        // Ordenamiento
        const sortVal = sortSelect ? sortSelect.value : '';
        if (sortVal === 'Menor precio') currentFilters.sort = 'price_asc';
        else if (sortVal === 'Mayor precio') currentFilters.sort = 'price_desc';
        else currentFilters.sort = '';

        // Precio
        currentFilters.min_price = priceMinInput ? (priceMinInput.value || '') : '';
        currentFilters.max_price = priceMaxInput ? (priceMaxInput.value || '') : '';

        fetchProducts();
    };

    const loadCategoriesAndInit = () => {
        // No cargamos subcategorias dinamicamente por ahora, 
        // ya que la vista "Servicios" no usa categorias paralelas aun.
        if (sortSelect) sortSelect.addEventListener('change', applyFilters);
        if (btnApplyFilters) btnApplyFilters.addEventListener('click', applyFilters);

        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') applyFilters();
            });
        }

        // Carga inicial
        fetchProducts();
    };

    // Iniciar
    loadCategoriesAndInit();
});
