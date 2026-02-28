document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('user_token');
    if (!token) {
        window.location.href = 'auth.html';
        return;
    }

    const nameInput = document.getElementById('profile-name');
    const emailInput = document.getElementById('profile-email');
    const phoneInput = document.getElementById('profile-phone');
    const profileForm = document.getElementById('profile-form');
    const btnSave = document.getElementById('btn-save-profile');

    // Load initial data
    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/users/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Network error or Unauthorized');

            const data = await res.json();
            nameInput.value = data.name || '';
            emailInput.value = data.email || '';
            phoneInput.value = data.phone || '';
        } catch (error) {
            console.error('Error cargando perfil:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error de carga',
                text: 'No pudimos cargar tus datos. Refresca la ventana.'
            });
        }
    };

    fetchProfile();

    // Handle form submit
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btnOriginalText = btnSave.innerHTML;
        btnSave.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Guardando...';
        btnSave.disabled = true;

        try {
            const newName = nameInput.value.trim();
            const newPhone = phoneInput.value.trim();

            const res = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newName, phone: newPhone })
            });

            const data = await res.json();

            if (res.ok) {
                // Update local memory so Navbar replaces dynamically mapped names immediately
                localStorage.setItem('user_name', newName);

                // Update the visible nav directly
                const dropdownSpan = document.querySelector('.user-dropdown-btn span');
                if (dropdownSpan) dropdownSpan.innerText = newName;

                Swal.fire({
                    icon: 'success',
                    title: '¡Guardado!',
                    text: 'Tus datos de contacto han sido actualizados.',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                throw new Error(data.error || 'Error desconocido');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message
            });
        } finally {
            btnSave.disabled = false;
            btnSave.innerHTML = btnOriginalText;
        }
    });

});
