-- Ejecutar SOLO sobre una base skull_face existente (no usa DROP DATABASE).
USE skull_face;
ALTER TABLE usuarios
  ADD COLUMN nombreCompleto VARCHAR(150) DEFAULT NULL,
  ADD COLUMN email VARCHAR(150) DEFAULT NULL,
  ADD COLUMN telefono VARCHAR(30) DEFAULT NULL,
  ADD COLUMN rol ENUM('administrador', 'recepcionista', 'cliente') NOT NULL DEFAULT 'recepcionista',
  ADD UNIQUE KEY uq_usuarios_email (email);

-- Sustituye las credenciales antiguas sin duplicar usuarios.
DELETE FROM usuarios WHERE usuario = 'tlacolula';
INSERT INTO usuarios (usuario, password, nombreCompleto, rol) VALUES
('celis', '$2b$10$jMCGH8LQUCRlrCiWXAhp..ZzfwPZyzWwWsIzmkQ70golCQmJWoomK', 'Administrador SKULL FACE', 'administrador'),
('tlaco', '$2b$10$6q8RDrMZxdl84MZf90SXLO4oHWxz2/ZdUyXpj8am/vxZaOv/XywRu', 'Recepción SKULL FACE', 'recepcionista')
ON DUPLICATE KEY UPDATE password = VALUES(password), nombreCompleto = VALUES(nombreCompleto), rol = VALUES(rol);

CREATE TABLE IF NOT EXISTS pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY, clienteId INT NOT NULL, total DECIMAL(10,2) NOT NULL,
  estado ENUM('pendiente','confirmado','en_preparacion','entregado','cancelado') NOT NULL DEFAULT 'pendiente',
  notas TEXT DEFAULT NULL, fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pedidos_cliente (clienteId), INDEX idx_pedidos_estado (estado),
  FOREIGN KEY (clienteId) REFERENCES usuarios(id) ON DELETE RESTRICT
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS detalle_pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY, pedidoId INT NOT NULL, productoId INT NOT NULL, cantidad INT NOT NULL,
  precioUnitario DECIMAL(10,2) NOT NULL, subtotal DECIMAL(10,2) NOT NULL, INDEX idx_detalle_pedido (pedidoId),
  FOREIGN KEY (pedidoId) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (productoId) REFERENCES productos(id) ON DELETE RESTRICT
) ENGINE=InnoDB;
