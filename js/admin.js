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

            // Computar Reputacion HTML
            let total = u.total_reviews || 0;
            let avg = u.average_rating || 0;
            let starsHtml = '';

            if (total > 0) {
                let roundedAvg = Math.round(avg);
                for (let i = 1; i <= 5; i++) {
                    if (i <= roundedAvg) starsHtml += "<i class='bx bxs-star' style='color:#ffb400; font-size:1.1rem;'></i>";
                    else starsHtml += "<i class='bx bx-star' style='color:#ccc; font-size:1.1rem;'></i>";
                }
                starsHtml += `<br><a href="#" onclick="viewUserReviews('${u.name}')" style="font-size:0.8rem; color:var(--color-primary); text-decoration:underline;">${avg} (${total} Reseñas)</a>`;
            } else {
                starsHtml = `<span style="font-size:0.85rem; color:#888;">Sin calificar</span>`;
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${u.id}</td>
                <td><strong>${u.name}</strong></td>
                <td><a href="mailto:${u.email}" style="color:var(--color-primary);">${u.email}</a></td>
                <td>${u.phone ? `<a href="https://wa.me/${u.phone.replace(/\D/g, '')}" target="_blank" style="color:#25D366;"><i class='bx bxl-whatsapp'></i> ${u.phone}</a>` : 'No provisto'}</td>
                <td>${roleBadge}</td>
                <td>${date}</td>
                <td style="text-align:center;">${starsHtml}</td>
            `;
            usuariosTbody.appendChild(tr);
        });
    };

    // Función auxiliar para buscar reseñas rápidamente tocando las estrellas
    window.viewUserReviews = (userName) => {
        // Encontraremos la Pestaña "Reseñas" y la emulamos como clic 
        const tabResenas = Array.from(document.querySelectorAll('.sidebar-menu a')).find(el => el.textContent.trim() === 'Reseñas');
        if (tabResenas) {
            tabResenas.click();
            // Y luego filtramos el search input automáticamente
            setTimeout(() => {
                const searchRev = document.getElementById('search-rev');
                if (searchRev) {
                    searchRev.value = userName;
                    // Disparamos el evento input para que filtre visualmente
                    searchRev.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }, 300);
        }
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

    // --- FUNCIONES DE RESEÑAS (MODERACIÓN) ---
    const cardReviews = document.getElementById('card-reviews');
    const reviewsTbody = document.getElementById('reviews-tbody');
    const searchRev = document.getElementById('search-rev');
    let allReviewsData = [];

    const fetchAllReviews = async () => {
        try {
            const res = await fetch('http://127.0.0.1:3000/api/users/reviews', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                allReviewsData = data;
                renderReviews(allReviewsData);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            if (reviewsTbody) reviewsTbody.innerHTML = '<tr><td colspan="6">Error al cargar reseñas</td></tr>';
        }
    };

    const renderReviews = (reviewsList) => {
        if (!reviewsTbody) return;
        reviewsTbody.innerHTML = '';
        if (reviewsList.length === 0) {
            reviewsTbody.innerHTML = '<tr><td colspan="6">No se encontraron reseñas.</td></tr>';
            return;
        }

        reviewsList.forEach(r => {
            const date = new Date(r.created_at).toLocaleDateString('es-AR');
            let starsHtml = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= r.rating) starsHtml += "<i class='bx bxs-star' style='color:#ffb400;'></i>";
                else starsHtml += "<i class='bx bx-star' style='color:#ccc;'></i>";
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${date}</td>
                <td><strong>${r.reviewer_name}</strong><br><small>${r.reviewer_email}</small></td>
                <td><strong>${r.rated_user_name}</strong><br><small>${r.rated_user_email}</small></td>
                <td>${starsHtml}</td>
                <td><p style="max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${r.comment || ''}">${r.comment || '<i>Sin comentario</i>'}</p></td>
                <td>
                    <button class="action-btn delete" onclick="deleteReview(${r.id})" title="Eliminar Reseña">
                        <i class='bx bx-trash'></i>
                    </button>
                </td>
            `;
            reviewsTbody.appendChild(tr);
        });
    };

    if (searchRev) {
        searchRev.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allReviewsData.filter(r =>
                r.rated_user_name.toLowerCase().includes(term) ||
                r.reviewer_name.toLowerCase().includes(term) ||
                (r.comment && r.comment.toLowerCase().includes(term))
            );
            renderReviews(filtered);
        });
    }

    window.deleteReview = async (id) => {
        if (!confirm('¿Seguro que deseas borrar esta reseña de forma permanente?')) return;
        try {
            const res = await fetch(`http://127.0.0.1:3000/api/users/reviews/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                fetchAllReviews();
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error(error);
            alert('Fallo de conexión al eliminar reseña.');
        }
    };

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
                if (cardReviews) cardReviews.style.display = 'none';
            } else if (tabName === 'Publicaciones') {
                statsGrid.style.display = 'none';
                catCard.style.display = 'none';
                prodCard.style.display = 'block';
                if (cardUsers) cardUsers.style.display = 'none';
                if (cardReviews) cardReviews.style.display = 'none';
            } else if (tabName === 'Categorías') {
                statsGrid.style.display = 'none';
                catCard.style.display = 'block';
                prodCard.style.display = 'none';
                if (cardUsers) cardUsers.style.display = 'none';
                if (cardReviews) cardReviews.style.display = 'none';
            } else if (tabName === 'Usuarios') {
                statsGrid.style.display = 'grid';
                catCard.style.display = 'none';
                prodCard.style.display = 'none';
                if (cardUsers) cardUsers.style.display = 'block';
                if (cardReviews) cardReviews.style.display = 'none';
                fetchAllUsersData();
            } else if (tabName === 'Reseñas') {
                statsGrid.style.display = 'grid';
                catCard.style.display = 'none';
                prodCard.style.display = 'none';
                if (cardUsers) cardUsers.style.display = 'none';
                if (cardReviews) cardReviews.style.display = 'block';
                fetchAllReviews();
            }

            // Cerrar menú on mobile después de clickear una pestaña
            if (window.innerWidth <= 900) {
                document.getElementById('admin-sidebar').classList.remove('active');
            }
        });
    });

    // Cerrar menú tocando afuera en móviles
    const adminMain = document.querySelector('.admin-main');
    if (adminMain) {
        adminMain.addEventListener('click', () => {
            if (window.innerWidth <= 900) {
                document.getElementById('admin-sidebar').classList.remove('active');
            }
        });
    }

    // Iniciar Panel
    fetchUsersStat();
    fetchCategories();
    fetchProducts();
});
