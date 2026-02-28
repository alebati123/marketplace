/**
 * Script para manejar los tabs de Login/Registro
 */

document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Quitar clase active a todos los tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Quitar clase active a todos los forms
            forms.forEach(f => f.classList.remove('active'));

            // Add active class to clicked
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-target');
            document.getElementById(targetId + '-form').classList.add('active');

            // Dynamic Banner Text for Desktop
            const bannerHeader = document.querySelector('.banner-content h2');
            const bannerPara = document.querySelector('.banner-content p');
            if (bannerHeader && bannerPara) {
                if (targetId === 'register') {
                    bannerHeader.innerText = 'Únete a nosotros';
                    bannerPara.innerText = 'Crea tu cuenta gratis hoy y empieza a comprar y vender de forma segura.';
                } else {
                    bannerHeader.innerText = 'Bienvenido de nuevo';
                    bannerPara.innerText = 'Únete a la comunidad de MarketPlace. Compra y vende de forma segura y directa.';
                }
            }
        });
    });

    // Conexión con Backend de Registro
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const phone = document.getElementById('reg-phone').value;
            const password = document.getElementById('reg-pass').value;
            const termsAccepted = document.getElementById('reg-terms').checked;

            if (!termsAccepted) {
                Swal.fire("Aviso", 'Debes aceptar los Términos y Condiciones para registrarte.', "info");
                return;
            }

            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, phone, password })
                });

                const data = await res.json();

                if (res.ok) {
                    Swal.fire("Aviso", '¡Cuenta creada! Hemos enviado un enlace a tu correo para verificarla antes de poder conectarte.', "info");
                    tabs[0].click(); // Redirige visualmente al Tab de Login
                    registerForm.reset();
                } else {
                    Swal.fire("Aviso", 'Error al registrarse: ' + (data.error || 'Ocurrió un problema'), "info");
                }
            } catch (error) {
                console.error(error);
                Swal.fire("Aviso", 'Error al conectar con el servidor.', "info");
            }
        });
    }


    // Conexión con Backend de Login
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-pass').value;

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                // Instanciar Sesión guardando el Token JWT y los datos del usuario
                localStorage.setItem('user_token', data.token);
                localStorage.setItem('user_data', JSON.stringify(data.user));
                localStorage.setItem('user_name', data.user.name);

                Swal.fire("Aviso", 'Inicio de sesión exitoso', "info");
                window.location.href = 'inicio.html';
            } else {
                Swal.fire("Aviso", 'Error al ingresar: ' + (data.error || 'Credenciales inválidas'), "info");
            }
        } catch (error) {
            console.error(error);
            Swal.fire("Aviso", 'Error al conectar con el servidor.', "info");
        }
    });
});

