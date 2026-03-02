# AgroFinanzas Frontend 🌾💹

## 📌 Descripción
**AgroFinanzas** es una plataforma moderna e integral diseñada para la gestión financiera y operativa del sector agrícola. El sistema permite a los productores monitorear cultivos (café, aguacate, entre otros), gestionar ganado (Hato), controlar ingresos, gastos, deudas e inventarios, y recibir recomendaciones técnicas. Además, cuenta con un robusto panel de administración para el control de usuarios y analítica financiera.

Este frontend es el resultado de una exitosa **migración hacia React y TypeScript**, tomando como base el [proyecto original desarrollado nativamente en Laravel (Blade)](https://github.com/Luis29099/Fronted-AgroFinanzas). El proceso de modernización ha elevado los estándares de escalabilidad, mantenibilidad y ha logrado una experiencia de usuario (UX) mucho más fluida.

---

## 🚀 Tecnologías utilizadas
- **React 19**: Biblioteca principal para la interfaz de usuario.
- **Vite 7**: Herramienta de construcción (bundler) ultrarrápida.
- **TypeScript 5**: Tipado estático para un desarrollo más robusto y seguro.
- **React Router DOM 7**: Manejo de rutas y navegación avanzada.
- **Axios**: Cliente HTTP para el consumo de APIs.
- **Context API**: Manejo de estado global (especialmente para autenticación).
- **Bootstrap 5**: Framework de diseño para una interfaz responsiva y moderna.
- **ESLint**: Garantía de calidad de código y buenas prácticas.

---

## 🏗️ Arquitectura del proyecto
El proyecto sigue una arquitectura **Modular basada en Funcionalidades (Feature-based Modular Architecture)**. Este patrón divide la aplicación en módulos independientes que encapsulan su propia lógica, páginas y servicios, facilitando la escalabilidad.

### Capas Principales:
1.  **App Layer (`src/app`)**:Configuración global, proveedores de contexto y definición centralizada de rutas.
2.  **Modules Layer (`src/modules`)**: Contiene los bloques de construcción de la aplicación (Auth, Admin, Hato, etc.). Cada módulo es autosuficiente.
3.  **Shared Layer (`src/shared`)**: Recursos reutilizables en toda la aplicación (componentes genéricos, hooks, tipos y servicios de API base).

---

## 📂 Estructura de carpetas
```text
src/
├── app/                  # Configuración global del core
│   ├── providers/        # Proveedores de contexto (Auth, etc.)
│   └── router/           # Configuración de Router y Guardas
├── assets/               # Imágenes y archivos estáticos
├── modules/              # Lógica de negocio por módulos
│   ├── auth/             # Autenticación (Login, Registro, Recuperación)
│   ├── admin/            # Dashboard de administración
│   ├── hato/             # Gestión de ganado
│   ├── crops/            # Gestión de cultivos
│   └── inicio/           # Dashboard principal del cliente
├── shared/               # Recursos globales reutilizables
│   ├── components/       # UI Components (Table, Input, Button)
│   ├── hooks/            # Custom Hooks globales
│   ├── services/         # Cliente Axios e interceptores
│   ├── types/            # Interfaces de TypeScript globales
│   └── utils/            # Funciones de utilidad
└── styles/               # Estilos globales y temas
```

---

## 🔐 Variables de entorno
Para ejecutar el proyecto, es necesario crear un archivo `.env` en la raíz con la siguiente configuración:

```env
VITE_URL_SERVER_API=http://tu-api.test/api    # URL Base del backend
VITE_WORKER_URL=http://tu-api.test/workers  # URL para workers/deployments
VITE_STATUS_PASSWORD=tu_password            # Password para acceso a estados
```

---

## ⚙️ Instalación y ejecución

### 1. Clonar el repositorio
```bash
git clone https://github.com/miguelcamilok/frontend-agrofinanzas.git
cd frontend-agrofinanzas
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Ejecutar en desarrollo
```bash
npm run dev
```

### 4. Construcción para producción
```bash
npm run build
```

---

## 🌐 Configuración de API
La comunicación con el backend se centraliza en `src/shared/services/api/axiosClient.ts`.
-   **Interceptores**: Manejan automáticamente la inyección de tokens de autenticación en las cabeceras.
-   **Tratamiento de errores**: Capa global para capturar respuestas 401 (No autorizado) y redirigir al login.

---

## 📦 Scripts disponibles
-   `npm run dev`: Inicia el servidor de desarrollo.
-   `npm run build`: Compila el proyecto para producción.
-   `npm run lint`: Ejecuta el análisis estático de código.
-   `npm run preview`: Previsualiza la build de producción localmente.

---

## 🧪 Buenas prácticas implementadas
-   **Lazy Loading**: Carga diferida de todas las rutas para optimizar el tiempo de carga inicial.
-   **Path Aliases**: Uso de `@modules`, `@shared`, `@app` para evitar _prop drilling_ de rutas relativas complicadas.
-   **Type Safety**: Interfaces y tipos rigurosos para reducir errores en tiempo de ejecución.
-   **Clean Code**: Separación clara de responsabilidades entre componentes, servicios y vistas.
-   **Modularización**: Cada característica está aislada, permitiendo que varios desarrolladores trabajen en módulos distintos sin conflictos.

---

## 📈 Posibles mejoras futuras
-   [ ] Implementar **Zustand** o **Redux Toolkit** para un estado complejo de finanzas.
-   [ ] Agregar **Unit Testing** con Vitest y React Testing Library.
-   [ ] Implementar **PWA** para funcionamiento offline en zonas rurales con poca conexión.
-   [ ] Soporte de **Internacionalización (i18n)**.

---

## 👨‍💻 Autores y Reconocimientos

**Desarrolladores del Proyecto Original (Laravel):**
- **Luis Esteban** - [GitHub](https://github.com/Luis29099)
- **Daniel Chicangana** - [GitHub](https://github.com/danielchicangana)
- **Jeferson Martinez** - [GitHub](https://github.com/jefermar)
- **Mentartugod** - [GitHub](https://github.com/mentartugod)

**Migración a Arquitectura React y Despliegue:**
- **Miguel Camilo** - [GitHub](https://github.com/miguelcamilok)
---

## 🛠️ Observaciones Técnicas (Senior Review)
Como Senior Engineer, he detectado los siguientes puntos a considerar para llevar el proyecto al siguiente nivel:

1.  **Gestión de Estado**: Actualmente se usa Context API para la autenticación, lo cual es correcto. Sin embargo, para la gestión de datos financieros que requieren mucha interactividad, se recomienda migrar a un administrador de estado atómico (como **Zustand**) o una solución de servidor como **React Query (TanStack Query)** para manejar el caché de la API.
2.  **Sincronización de Rutas**: El archivo `routes.config.ts` es extenso. Se sugiere delegar la definición de rutas secundarias a sus respectivos módulos para mantener el core más limpio.
3.  **Manejo de Formularios**: Se recomienda el uso de **React Hook Form** + **Zod** para validaciones complejas en los módulos de finanzas e hato, garantizando robustez antes del envío de datos.
4.  **Estauración de Estilos**: Aunque Bootstrap es eficiente, para un proyecto de esta magnitud, migrar hacia componentes estilizados o **Tailwind CSS** podría ofrecer mayor consistencia visual y reducir la especificidad de CSS redundante.
