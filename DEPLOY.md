# Despliegue de SKULL FACE

Guía para el servidor que ya aloja `gestion_softwrae_conductual` (Caddy en Docker).

Reparto de responsabilidades: el compose de esta app **no publica nada al exterior**.
El frontend escucha en `127.0.0.1:8000` y el Caddy del servidor enruta el tráfico
público hasta ahí. La API nunca se expone directamente: se llega a ella por
`/api`, que el nginx interno del frontend redirige al backend.

```
Internet → Caddy (:80/:443) → 127.0.0.1:8000 → nginx (frontend) → backend:3000 → db:3306
```

## 1. Clonar

```bash
cd /root
git clone <url-del-repo> skull-face-system
cd skull-face-system
```

## 2. Configurar el entorno

```bash
cp .env.example .env
```

Genera secretos reales:

```bash
openssl rand -hex 48   # JWT_SECRET
openssl rand -hex 16   # MYSQL_PASSWORD
openssl rand -hex 16   # MYSQL_ROOT_PASSWORD
```

Edita `.env` y cambia **todos** los valores. Los que importan en este servidor:

```env
CORS_ORIGIN=http://62.171.159.168   # o https://tu-dominio.com cuando lo tengas
TRUST_PROXY_HOPS=2                  # nginx del compose + Caddy del host
ENABLE_HSTS=false                   # true solo cuando haya HTTPS con dominio
FRONTEND_BIND=127.0.0.1
FRONTEND_PORT=8000
ADMIN_USER=celis
ADMIN_PASSWORD=<contraseña nueva y fuerte>
RECEPCION_USER=tlaco
RECEPCION_PASSWORD=<contraseña nueva y fuerte>
```

**Importante:** las contraseñas anteriores de `celis` y `tlaco` estuvieron
versionadas en git, así que hay que considerarlas comprometidas. Usa contraseñas
nuevas aquí.

## 3. Levantar

```bash
docker compose up -d --build
docker compose logs -f backend    # debe decir "Cuentas iniciales creadas"
curl -s http://127.0.0.1:8000/api/health
```

El healthcheck de MySQL hace que el backend espere a que la base esté lista, y
las migraciones de `db/init/` corren solas en el primer arranque.

## 4. Publicar en Caddy

Edita el Caddyfile de la app existente:

```bash
nano /root/gestion_softwrae_conductual/Caddyfile
```

Añade un bloque nuevo **sin tocar el que ya existe**.

### Opción A — con dominio (recomendada)

Caddy emite y renueva el certificado solo:

```caddy
skullface.tu-dominio.com {
    reverse_proxy 127.0.0.1:8000
}
```

Después pon en `.env`: `CORS_ORIGIN=https://skullface.tu-dominio.com` y
`ENABLE_HSTS=true`, y reinicia el backend (`docker compose up -d backend`).

### Opción B — sin dominio, por ruta bajo la IP actual

```caddy
# dentro del bloque :80 que ya existe
handle_path /skullface/* {
    reverse_proxy 127.0.0.1:8000
}
```

Esta opción exige que el frontend se construya con una base distinta de `/`,
así que si es el camino elegido hay que ajustar `vite.config.js`. Con dominio
propio no hace falta tocar nada: es la razón por la que se recomienda la A.

Recarga Caddy (no reinicia la otra app):

```bash
docker exec sc_caddy caddy reload --config /etc/caddy/Caddyfile
```

## 5. Verificar

```bash
curl -s http://62.171.159.168/api/health          # o el dominio
docker compose ps                                  # los 3 servicios "Up"
ss -ltnp | grep 8000                               # debe decir 127.0.0.1:8000
```

Entra al sitio e inicia sesión con `ADMIN_USER` / `ADMIN_PASSWORD`.

## Actualizar

```bash
cd /root/skull-face-system
git pull
docker compose up -d --build
```

## Backups

El servidor no tiene backups automáticos. Con datos de ventas reales conviene
programar un volcado diario:

```bash
# /etc/cron.d/skullface-backup
0 3 * * * root docker exec skullface-db mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" skull_face | gzip > /root/backups/skullface-$(date +\%F).sql.gz
```

Crea `/root/backups` antes y borra los volcados con más de 30 días.

## Notas de convivencia

- Proyecto compose `skullface`, contenedores `skullface-*` y red
  `skullface_default`: no colisiona con el prefijo `sc_` ni con
  `software-conductual_default`.
- Solo `db` y `backend` viven en la red interna; ninguno publica puertos.
- El único archivo compartido con la otra app es el Caddyfile.
- `restart: unless-stopped` en los tres servicios, igual que la app existente.
- El firewall está inactivo: por eso el frontend se ata a `127.0.0.1` y no a
  `0.0.0.0`. Si algún día se expone un puerto, hay que activar `ufw` antes.
