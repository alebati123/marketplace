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
                    <a href="publicaciones.html"><i class='bx bx-list-ul'></i> Catálogo</a>
                    <a href="mis-publicaciones.html"><i class='bx bx-folder'></i> Mis Publicaciones</a>
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
                    const confirmLogout = confirm("¿Deseas cerrar sesión?");
                    if (confirmLogout) {
                        localStorage.removeItem('user_token');
                        localStorage.removeItem('user_name');
                        window.location.reload();
                    }
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
            alert('Debes iniciar sesión para publicar un artículo');
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
});
