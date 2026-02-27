/**
 * Lógica para la vista de "Panel de Administrador"
 */

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('user_token');
    if (!token) {
        window.location.href = 'auth.html';
        return;
    }

    const user = JSON.parse(localStorage.getItem('user_data') || '{}');
    if (user.role !== 'admin') {
        alert('Acceso Denegado. Solo administradores pueden ver esta página.');
        window.location.href = 'inicio.html';
        return;
    }

    const categoriasTbody = document.getElementById('categorias-tbody');
    const productosTbody = document.getElementById('productos-tbody');
    const addCatForm = document.getElementById('form-category');
    const catNameInput = document.getElementById('cat-name');
    const catSlugInput = document.getElementById('cat-slug');

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price);
    };

    // --- VARIABLES DE DATOS ---
    let allCategories = [];
    let allProducts = [];

    // --- ELEMENTOS DEL DOM ---
    const statProductos = document.getElementById('stat-productos');
    const statUsuarios = document.getElementById('stat-usuarios');
    const searchCat = document.getElementById('search-cat');
    const searchProd = document.getElementById('search-prod');

    // Elementos del Menu Lateral
    const menuLinks = document.querySelectorAll('.sidebar-menu a');
    const catCard = document.querySelector('.table-card:nth-child(1)'); // Category card
    const prodCard = document.querySelector('.table-card:nth-child(2)'); // Products card

    // --- FUNCIONES DE ESTADÍSTICAS ---
    const fetchUsersStat = async () => {
        try {
            const res = await fetch('http://127.0.0.1:3000/api/auth/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                statUsuarios.innerText = data.length;
            } else {
                statUsuarios.innerText = 'Err';
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            statUsuarios.innerText = '-';
        }
    };

    // --- FUNCIONES DE CATEGORÍAS ---
    const fetchCategories = async () => {
        try {
            const res = await fetch('http://127.0.0.1:3000/api/categories');
            const data = await res.json();
            if (res.ok) {
                allCategories = data;
                renderCategories(allCategories);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            categoriasTbody.innerHTML = '<tr><td colspan="4">Error al cargar categorías</td></tr>';
        }
    };

    const renderCategories = (categories) => {
        categoriasTbody.innerHTML = '';
        if (categories.length === 0) {
            categoriasTbody.innerHTML = '<tr><td colspan="4">No hay categorías que coincidan.</td></tr>';
            return;
        }

        categories.forEach(cat => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${cat.id}</td>
                <td>${cat.name}</td>
                <td>${cat.slug}</td>
                <td>
                    <button class="action-btn delete" onclick="deleteCategory(${cat.id})" title="Eliminar Categoría">
                        <i class='bx bx-trash'></i>
                    </button>
                </td>
            `;
            categoriasTbody.appendChild(tr);
        });
    };

    if (searchCat) {
        searchCat.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allCategories.filter(c =>
                c.name.toLowerCase().includes(term) || c.slug.toLowerCase().includes(term)
            );
            renderCategories(filtered);
        });
    }

    addCatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = catNameInput.value.trim();
        const slug = catSlugInput.value.trim().toLowerCase().replace(/\s+/g, '-');

        if (!name || !slug) return;

        try {
            const res = await fetch('http://127.0.0.1:3000/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, slug })
            });

            const data = await res.json();
            if (res.ok) {
                catNameInput.value = '';
                catSlugInput.value = '';
                fetchCategories();
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error(error);
            alert('Fallo de conexión.');
        }
    });

    window.deleteCategory = async (id) => {
        if (!confirm('¿Seguro que deseas eliminar esta categoría? Si tiene publicaciones asociadas, fallará.')) return;
        try {
            const res = await fetch(`http://127.0.0.1:3000/api/categories/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                fetchCategories();
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error(error);
            alert('Fallo de conexión.');
        }
    };

    // --- FUNCIONES DE PUBLICACIONES ---
    const fetchProducts = async () => {
        try {
            const res = await fetch('http://127.0.0.1:3000/api/products');
            const data = await res.json();
            if (res.ok) {
                allProducts = data;
                statProductos.innerText = allProducts.length;
                renderProducts(allProducts);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            productosTbody.innerHTML = '<tr><td colspan="5">Error al cargar publicaciones</td></tr>';
        }
    };

    const renderProducts = (products) => {
        productosTbody.innerHTML = '';
        if (products.length === 0) {
            productosTbody.innerHTML = '<tr><td colspan="5">No hay publicaciones que coincidan.</td></tr>';
            return;
        }

        products.forEach(p => {
            const imageUrl = p.image_url || 'https://placehold.co/150x150?text=Sin+Imagen';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${imageUrl}" alt="${p.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
                <td>${p.title}</td>
                <td>${p.seller_name}</td>
                <td>${formatPrice(p.price)}</td>
                <td>
                    <button class="action-btn delete" onclick="deleteProduct(${p.id})" title="Eliminar Publicación de la Plataforma">
                        <i class='bx bx-trash'></i>
                    </button>
                    <a href="producto.html?id=${p.id}" class="action-btn edit" title="Ver Publicación" style="display:inline-block; padding:0.4rem; color:var(--color-primary);"><i class='bx bx-link-external'></i></a>
                </td>
            `;
            productosTbody.appendChild(tr);
        });
    };

    if (searchProd) {
        searchProd.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allProducts.filter(p =>
                p.title.toLowerCase().includes(term) || (p.seller_name && p.seller_name.toLowerCase().includes(term))
            );
            renderProducts(filtered);
        });
    }

    window.deleteProduct = async (id) => {
        if (!confirm('PELIGRO: ¿Estás seguro de que deseas eliminar permanentemente la publicación de este usuario?')) return;
        try {
            const res = await fetch(`http://127.0.0.1:3000/api/products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                fetchProducts();
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error(error);
            alert('Fallo de conexión.');
        }
    };

    // --- FUNCIONES DE USUARIOS ---
    let allUsersData = [];
    const usuariosTbody = document.getElementById('usuarios-tbody');
    const searchUsr = document.getElementById('search-usr');

    const fetchAllUsersData = async () => {
        try {
            const res = await fetch('http://127.0.0.1:3000/api/auth/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                allUsersData = data;
                renderUsers(allUsersData);
            }
        } catch (error) {
            console.error('Error fetching users data:', error);
            if (usuariosTbody) usuariosTbody.innerHTML = '<tr><td colspan="6">Error al cargar usuarios</td></tr>';
        }
    };

    const renderUsers = (usersList) => {
        if (!usuariosTbody) return;
        usuariosTbody.innerHTML = '';
        if (usersList.length === 0) {
            usuariosTbody.innerHTML = '<tr><td colspan="6">No se encontraron usuarios.</td></tr>';
            return;
        }

        usersList.forEach(u => {
            const date = new Date(u.created_at).toLocaleDateString('es-AR');
            const roleBadge = u.role === 'admin' ? '<span class="badge" style="background:var(--color-primary); color:white; padding:0.2rem 0.5rem; border-radius:5px; font-size:0.8rem;">Admin</span>' : 'Usuario';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${u.id}</td>
                <td><strong>${u.name}</strong></td>
                <td><a href="mailto:${u.email}" style="color:var(--color-primary);">${u.email}</a></td>
                <td>${u.phone ? `<a href="https://wa.me/${u.phone.replace(/\D/g, '')}" target="_blank" style="color:#25D366;"><i class='bx bxl-whatsapp'></i> ${u.phone}</a>` : 'No provisto'}</td>
                <td>${roleBadge}</td>
                <td>${date}</td>
            `;
            usuariosTbody.appendChild(tr);
        });
    };

    if (searchUsr) {
        searchUsr.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allUsersData.filter(u =>
                u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
            );
            renderUsers(filtered);
        });
    }

    const cardUsers = document.getElementById('card-users');

    // --- LÓGICA DEL MENÚ LATERAL ---
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Ignorar enlaces sin comportamiento (ej. #) que no queramos modificar
            if (link.getAttribute('href') !== '#') return;

            e.preventDefault();

            // Remover 'active' de todos
            menuLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const tabName = link.innerText.trim();
            const statsGrid = document.querySelector('.stats-grid');

            // Mostrar u ocultar secciones dependiendo del link
            if (tabName === 'Dashboard') {
                statsGrid.style.display = 'grid';
                catCard.style.display = 'block';
                prodCard.style.display = 'block';
                if (cardUsers) cardUsers.style.display = 'none';
            } else if (tabName === 'Publicaciones') {
                statsGrid.style.display = 'none';
                catCard.style.display = 'none';
                prodCard.style.display = 'block';
                if (cardUsers) cardUsers.style.display = 'none';
            } else if (tabName === 'Categorías') {
                statsGrid.style.display = 'none';
                catCard.style.display = 'block';
                prodCard.style.display = 'none';
                if (cardUsers) cardUsers.style.display = 'none';
            } else if (tabName === 'Usuarios') {
                statsGrid.style.display = 'grid';
                catCard.style.display = 'none';
                prodCard.style.display = 'none';
                if (cardUsers) cardUsers.style.display = 'block';
                fetchAllUsersData();
            }
        });
    });

    // Iniciar Panel
    fetchUsersStat();
    fetchCategories();
    fetchProducts();
});
