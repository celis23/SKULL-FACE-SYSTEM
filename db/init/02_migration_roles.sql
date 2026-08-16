-- Migración no destructiva e idempotente de roles para una base existente.
USE skull_face;

DELIMITER //
CREATE PROCEDURE ensure_skull_face_role_columns()
BEGIN
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'nombreCompleto') THEN
    ALTER TABLE usuarios ADD COLUMN nombreCompleto VARCHAR(150) DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'email') THEN
    ALTER TABLE usuarios ADD COLUMN email VARCHAR(150) DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'telefono') THEN
    ALTER TABLE usuarios ADD COLUMN telefono VARCHAR(30) DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'rol') THEN
    ALTER TABLE usuarios ADD COLUMN rol ENUM('administrador', 'recepcionista', 'cliente') NOT NULL DEFAULT 'recepcionista';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'email' AND NON_UNIQUE = 0) THEN
    ALTER TABLE usuarios ADD UNIQUE KEY uq_usuarios_email (email);
  END IF;
END//
CALL ensure_skull_face_role_columns()//
DROP PROCEDURE ensure_skull_face_role_columns//
DELIMITER ;

-- Conserva cualquier usuario existente, incluido tlacolula, y garantiza las cuentas requeridas.
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
