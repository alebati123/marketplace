/**
 * global.js
 * Script para manejar lógica común a todas las páginas de la plataforma, 
 * como la autenticación visual del Navbar.
 */

document.addEventListener('DOMContentLoaded', () => {

    const isAuthenticated = localStorage.getItem('user_token') !== null;

    // Todos los elementos que requieren autenticacion (Botones de Quiero Vender)
    const authRequiredElems = document.querySelectorAll('.auth-required');

    // Boton de Login/Registro del navbar
    const btnLoginNav = document.getElementById('btn-login-nav');

    if (isAuthenticated) {
        // Mostrar botones especiales
        authRequiredElems.forEach(el => el.style.display = '');

        // Cambiar el boton de Iniciar Sesion a un Dropdown
        if (btnLoginNav) {
            // Obtener el nombre del usuario desde localStorage (guardado en auth.js al logearse)
            const userName = localStorage.getItem('user_name') || 'Mi Cuenta';

            // Reemplazar el botón por el contenedor del dropdown conservando referencias
            const wrapper = document.createElement('div');
            wrapper.className = 'user-dropdown';

            const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
            const adminLink = userData.role === 'admin' ? `<a href="admin.html"><i class='bx bx-shield-quarter'></i> Panel Admin</a>` : '';

            wrapper.innerHTML = `
                <div class="btn btn-outline user-dropdown-btn" id="dropdown-toggle" style="padding: 0.6rem 1rem;">
                    <i class='bx bx-user-circle' style="font-size: 1.2rem;"></i> 
                    <span style="max-width: 120px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${userName}</span>
                    <i class='bx bx-chevron-down'></i>
                </div>
                <div class="user-dropdown-content" id="dropdown-menu">
                    <a href="perfil.html"><i class='bx bx-user'></i> Mi Perfil</a>
                    <a href="publicaciones.html"><i class='bx bx-list-ul'></i> Catálogo</a>
                    <a href="mis-publicaciones.html"><i class='bx bx-store-alt'></i> Mis Publicaciones</a>
                    <a href="mis-favoritos.html"><i class='bx bx-heart'></i> Mis Favoritos</a>
                    ${adminLink}
                    <a href="#" id="btn-logout"><i class='bx bx-log-out'></i> Cerrar Sesión</a>
                </div>
            `;

            btnLoginNav.parentNode.replaceChild(wrapper, btnLoginNav);

            // Logica dinámica para cerrar sesion a nivel de documento global
            document.addEventListener('click', (e) => {
                const logoutAnchor = e.target.closest('#btn-logout');
                if (logoutAnchor) {
                    e.preventDefault();
                    Swal.fire({
                        title: '¿Deseas cerrar sesión?',
                        text: "Tu sesión será terminada de forma segura.",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#1A1A1A',
                        cancelButtonColor: '#666',
                        confirmButtonText: 'Sí, cerrar',
                        cancelButtonText: 'Cancelar'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            localStorage.removeItem('user_token');
                            localStorage.removeItem('user_name');
                            window.location.reload();
                        }
                    });
                }

                // Lógica para abrir/cerrar el dropdown al hacer click (esencial para celulares)
                const isDropdownToggle = e.target.closest('#dropdown-toggle');
                if (isDropdownToggle) {
                    wrapper.classList.toggle('active');
                } else if (!e.target.closest('.user-dropdown')) {
                    // Cerrar si hace click afuera
                    wrapper.classList.remove('active');
                }
            });
        }
    } else {
        // Obvio, si no esta autenticado, ocultamos / o en algunos casos redirigimos
        authRequiredElems.forEach(el => {
            el.style.display = 'none';
        });

        // Si la persona intenta entrar porm url a crear-publicacion sin estar logueado
        if (window.location.pathname.includes('crear-publicacion.html')) {
            Swal.fire("Aviso", 'Debes iniciar sesión para publicar un artículo', "info");
            window.location.href = 'auth.html';
        }
    }

    // Lógica para el Menú Hamburguesa en dispositivos móviles
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navbarNav = document.querySelector('.navbar-nav');
    const navbarActions = document.querySelector('.navbar-actions');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            if (navbarNav) navbarNav.classList.toggle('active');
            if (navbarActions) navbarActions.classList.toggle('active');
        });
    }

    // Lógica Global de Favoritos
    window.toggleFavorite = async function (productId, btnElement) {
        const token = localStorage.getItem('user_token');
        if (!token) {
            Swal.fire("Aviso", 'Debes iniciar sesión para guardar favoritos.', "info");
            window.location.href = 'auth.html';
            return;
        }

        const isFavorited = btnElement.classList.contains('bxs-heart'); // is solid?
        const method = isFavorited ? 'DELETE' : 'POST';

        try {
            const response = await fetch(`/api/favorites/${productId}`, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Alternar corazón
                if (isFavorited) {
                    btnElement.classList.remove('bxs-heart');
                    btnElement.classList.add('bx-heart');
                    btnElement.style.color = '';
                } else {
                    btnElement.classList.remove('bx-heart');
                    btnElement.classList.add('bxs-heart');
                    btnElement.style.color = '#e74c3c'; // Rojo
                }
            } else {
                console.error("No se pudo actualizar el guardado");
            }
        } catch (error) {
            console.error("Error de Red interactuando con favoritos", error);
        }
    };
});

