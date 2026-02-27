-- Script de Creación de Tablas para Marketplace en SQL Server

-- Crear la base de datos si no existe
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'marketplace_db')
BEGIN
    CREATE DATABASE marketplace_db;
END
GO

USE marketplace_db;
GO

-- Tabla de Usuarios
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type in (N'U'))
    CREATE TABLE users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        email NVARCHAR(100) NOT NULL UNIQUE,
        password NVARCHAR(255) NOT NULL,
        phone NVARCHAR(20) NULL,
        role NVARCHAR(20) DEFAULT 'user', -- 'user' o 'admin'
        is_verified BIT DEFAULT 0,
        verification_token NVARCHAR(255) NULL,
        created_at DATETIME DEFAULT GETDATE()
    );
END
GO

-- Tabla de Categorías
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[categories]') AND type in (N'U'))
BEGIN
    CREATE TABLE categories (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(50) NOT NULL,
        slug NVARCHAR(50) NOT NULL UNIQUE
    );
END
GO

-- Tabla de Publicaciones (Productos)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[products]') AND type in (N'U'))
BEGIN
    CREATE TABLE products (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        category_id INT NOT NULL,
        title NVARCHAR(200) NOT NULL,
        description NVARCHAR(MAX) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        condition_status NVARCHAR(50) NOT NULL, -- 'nuevo', 'como_nuevo', 'usado'
        image_url NVARCHAR(255) NULL,
        status NVARCHAR(50) DEFAULT 'activo', -- 'activo', 'vendido', 'inactivo'
        created_at DATETIME DEFAULT GETDATE(),
        CONSTRAINT FK_Products_Users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT FK_Products_Categories FOREIGN KEY (category_id) REFERENCES categories(id)
    );
END
GO

-- Insertar algunas categorías base de prueba si la tabla no tiene datos
IF NOT EXISTS (SELECT 1 FROM categories)
BEGIN
    INSERT INTO categories (name, slug) VALUES 
    ('Electrónica', 'electronica'),
    ('Hogar', 'hogar'),
    ('Vehículos', 'vehiculos'),
    ('Ropa', 'ropa'),
    ('Deportes', 'deportes'),
    ('Muebles', 'muebles'),
    ('Herramientas', 'herramientas'),
    ('Otros', 'otros');
END
GO
