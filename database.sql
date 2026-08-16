-- SKULL FACE — Sales & Inventory (instalación limpia MySQL)
DROP DATABASE IF EXISTS skull_face;
CREATE DATABASE skull_face CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE skull_face;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombreCompleto VARCHAR(150) DEFAULT NULL,
    email VARCHAR(150) DEFAULT NULL UNIQUE,
    telefono VARCHAR(30) DEFAULT NULL,
    rol ENUM('administrador', 'recepcionista', 'cliente') NOT NULL DEFAULT 'recepcionista',
    fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

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

CREATE TABLE ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    total DECIMAL(10,2) NOT NULL,
    ganancia DECIMAL(10,2) NOT NULL DEFAULT 0,
    metodoPago ENUM('Efectivo', 'Transferencia', 'Tarjeta', 'Otro') NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    usuarioId INT,
    FOREIGN KEY (usuarioId) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

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

CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clienteId INT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    estado ENUM('pendiente', 'confirmado', 'en_preparacion', 'entregado', 'cancelado') NOT NULL DEFAULT 'pendiente',
    notas TEXT DEFAULT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_pedidos_cliente (clienteId),
    INDEX idx_pedidos_estado (estado),
    FOREIGN KEY (clienteId) REFERENCES usuarios(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE detalle_pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedidoId INT NOT NULL,
    productoId INT NOT NULL,
    cantidad INT NOT NULL,
    precioUnitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    INDEX idx_detalle_pedido (pedidoId),
    FOREIGN KEY (pedidoId) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (productoId) REFERENCES productos(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- bcrypt, 10 salt rounds. No se almacenan contraseñas en texto plano.
INSERT INTO usuarios (usuario, password, nombreCompleto, rol) VALUES
('celis', '$2b$10$jMCGH8LQUCRlrCiWXAhp..ZzfwPZyzWwWsIzmkQ70golCQmJWoomK', 'Administrador SKULL FACE', 'administrador'),
('tlaco', '$2b$10$6q8RDrMZxdl84MZf90SXLO4oHWxz2/ZdUyXpj8am/vxZaOv/XywRu', 'Recepción SKULL FACE', 'recepcionista');

INSERT INTO productos (nombre, categoria, talla, color, precioVenta, costo, stock, estado) VALUES
('Hoodie Skull', 'Hoodie', 'M', 'Negro', 650.00, 350.00, 10, 'Disponible'),
('Pants Skull', 'Pants', 'L', 'Negro', 550.00, 300.00, 4, 'Stock bajo'),
('Playera Skull', 'Playera', 'G', 'Blanco', 300.00, 150.00, 0, 'Agotado');
