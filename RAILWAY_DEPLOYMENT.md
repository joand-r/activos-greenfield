# 🚀 Guía de Despliegue en Railway

Este documento detalla cómo desplegar el backend del proyecto **Activos Greenfield** en Railway con PostgreSQL, aprovechando el plan gratuito.

## 📋 Prerrequisitos

- Cuenta en [Railway.app](https://railway.app/)
- Cuenta en GitHub (el proyecto debe estar en un repositorio)
- El frontend ya desplegado en Netlify

## 🎯 Pasos para Desplegar

### 1️⃣ Crear Proyecto en Railway

1. Ve a [railway.app](https://railway.app/) e inicia sesión
2. Click en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Autoriza Railway para acceder a tu repositorio
5. Selecciona el repositorio `activos-greenfield`

### 2️⃣ Agregar PostgreSQL

1. En tu proyecto de Railway, click en **"+ New"**
2. Selecciona **"Database"**
3. Elige **"Add PostgreSQL"**
4. Railway creará automáticamente la base de datos y la variable `DATABASE_URL`

### 3️⃣ Configurar el Servicio Backend

1. En el proyecto de Railway, click en el servicio del backend
2. Ve a **"Settings"**
3. En **"Root Directory"**, configura: `backend`
4. En **"Start Command"**, verifica que sea: `npm start`

### 4️⃣ Configurar Variables de Entorno

En la sección **"Variables"** del servicio backend, agrega las siguientes variables:

```env
# Configuración del servidor
NODE_ENV=production
PORT=3001

# La DATABASE_URL se configura automáticamente por Railway
# No necesitas agregar DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME

# JWT
JWT_SECRET=<genera_un_secreto_seguro_aqui>
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=<tu_cloudinary_cloud_name>
CLOUDINARY_API_KEY=<tu_cloudinary_api_key>
CLOUDINARY_API_SECRET=<tu_cloudinary_api_secret>

# Frontend URL (tu dominio de Netlify)
FRONTEND_URL=https://tu-app.netlify.app
```

**⚠️ Importante:**
- Para `JWT_SECRET`, genera una clave segura. Puedes usar este comando en PowerShell:
  ```powershell
  -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
  ```
- Reemplaza `FRONTEND_URL` con tu URL real de Netlify

### 5️⃣ Inicializar la Base de Datos

Una vez que el servicio esté desplegado:

1. Ve a la sección **"Deployments"** y verifica que el deployment sea exitoso
2. Click en el servicio backend
3. Ve a **"Settings" > "Networking"**
4. Copia la URL pública del servicio (ej: `https://activos-backend-production.up.railway.app`)

#### Opción A: Desde Railway CLI (Recomendado)

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Iniciar sesión
railway login

# Enlazar al proyecto
railway link

# Ejecutar migraciones
railway run npm run migrate

# O si tienes un script de seed
railway run npm run db:reset
```

#### Opción B: Manualmente con Tabla SQL

Si no tienes scripts de migración, conecta directamente a PostgreSQL desde Railway:

1. En Railway, click en el servicio PostgreSQL
2. Ve a **"Data"** 
3. Usa el query editor para crear tus tablas

O descarga las credenciales y conéctate localmente:
1. Click en **"Connect"**
2. Copia las credenciales
3. Usa un cliente PostgreSQL como pgAdmin o DBeaver

### 6️⃣ Configurar el Frontend en Netlify

Actualiza las variables de entorno en Netlify:

1. Ve a tu sitio en Netlify
2. **Site settings** > **Environment variables**
3. Actualiza o agrega:
   ```
   NEXT_PUBLIC_API_URL=https://tu-backend-url.up.railway.app
   ```
4. Redespliegua el sitio: **Deploys** > **Trigger deploy**

### 7️⃣ Verificar el Despliegue

1. Verifica el health check:
   ```
   https://tu-backend-url.up.railway.app/health
   ```
   Deberías ver: `{"status":"ok","timestamp":"...","database":"connected"}`

2. Verifica el endpoint raíz:
   ```
   https://tu-backend-url.up.railway.app/
   ```

3. Prueba el login desde tu frontend en Netlify

## 🎁 Plan Gratuito de Railway

Railway ofrece **$5 USD de crédito mensual gratuito** que incluye:

- **500 horas de ejecución** por mes
- **100 GB de tráfico** por mes  
- **1 GB de RAM** por servicio
- PostgreSQL incluido

**💡 Consejos para optimizar el uso:**
- El servicio se suspende automáticamente después de inactividad (esto ahorra crédito)
- Puedes ver el uso actual en el dashboard de Railway
- Si necesitas más recursos, considera el plan Pro ($20/mes)

## 🔧 Comandos Útiles

```bash
# Ver logs en tiempo real
railway logs

# Abrir el shell en el servidor
railway shell

# Ver variables de entorno
railway variables

# Ejecutar comando en el servidor
railway run <comando>
```

## 🐛 Solución de Problemas

### El deployment falla
- Verifica los logs en Railway: **Deployments** > click en el deployment > **View Logs**
- Asegúrate de que `backend/package.json` tenga el script `start`
- Verifica que todas las dependencias estén en `dependencies` (no en `devDependencies`)

### Error de conexión a la base de datos
- Verifica que la variable `DATABASE_URL` exista
- Comprueba que el servicio PostgreSQL esté activo
- Revisa los logs del backend

### CORS errors desde el frontend
- Verifica que `FRONTEND_URL` esté configurada correctamente
- Asegúrate de incluir el protocolo `https://`
- No incluyas barra final en la URL

### El servicio no responde
- Railway puede suspender el servicio por inactividad (plan gratuito)
- La primera petición después de la suspensión puede tardar ~30 segundos

## 📚 Recursos Adicionales

- [Documentación de Railway](https://docs.railway.app/)
- [Railway Templates](https://railway.app/templates)
- [Comunidad de Railway en Discord](https://discord.gg/railway)

## ✅ Checklist Final

- [ ] Proyecto creado en Railway
- [ ] PostgreSQL agregado y conectado
- [ ] Variables de entorno configuradas
- [ ] Root directory configurado como `backend`
- [ ] Database inicializada (tablas creadas)
- [ ] Health check respondiendo correctamente
- [ ] Frontend en Netlify actualizado con nueva API URL
- [ ] Login funcionando desde el frontend

---

¡Listo! Tu backend debería estar funcionando en Railway con PostgreSQL 🎉
