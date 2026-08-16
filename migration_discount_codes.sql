-- Migración no destructiva de códigos de descuento.
USE skull_face;

CREATE TABLE IF NOT EXISTS codigos_descuento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    porcentaje DECIMAL(5,2) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

DELIMITER //
CREATE PROCEDURE ensure_ventas_discount_columns()
BEGIN
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ventas' AND COLUMN_NAME = 'codigoDescuento') THEN
    ALTER TABLE ventas ADD COLUMN codigoDescuento VARCHAR(30) DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ventas' AND COLUMN_NAME = 'porcentajeDescuento') THEN
    ALTER TABLE ventas ADD COLUMN porcentajeDescuento DECIMAL(5,2) DEFAULT 0;
  END IF;
END//
CALL ensure_ventas_discount_columns()//
DROP PROCEDURE ensure_ventas_discount_columns//
DELIMITER ;

INSERT INTO codigos_descuento (codigo, porcentaje, activo)
VALUES ('YATZ10', 10.00, TRUE)
ON DUPLICATE KEY UPDATE porcentaje = VALUES(porcentaje), activo = VALUES(activo);
