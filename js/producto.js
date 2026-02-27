/**
 * Logica JS para Detalle de Producto
 */

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        document.querySelector('.product-layout').innerHTML = '<h2>Producto no especificado</h2>';
        return;
    }

    const loadProduct = async () => {
        try {
            const res = await fetch(`http://localhost:3000/api/products/${productId}`);
            const product = await res.json();

            if (res.ok) {
                // Llenar Breadcrumb
                document.getElementById('bread-cat').textContent = product.category_name;
                document.getElementById('bread-cat').href = `publicaciones.html?cat=${product.category_slug || ''}`;
                document.getElementById('bread-title').textContent = product.title;

                // Llenar datos principales
                document.getElementById('prod-title').textContent = product.title;

                const formatPrice = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(product.price);
                document.getElementById('prod-price').textContent = formatPrice;

                document.getElementById('prod-desc').textContent = product.description;
                document.getElementById('meta-cat').textContent = product.category_name;

                // Llenar estado y fechas
                const badge = document.getElementById('prod-badge');
                if (product.condition_status === 'nuevo') {
                    badge.textContent = 'Nuevo'; badge.className = 'badge condition new';
                } else if (product.condition_status === 'usado') {
                    badge.textContent = 'Usado'; badge.className = 'badge condition used';
                } else {
                    badge.textContent = 'Como Nuevo'; badge.className = 'badge condition';
                }

                const dateObj = new Date(product.created_at);
                document.getElementById('prod-date').textContent = `Publicado el ${dateObj.toLocaleDateString('es-AR')}`;

                // Vendedor
                document.getElementById('seller-name').textContent = product.seller_name;

                // Enlace de WhatsApp dinámico
                const phone = product.seller_phone || '';
                const cleanPhone = phone.replace(/\D/g, ''); // Deja solo números
                const msg = `Hola, me interesa tu producto "${product.title}" publicado en MarketPlace LAMBERTUCCI.`;
                const finalLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;

                const wpBtn = document.getElementById('btn-whatsapp');
                if (cleanPhone) {
                    wpBtn.href = finalLink;
                } else {
                    wpBtn.style.display = 'none';
                    const wpMsg = document.createElement('p');
                    wpMsg.style.color = 'red';
                    wpMsg.textContent = 'El vendedor no proporcionó un celular.';
                    wpBtn.parentNode.insertBefore(wpMsg, wpBtn);
                }

                // Imagen
                const mainImg = document.getElementById('main-img');
                if (product.image_url) {
                    mainImg.src = product.image_url;
                } else {
                    mainImg.src = 'https://placehold.co/800x600?text=Sin+Imagen';
                }

            } else {
                document.querySelector('.product-layout').innerHTML = `<h2>${product.error || 'Producto no encontrado'}</h2>`;
            }
        } catch (error) {
            console.error('Error fetching product', error);
            document.querySelector('.product-layout').innerHTML = '<h2>Error al cargar el producto.</h2>';
        }
    };

    loadProduct();
});
