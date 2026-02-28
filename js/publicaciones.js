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

    let userFavorites = [];

    const fetchProducts = async () => {
        try {
            // Obtener favoritos primero si está logueado
            const token = localStorage.getItem('user_token');
            if (token) {
                try {
                    const fRes = await fetch('/api/favorites', { headers: { 'Authorization': `Bearer ${token}` } });
                    if (fRes.ok) {
                        const fData = await fRes.json();
                        userFavorites = fData.map(f => f.id);
                    }
                } catch (e) { console.error('Error cargando favoritos', e); }
            }

            let url = '/api/products';
            const params = new URLSearchParams();
            if (currentFilters.search) params.append('search', currentFilters.search);
            if (currentFilters.category && currentFilters.category !== 'all') {
                params.append('category', currentFilters.category);
            }
            if (currentFilters.condition) params.append('condition', currentFilters.condition);
            if (currentFilters.sort) params.append('sort', currentFilters.sort);
            if (currentFilters.min_price) params.append('min_price', currentFilters.min_price);
            if (currentFilters.max_price) params.append('max_price', currentFilters.max_price);

            let queryUrl = `${url}?${params.toString()}`;

            const res = await fetch(queryUrl);
            const data = await res.json();

            if (res.ok) {
                // Filtramos duro para que nunca muestre servicios en el Catalogo Normal
                const soloProductos = data.filter(p => p.category_slug !== 'servicios');
                renderProducts(soloProductos);
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
                <div class="product-img" style="position: relative;">
                    <button class="btn-favorite" style="position: absolute; top: 10px; right: 10px; background: rgba(255,255,255,0.9); border: none; border-radius: 50%; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.2); z-index: 10;" onclick="event.preventDefault(); window.toggleFavorite(${p.id}, this.querySelector('i'))">
                        <i class='bx ${userFavorites.includes(p.id) ? 'bxs-heart' : 'bx-heart'}' style="font-size: 1.4rem; transition: color 0.2s; ${userFavorites.includes(p.id) ? 'color: #e74c3c;' : 'color: #555;'}"></i>
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
                    </div>
                </div>
            `;
            gallery.appendChild(card);
        });
    };

    // Actualizar filtros desde DOM
    const applyFilters = () => {
        currentFilters.search = searchInput.value.trim();

        // Categoria
        const checkedCat = document.querySelector('input[name="category"]:checked');
        currentFilters.category = checkedCat ? checkedCat.value : 'all';

        // Ordenamiento
        const sortVal = sortSelect.value;
        if (sortVal === 'Menor precio') currentFilters.sort = 'price_asc';
        else if (sortVal === 'Mayor precio') currentFilters.sort = 'price_desc';
        else currentFilters.sort = '';

        // Estado
        currentFilters.condition = '';
        const checkedConds = Array.from(conditionCheckboxes).filter(cb => cb.checked);
        if (checkedConds.length === 1) {
            currentFilters.condition = checkedConds[0].value;
        }

        // Precio
        currentFilters.min_price = priceMinInput.value || '';
        currentFilters.max_price = priceMaxInput.value || '';

        fetchProducts();
    };

    const loadCategoriesAndInit = async () => {
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            if (res.ok && categoryList) {
                categoryList.innerHTML = `
                    <li>
                        <label class="custom-radio">
                            <input type="radio" name="category" value="all" ${currentFilters.category === 'all' ? 'checked' : ''}>
                            <span class="radio-mark"></span>
                            Todas
                        </label>
                    </li>
                `;
                data.forEach(cat => {
                    if (cat.slug === 'servicios') return; // Ocultar categoría maestra
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <label class="custom-radio">
                            <input type="radio" name="category" value="${cat.slug}" ${currentFilters.category === cat.slug ? 'checked' : ''}>
                            <span class="radio-mark"></span>
                            ${cat.name}
                        </label>
                    `;
                    categoryList.appendChild(li);
                });
            }
        } catch (e) {
            console.error('Error cargando categorias', e);
        }

        // Asignar listeners despues de crear el DOM de categorias
        categoryRadios = document.querySelectorAll('input[name="category"]');
        categoryRadios.forEach(radio => radio.addEventListener('change', applyFilters));
        conditionCheckboxes.forEach(cb => cb.addEventListener('change', applyFilters));
        if (sortSelect) sortSelect.addEventListener('change', applyFilters);
        if (btnApplyFilters) btnApplyFilters.addEventListener('click', applyFilters);

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') applyFilters();
        });

        // Carga inicial
        fetchProducts();
    };

    // Iniciar
    loadCategoriesAndInit();
});

