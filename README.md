# AleBarber - Sistema de Reservas para Barbería

Sistema web completo para gestión de citas de barbería construido con Next.js, PostgreSQL y NextAuth.js.

## 🚀 Características

- ✂️ **Sistema de Reservas Online**: Los clientes pueden reservar citas de 45 minutos
- 🔐 **Autenticación Segura**: Sistema de login/registro con NextAuth.js
- 📅 **Gestión de Horarios**: Horarios configurables por día de la semana
- 🚫 **Prevención de Doble Reserva**: Sistema inteligente que previene conflictos de horarios
- 📱 **Responsive Design**: Interfaz moderna y completamente responsive
- 🌍 **Zona Horaria**: Configurado para Europe/Vilnius
- 🇪🇸 **Interfaz en Español**: Toda la UI está en español

## 🏪 Horarios de Negocio

- **Lunes, Miércoles, Viernes**: 12:00 - 16:00
- **Sábado, Domingo**: 13:00 - 16:00
- **Martes, Jueves**: Cerrado

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **Base de Datos**: PostgreSQL 16
- **ORM**: Prisma
- **Autenticación**: NextAuth.js (Auth.js) v5
- **Estilos**: Tailwind CSS
- **Iconos**: Lucide React
- **Fechas**: date-fns, date-fns-tz

## 📋 Requisitos Previos

- Node.js 18+ 
- Docker y Docker Compose (para PostgreSQL)
- npm o yarn

## 🚀 Instalación

1. **Clonar el repositorio** (si aplica)
   ```bash
   cd alebarber
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   El archivo `.env.local` ya debe estar creado con:
   ```env
   DATABASE_URL="postgresql://alebarber:alebarber123@localhost:5432/alebarber"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
   NODE_ENV="development"
   ```

   > ⚠️ **IMPORTANTE**: Cambia `NEXTAUTH_SECRET` en producción. Genera uno seguro con:
   > ```bash
   > openssl rand -base64 32
   > ```

4. **Iniciar la base de datos**
   ```bash
   docker-compose up -d
   ```

5. **Ejecutar migraciones de Prisma**
   ```bash
   npx prisma migrate dev --name init
   ```

6. **Generar Prisma Client**
   ```bash
   npx prisma generate
   ```

7. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

8. **Abrir en el navegador**
   
   Visita [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
alebarber/
├── app/
│   ├── api/              # API Routes
│   │   ├── auth/         # NextAuth endpoints
│   │   ├── register/     # Registro de usuarios
│   │   ├── appointments/ # CRUD de citas
│   │   └── availability/ # Consulta de disponibilidad
│   ├── dashboard/        # Panel del usuario
│   ├── login/            # Página de login
│   ├── register/         # Página de registro
│   ├── reservar/         # Página de reservas
│   ├── layout.tsx        # Layout principal
│   ├── page.tsx          # Landing page
│   └── globals.css       # Estilos globales
├── components/           # Componentes React
│   ├── Navbar.tsx
│   ├── SignOutButton.tsx
│   └── AppointmentCard.tsx
├── lib/                  # Utilidades
│   ├── prisma.ts         # Cliente de Prisma
│   ├── scheduling.ts     # Lógica de horarios
│   └── auth-utils.ts     # Utilidades de autenticación
├── prisma/
│   └── schema.prisma     # Esquema de base de datos
├── types/
│   └── next-auth.d.ts    # Tipos de NextAuth
├── auth.ts               # Configuración NextAuth
├── middleware.ts         # Middleware de rutas
├── docker-compose.yml    # PostgreSQL container
└── package.json
```

## 🗄️ Esquema de Base de Datos

### User
- ID, nombre, email, contraseña (hasheada)
- Relaciones: citas, sesiones

### Appointment
- ID, userId, startTime, endTime, status
- Estados: CONFIRMED, CANCELLED
- Índices en userId y startTime

### Account, Session, VerificationToken
- Modelos de NextAuth para autenticación

## 🔒 Autenticación

El sistema usa **NextAuth.js v5** con provider de credenciales:

- Registro: `/register`
- Login: `/login`
- Las contraseñas se hashean con bcrypt
- Las sesiones usan estrategia JWT
- Rutas protegidas: `/dashboard`, `/reservar`

## 📅 Sistema de Reservas

### Lógica de Horarios (`lib/scheduling.ts`)

- **Duración de servicio**: 45 minutos exactos
- **Generación de slots**: Dinámicamente basado en horarios de negocio
- **Zona horaria**: Europe/Vilnius
- **Validaciones**:
  - No permite reservas fuera de horario
  - Previene doble-booking
  - Verifica que el slot termine antes del cierre

### Flujo de Reserva

1. Usuario selecciona fecha
2. Sistema consulta slots disponibles (`/api/availability`)
3. Usuario selecciona horario
4. Sistema valida y crea cita (`/api/appointments`)
5. Cita aparece en dashboard

## 🎨 Diseño UI

- **Colores principales**: 
  - Marrón (#8b4513) - Principal
  - Dorado (#daa520) - Acentos
- **Tema oscuro**: Soportado automáticamente
- **Responsive**: Mobile-first design
- **Iconos**: Lucide React

## 🧪 Uso del Sistema

### Como Usuario:

1. **Registro**: Crea cuenta con email y contraseña
2. **Login**: Inicia sesión
3. **Reservar**: 
   - Ve a "Reservar Cita"
   - Selecciona fecha
   - Elige horario disponible
   - Confirma
4. **Mis Citas**: Ve tus citas en el dashboard
5. **Cancelar**: Cancela citas desde el dashboard

### Herramientas de Desarrollo:

```bash
# Ver base de datos con Prisma Studio
npx prisma studio

# Ver logs de PostgreSQL
docker-compose logs -f postgres

# Resetear base de datos
npx prisma migrate reset

# Generar nueva migración
npx prisma migrate dev --name nombre_migracion
```

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build producción
npm run build

# Iniciar producción
npm start

# Lint
npm run lint

# Formatear con Prettier (si está configurado)
npm run format
```

## 🐛 Solución de Problemas

### Error: No se puede conectar a la base de datos

```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps

# Reiniciar contenedor
docker-compose restart
```

### Error: Prisma Client no generado

```bash
npx prisma generate
```

### Error: Migraciones pendientes

```bash
npx prisma migrate dev
```

## 📝 Notas de Producción

Antes de desplegar en producción:

1. ✅ Cambiar `NEXTAUTH_SECRET` por uno seguro
2. ✅ Configurar `NEXTAUTH_URL` con tu dominio
3. ✅ Usar PostgreSQL en producción (no Docker local)
4. ✅ Configurar variables de entorno en tu plataforma (Vercel, Railway, etc.)
5. ✅ Ejecutar `npx prisma migrate deploy` en producción
6. ✅ Configurar backups de base de datos

## 🤝 Contribuciones

Este es un proyecto de demostración. Para mejoras:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/mejora`)
3. Commit cambios (`git commit -m 'Añadir mejora'`)
4. Push a la rama (`git push origin feature/mejora`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - Siéntete libre de usar este proyecto para tus propios propósitos.

## 👨‍💻 Autor

Desarrollado para AleBarber

---

**¡Disfruta gestionando tu barbería! ✂️💈**
# alebarber
