# Sistema de Autenticación de Usuarios

## Descripción General

Este sistema proporciona autenticación completa de usuarios para el proyecto Gatsby + Neon PostgreSQL, incluyendo registro, inicio de sesión y gestión de perfiles.

## Estructura del Sistema

### Base de Datos

**Tabla de Usuarios** (`users`)
- `id`: SERIAL PRIMARY KEY
- `first_name`: VARCHAR(255) - Nombre del usuario
- `email`: VARCHAR(255) UNIQUE - Email del usuario (único)
- `password_hash`: TEXT - Contraseña hasheada con PBKDF2
- `is_active`: BOOLEAN - Estado de activación de la cuenta
- `email_verified`: BOOLEAN - Estado de verificación del email
- `created_at`: TIMESTAMP - Fecha de creación
- `updated_at`: TIMESTAMP - Fecha de última actualización

### Backend - Funciones Serverless

#### 1. `/api/auth/register` (POST)
**Archivo**: `netlify/functions/register.js`

Registra un nuevo usuario en el sistema.

**Request Body**:
```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@example.com",
  "password": "Password123"
}
```

**Response (201)**:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@example.com",
    "createdAt": "2025-01-15T10:00:00.000Z"
  }
}
```

**Validaciones**:
- Email válido
- Contraseña fuerte (mínimo 8 caracteres, 1 minúscula, 1 mayúscula, 1 número)
- Email no duplicado

#### 2. `/api/auth/login` (POST)
**Archivo**: `netlify/functions/login.js`

Inicia sesión y genera un token JWT.

**Request Body**:
```json
{
  "email": "juan@example.com",
  "password": "Password123"
}
```

**Response (200)**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@example.com"
  }
}
```

#### 3. `/api/auth/profile` (GET/PUT)
**Archivo**: `netlify/functions/profile.js`

Obtiene o actualiza el perfil del usuario autenticado.

**GET Request**:
- Headers: `Authorization: Bearer {token}`

**PUT Request**:
- Headers: `Authorization: Bearer {token}`
- Body:
```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "nuevoemail@example.com",
  "currentPassword": "Password123",
  "newPassword": "NewPassword456"
}
```

### Utilidades de Autenticación

**Archivo**: `netlify/functions/utils/auth.js`

- `hashPassword(password)`: Hash de contraseñas con PBKDF2 + salt
- `verifyPassword(password, storedHash)`: Verificación de contraseñas
- `generateToken(userId, email)`: Generación de JWT
- `verifyToken(token)`: Verificación y decodificación de JWT
- `extractBearerToken(authHeader)`: Extracción de token desde header

### Frontend - React Context y Hooks

**Archivo**: `src/context/AuthContext.js`

Contexto de React que proporciona:

- `user`: Objeto del usuario actual
- `token`: Token JWT
- `loading`: Estado de carga
- `login(email, password)`: Función para iniciar sesión
- `register(firstName, lastName, email, password)`: Función para registrarse
- `logout()`: Función para cerrar sesión
- `updateProfile(updates)`: Función para actualizar perfil
- `fetchProfile()`: Función para obtener datos del perfil
- `isAuthenticated()`: Función para verificar autenticación

**Uso**:
```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  // ... tu código
}
```

### Páginas Integradas

#### Login (`src/pages/login.js`)
- Formulario de inicio de sesión
- Validación de email y contraseña
- Integración con API de login
- Redirección a cuenta tras login exitoso

#### Registro (`src/pages/signup.js`)
- Formulario de creación de cuenta
- Validación de campos
- Validación de contraseña fuerte
- Integración con API de registro

#### Configuración de Perfil (`src/pages/account/settings.js`)
- Visualización de datos del usuario
- Actualización de nombre y email
- Cambio de contraseña
- Validación de contraseña actual

## Instalación y Configuración

### 1. Variables de Entorno

Asegúrate de tener configuradas estas variables de entorno en Netlify:

- `NETLIFY_DATABASE_URL`: URL de conexión a Neon PostgreSQL
- `JWT_SECRET`: (Opcional) Secreto para firma de JWT

### 2. Migración de Base de Datos

Ejecuta el script de migración para crear la tabla de usuarios:

```bash
npm run db:migrate-users
```

### 3. Actualizar package.json

El script de migración ya está configurado. Si necesitas añadirlo manualmente:

```json
{
  "scripts": {
    "db:migrate-users": "node scripts/migrate-users.js"
  }
}
```

## Seguridad

### Medidas Implementadas

1. **Hash de Contraseñas**: PBKDF2 con 10,000 iteraciones y salt único por usuario
2. **JWT con Expiración**: Tokens válidos por 7 días
3. **Validación de Entrada**: Validación tanto en frontend como backend
4. **Contraseñas Fuertes**: Requisitos mínimos de complejidad
5. **Protección de Rutas**: Verificación de autenticación en rutas protegidas
6. **Email Único**: Prevención de duplicados en la base de datos
7. **SQL Parametrizado**: Prevención de inyección SQL

### Recomendaciones Adicionales

1. **HTTPS**: Asegúrate de usar HTTPS en producción (Netlify lo hace automáticamente)
2. **Rate Limiting**: Considera implementar límites de intentos de login
3. **Email Verification**: Implementa verificación de email para producción
4. **2FA**: Considera autenticación de dos factores para mayor seguridad
5. **JWT_SECRET**: Usa una clave secreta fuerte y única en producción
6. **Logging**: Implementa logs de auditoría para intentos de login

## Uso en Componentes

### Proteger una Página

```javascript
import { useAuth } from '../context/AuthContext';
import { navigate } from 'gatsby';

function ProtectedPage() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated()) {
    navigate('/login');
    return null;
  }
  
  return <div>Contenido protegido</div>;
}
```

### Mostrar Información del Usuario

```javascript
import { useAuth } from '../context/AuthContext';

function UserProfile() {
  const { user } = useAuth();
  
  return (
    <div>
      <h1>Bienvenido, {user?.firstName}!</h1>
      <p>Email: {user?.email}</p>
    </div>
  );
}
```

## Solución de Problemas

### Error: "Unauthorized"
- Verifica que el token JWT esté presente en localStorage
- Confirma que el token no haya expirado (7 días)
- Revisa que el header Authorization esté correctamente formateado

### Error: "Email already registered"
- El email ya existe en la base de datos
- El usuario debe usar la función de login o recuperación de contraseña

### Error de Conexión a Base de Datos
- Verifica que `NETLIFY_DATABASE_URL` esté configurada
- Confirma que la tabla `users` existe en la base de datos
- Ejecuta la migración si es necesario

## API Endpoints

| Endpoint | Método | Autenticación | Descripción |
|----------|--------|---------------|-------------|
| `/api/auth/register` | POST | No | Registro de nuevo usuario |
| `/api/auth/login` | POST | No | Inicio de sesión |
| `/api/auth/profile` | GET | Sí | Obtener perfil |
| `/api/auth/profile` | PUT | Sí | Actualizar perfil |

## Testing

Para probar el sistema:

1. **Registro**: Visita `/signup` y crea una cuenta
2. **Login**: Ve a `/login` e inicia sesión
3. **Perfil**: Navega a `/account/settings` para ver/editar tu perfil
4. **Logout**: Usa el hook `logout()` para cerrar sesión

## Próximos Pasos Sugeridos

1. Implementar recuperación de contraseña
2. Agregar verificación de email
3. Implementar refresh tokens
4. Añadir autenticación social (Google, Facebook)
5. Implementar roles y permisos
6. Agregar foto de perfil
7. Implementar auditoría de sesiones
