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

            // Agregar clace active al clickeado
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-target') + '-form';
            document.getElementById(targetId).classList.add('active');
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
                alert('Debes aceptar los Términos y Condiciones para registrarte.');
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
                    alert('¡Cuenta creada! Hemos enviado un enlace a tu correo para verificarla antes de poder conectarte.');
                    tabs[0].click(); // Redirige visualmente al Tab de Login
                    registerForm.reset();
                } else {
                    alert('Error al registrarse: ' + (data.error || 'Ocurrió un problema'));
                }
            } catch (error) {
                console.error(error);
                alert('Error al conectar con el servidor.');
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

                alert('Inicio de sesión exitoso');
                window.location.href = 'inicio.html';
            } else {
                alert('Error al ingresar: ' + (data.error || 'Credenciales inválidas'));
            }
        } catch (error) {
            console.error(error);
            alert('Error al conectar con el servidor.');
        }
    });
});
