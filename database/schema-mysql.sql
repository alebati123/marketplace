-- Script de Creación de Tablas para Marketplace en MySQL

-- Script de Creación de Tablas para Marketplace en MySQL

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    location VARCHAR(255) NULL,
    role VARCHAR(20) DEFAULT 'user', -- 'user' o 'admin'
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Categorías
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla de Publicaciones (Productos)
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    condition_status VARCHAR(50) NOT NULL, -- 'nuevo', 'como_nuevo', 'usado'
    image_url VARCHAR(255) NULL,
    additional_images TEXT NULL,
    location_type VARCHAR(50) DEFAULT 'acordado',
    location_custom VARCHAR(255) NULL,
    status VARCHAR(50) DEFAULT 'activo', -- 'activo', 'vendido', 'inactivo'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Products_Users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT FK_Products_Categories FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Insertar algunas categorías base de prueba si la tabla no tiene datos
INSERT IGNORE INTO categories (name, slug) VALUES 
('Electrónica', 'electronica'),
('Hogar', 'hogar'),
('Vehículos', 'vehiculos'),
('Ropa', 'ropa'),
('Deportes', 'deportes'),
('Muebles', 'muebles'),
('Herramientas', 'herramientas'),
('Otros', 'otros');

-- Tabla Favoritos
CREATE TABLE IF NOT EXISTS user_favorites (
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, product_id),
    CONSTRAINT FK_Fav_Users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT FK_Fav_Products FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Tabla Reseñas
CREATE TABLE IF NOT EXISTS user_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reviewer_id INT NOT NULL,
    rated_user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Rev_Reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT FK_Rev_Rated FOREIGN KEY (rated_user_id) REFERENCES users(id) ON DELETE CASCADE
);
