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
            const res = await fetch(`/api/products/${productId}`);
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

                // Vendedor y Rating
                document.getElementById('seller-name').textContent = product.seller_name;

                // Mostrar estrellas
                const ratingDiv = document.getElementById('seller-rating-display');
                if (product.seller_reviews_count > 0) {
                    const stars = Math.round(product.seller_rating);
                    let starsHtml = '';
                    for (let i = 1; i <= 5; i++) {
                        if (i <= stars) starsHtml += "<i class='bx bxs-star'></i>";
                        else starsHtml += "<i class='bx bx-star'></i>";
                    }
                    starsHtml += ` <span style="color:#666; font-size:0.85rem;">(${product.seller_rating} - ${product.seller_reviews_count} reseñas)</span>`;
                    ratingDiv.innerHTML = starsHtml;
                } else {
                    ratingDiv.innerHTML = "<span style='color:#666; font-size:0.85rem;'>Sin calificaciones aún</span>";
                }

                // Ubicación de Entrega
                const locSpan = document.getElementById('prod-location');
                if (product.location_type === 'personalizado' && product.location_custom) {
                    locSpan.textContent = product.location_custom;
                } else if (product.user_location) {
                    locSpan.textContent = product.user_location + ' (Perfil)';
                } else {
                    locSpan.textContent = 'Punto de encuentro a acordar';
                }

                // Enlace de WhatsApp dinámico
                const phone = product.seller_phone || '';
                const cleanPhone = phone.replace(/\D/g, ''); // Deja solo números
                const wpBtn = document.getElementById('btn-whatsapp');
                // --------- REGLA: BOTÓN DE CALIFICACIÓN ---------
                const btnRate = document.getElementById('btn-rate-seller');
                btnRate.style.display = 'none'; // Oculto por defecto

                if (cleanPhone) {
                    wpBtn.href = `https://wa.me/${cleanPhone}?text=Hola, me interesa el artículo: ${product.title}`;
                    wpBtn.addEventListener('click', () => {
                        // Al mostrar real interes en contactar, habilitamos poder calificar
                        btnRate.style.display = 'flex';
                    });
                } else {
                    wpBtn.style.display = 'none';
                    const wpMsg = document.createElement('p');
                    wpMsg.style.color = '#888';
                    wpMsg.textContent = 'El vendedor no proporcionó un número de teléfono.';
                    wpBtn.parentNode.insertBefore(wpMsg, wpBtn);
                }

                // === LÓGICA DE FAVORITOS INDIVIDUAL ===
                const btnSaveFav = document.getElementById('btn-save-favorite');
                const favBtnText = document.getElementById('fav-btn-text');
                const token = localStorage.getItem('user_token');

                if (token && btnSaveFav) {
                    btnSaveFav.style.display = 'flex'; // Mostrar si está logueado

                    // Verificar estado inicial
                    fetch('/api/favorites', { headers: { 'Authorization': `Bearer ${token}` } })
                        .then(res => res.json())
                        .then(faves => {
                            if (faves.some(f => f.id === product.id)) {
                                btnSaveFav.querySelector('i').className = 'bx bxs-heart';
                                btnSaveFav.querySelector('i').style.color = '#e74c3c';
                                favBtnText.textContent = 'Quitar de Favoritos';
                            }
                        }).catch(e => console.error(e));

                    btnSaveFav.addEventListener('click', async (e) => {
                        e.preventDefault();
                        const icon = btnSaveFav.querySelector('i');
                        await window.toggleFavorite(product.id, icon);

                        // Actualizar texto tras toggle
                        const isSolid = icon.classList.contains('bxs-heart');
                        favBtnText.textContent = isSolid ? 'Quitar de Favoritos' : 'Guardar en Favoritos';
                    });
                }
                // =====================================

                // --------- MODAL DE CALIFICACIÓN ---------
                const ratingModal = document.getElementById('rating-modal');
                const closeRatingModal = document.getElementById('close-rating-modal');
                const modalSellerName = document.getElementById('modal-seller-name');
                const rateSellerId = document.getElementById('rate-seller-id');
                const rateStars = document.querySelectorAll('.rate-star');
                const rateValueInput = document.getElementById('rate-value');
                const ratingForm = document.getElementById('rating-form');

                // Abrir modal
                btnRate.addEventListener('click', (e) => {
                    e.preventDefault();
                    const token = localStorage.getItem('user_token');
                    if (!token) {
                        Swal.fire("Aviso", "Debes iniciar sesión para calificar a un vendedor.", "info");
                        window.location.href = 'auth.html';
                        return;
                    }
                    modalSellerName.textContent = product.seller_name;
                    rateSellerId.value = product.user_id;
                    ratingModal.style.display = 'block';
                });

                // Cerrar modal
                closeRatingModal.onclick = () => ratingModal.style.display = 'none';
                window.onclick = (e) => { if (e.target === ratingModal) ratingModal.style.display = 'none'; }

                // Click en estrellas del modal
                rateStars.forEach(star => {
                    star.addEventListener('click', () => {
                        const val = parseInt(star.getAttribute('data-val'));
                        rateValueInput.value = val;
                        // Pintar
                        rateStars.forEach(s => {
                            if (parseInt(s.getAttribute('data-val')) <= val) {
                                s.style.color = '#ffb400';
                            } else {
                                s.style.color = '#ccc';
                            }
                        });
                    });
                });

                // Enviar form
                ratingForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const rVal = rateValueInput.value;
                    if (!rVal) {
                        Swal.fire("Aviso", "Por favor selecciona una cantidad de estrellas primero.", "info");
                        return;
                    }
                    const rComment = document.getElementById('rate-comment').value;
                    const sellerId = rateSellerId.value;

                    try {
                        const res = await fetch(`/api/users/${sellerId}/rate`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + localStorage.getItem('user_token')
                            },
                            body: JSON.stringify({ rating: rVal, comment: rComment })
                        });

                        const data = await res.json();
                        if (res.ok) {
                            Swal.fire("Aviso", data.message, "info");
                            location.reload(); // Recargar para ver estrellas nuevas
                        } else {
                            Swal.fire("Aviso", "Error: " + data.error, "info");
                        }
                    } catch (err) {
                        console.error(err);
                        Swal.fire("Aviso", "Hubo un error de conexión.", "info");
                    }
                });
                // -----------------------------------------

                // Imagen Principal y Miniaturas
                const mainImg = document.getElementById('main-img');
                const thumbList = document.getElementById('thumb-list');

                let allImages = [];
                if (product.image_url) {
                    allImages.push(product.image_url);
                } else {
                    allImages.push('https://placehold.co/800x600?text=Sin+Imagen');
                }

                if (product.additional_images) {
                    try {
                        const extraPhotos = JSON.parse(product.additional_images);
                        allImages = allImages.concat(extraPhotos);
                    } catch (e) {
                        console.error('Error parseando imagenes adicionales:', e);
                    }
                }

                // Fijar principal
                mainImg.src = allImages[0];

                // Renderizar thumb-list solo si hay > 1
                thumbList.innerHTML = '';
                if (allImages.length > 1) {
                    allImages.forEach((imgUrl, idx) => {
                        const thumbWrap = document.createElement('div');
                        thumbWrap.className = 'thumb';
                        if (idx === 0) thumbWrap.classList.add('active');

                        const imgEl = document.createElement('img');
                        imgEl.src = imgUrl;
                        imgEl.alt = 'Miniatura ' + (idx + 1);

                        thumbWrap.appendChild(imgEl);

                        thumbWrap.addEventListener('click', () => {
                            mainImg.src = imgUrl;
                            document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
                            thumbWrap.classList.add('active');
                        });

                        thumbList.appendChild(thumbWrap);
                    });
                }

                // --------- MÁS DEL VENDEDOR ---------
                const loadMoreProducts = async () => {
                    try {
                        const moreContainer = document.getElementById('more-products-container');
                        const moreGrid = document.getElementById('more-products-grid');
                        if (!moreContainer || !moreGrid) return;

                        document.getElementById('more-products-seller-name').textContent = product.seller_name;

                        const res = await fetch(`/api/products/user/${product.user_id}/other/${productId}`);
                        const extraProducts = await res.json();

                        if (res.ok && extraProducts.length > 0) {
                            moreContainer.style.display = 'block';
                            moreGrid.innerHTML = '';

                            const formatPrice = (price) => {
                                return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price);
                            };

                            extraProducts.forEach(p => {
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
                                        <span class="badge condition ${conditionClass}">${conditionLabel}</span>
                                        <img src="${imageUrl}" alt="${p.title}">
                                    </div>
                                    <div class="product-info">
                                        <span class="product-category">${p.category_name}</span>
                                        <h3 class="product-title">${p.title}</h3>
                                        <div class="product-price">${formatPrice(p.price)}</div>
                                    </div>
                                `;
                                moreGrid.appendChild(card);
                            });
                        }
                    } catch (err) {
                        console.error('Error cargando sugerencias:', err);
                    }
                };

                loadMoreProducts();

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

