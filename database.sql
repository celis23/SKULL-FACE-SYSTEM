-- =====================================================
-- SKULL FACE — SALES & INVENTORY
-- Script de base de datos MySQL
-- Importar directamente en MySQL Workbench
-- =====================================================

DROP DATABASE IF EXISTS skull_face;
CREATE DATABASE skull_face CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE skull_face;

-- =====================================================
-- TABLA: usuarios
-- =====================================================
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: productos
-- =====================================================
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    categoria ENUM('Hoodie', 'Pants', 'Playera') NOT NULL,
    talla VARCHAR(10) NOT NULL,
    color VARCHAR(50) NOT NULL,
    precioVenta DECIMAL(10,2) NOT NULL,
    costo DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    imagen VARCHAR(255) DEFAULT NULL,
    estado ENUM('Disponible', 'Stock bajo', 'Agotado') NOT NULL DEFAULT 'Disponible',
    fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: ventas
-- =====================================================
CREATE TABLE ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    total DECIMAL(10,2) NOT NULL,
    ganancia DECIMAL(10,2) NOT NULL DEFAULT 0,
    metodoPago ENUM('Efectivo', 'Transferencia', 'Tarjeta', 'Otro') NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    usuarioId INT,
    FOREIGN KEY (usuarioId) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: detalle_ventas
-- =====================================================
CREATE TABLE detalle_ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ventaId INT NOT NULL,
    productoId INT NOT NULL,
    cantidad INT NOT NULL,
    precioUnitario DECIMAL(10,2) NOT NULL,
    costoUnitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (ventaId) REFERENCES ventas(id) ON DELETE CASCADE,
    FOREIGN KEY (productoId) REFERENCES productos(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =====================================================
-- USUARIO INICIAL
-- usuario: tlacolula
-- contraseña: 12345tla
-- (hash generado con bcrypt, 10 salt rounds)
-- =====================================================
INSERT INTO usuarios (usuario, password) VALUES
('tlacolula', '$2b$10$Xcv3hzZS7rLEHDVMpnExfuRZoM1dVQe01VoZ3IrBn/3eoNnSSMud.');

-- =====================================================
-- PRODUCTOS DE EJEMPLO (opcional, puedes borrarlos)
-- =====================================================
INSERT INTO productos (nombre, categoria, talla, color, precioVenta, costo, stock, estado) VALUES
('Hoodie Skull', 'Hoodie', 'M', 'Negro', 650.00, 350.00, 10, 'Disponible'),
('Pants Skull', 'Pants', 'L', 'Negro', 550.00, 300.00, 4, 'Stock bajo'),
('Playera Skull', 'Playera', 'G', 'Blanco', 300.00, 150.00, 0, 'Agotado');
