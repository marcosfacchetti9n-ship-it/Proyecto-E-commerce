# Northstar Shop

Hola, soy Marcos y este proyecto es un e-commerce full stack que desarrollé desde cero como parte de mi portfolio.

Lo construí con Java, Spring Boot, PostgreSQL, JWT y frontend en HTML, CSS y JavaScript. Mi objetivo con este proyecto fue practicar y demostrar que puedo llevar una aplicación real de punta a punta: modelado de datos, autenticación, roles, lógica de negocio, frontend responsive, deploy y conexión a una base de datos cloud.

## Demo

- Frontend: [https://e-commerce-1-7jox.onrender.com](https://e-commerce-1-7jox.onrender.com)
- Backend API: [https://e-commerce-g82m.onrender.com/api](https://e-commerce-g82m.onrender.com/api)
- Repositorio: [https://github.com/marcosfacchetti9n-ship-it/E-commerce](https://github.com/marcosfacchetti9n-ship-it/E-commerce)

## Que Quise Resolver Con Este Proyecto

No quise hacer solo un CRUD básico. Busqué construir una primera versión de e-commerce que se sintiera como una aplicación completa y seria, aunque todavía simplificada respecto a un sistema comercial real.

Con este proyecto quise practicar especialmente:

- arquitectura backend por capas
- autenticación y autorización con JWT
- modelado relacional con PostgreSQL
- manejo de roles `USER` y `ADMIN`
- flujo completo de carrito, checkout y órdenes
- panel administrativo
- deploy real de frontend y backend
- uso de variables de entorno y base de datos cloud

## Stack Tecnológico

- Backend: Java 17, Spring Boot, Spring Security, Spring Data JPA, Maven
- Base de datos: PostgreSQL
- Autenticación: JWT
- Frontend: HTML, CSS y JavaScript
- Deploy: Render
- Base cloud: Neon
- Contenerización: Docker

## Funcionalidades Principales

- Registro e inicio de sesión
- Autenticación basada en JWT
- Roles `USER` y `ADMIN`
- Catálogo de productos
- Categorías
- Detalle de producto
- Carrito persistido por usuario
- Checkout simple
- Historial de órdenes
- Panel admin para productos y categorías
- Validaciones de requests
- Manejo global de errores
- Configuración por variables de entorno

## Reglas De Negocio Que Implementé

- Un usuario con rol `USER` puede registrarse, iniciar sesión, navegar productos, agregarlos al carrito, confirmar una compra y ver su historial de órdenes
- Un usuario con rol `ADMIN` puede crear, editar, eliminar y listar productos y categorías
- El checkout no integra pagos reales todavía; genera la orden, guarda los productos comprados y descuenta stock

## Cómo Está Organizado El Backend

En el backend seguí una estructura limpia por capas para separar responsabilidades:

- `config`
- `controller`
- `dto`
- `entity`
- `exception`
- `repository`
- `security`
- `service`

La idea fue que:

- los `controller` reciban la request
- los `service` resuelvan la lógica de negocio
- los `repository` manejen acceso a datos
- los `dto` definan qué entra y qué sale por la API

## Estructura Del Proyecto

```text
.
|-- backend
|   `-- src/main/java/com/portfolio/ecommerce
|       |-- config
|       |-- controller
|       |-- dto
|       |-- entity
|       |-- exception
|       |-- repository
|       |-- security
|       `-- service
|-- frontend
|   |-- css
|   |-- js
|   |-- index.html
|   |-- login.html
|   |-- product.html
|   |-- cart.html
|   |-- orders.html
|   `-- admin.html
|-- Dockerfile
|-- render.yaml
`-- .env.example
```

## Modelo De Dominio

Modelé las relaciones principales de un e-commerce de esta forma:

- `User` tiene roles, carrito y órdenes
- `Category` agrupa productos
- `Product` pertenece a una categoría y tiene stock
- `Cart` pertenece a un usuario
- `CartItem` conecta carrito, producto y cantidad
- `Order` pertenece a un usuario y guarda total, estado y fecha
- `OrderItem` guarda el snapshot del producto comprado, su precio y la cantidad

Esto me permitió trabajar relaciones reales entre entidades y no solo tablas aisladas.

## Credenciales Demo

Al iniciar la app se crea automáticamente un usuario administrador:

- Email: `admin@demo.com`
- Password: `Admin123`

También se cargan categorías y productos demo para que la aplicación tenga contenido desde el primer momento.

## API Principal

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Públicos

- `GET /api/products`
- `GET /api/products/{id}`
- `GET /api/categories`

### Usuario autenticado

- `GET /api/cart`
- `POST /api/cart/items`
- `PUT /api/cart/items/{itemId}`
- `DELETE /api/cart/items/{itemId}`
- `DELETE /api/cart/clear`
- `POST /api/orders/checkout`
- `GET /api/orders/me`

### Admin

- `GET /api/admin/products`
- `POST /api/admin/products`
- `PUT /api/admin/products/{id}`
- `DELETE /api/admin/products/{id}`
- `GET /api/admin/categories`
- `POST /api/admin/categories`
- `PUT /api/admin/categories/{id}`
- `DELETE /api/admin/categories/{id}`

## Cómo Lo Levanto En Local

### Backend

```bash
cd backend
mvn spring-boot:run
```

La API corre en:

```text
http://localhost:8080/api
```

### Frontend

El frontend puede abrirse con Live Server o cualquier servidor estático desde la carpeta `frontend`.

Si hace falta, se puede cambiar la URL de la API en:

[`frontend/js/config.js`](/C:/Users/Marco/OneDrive/Desktop/Codex_test_2/frontend/js/config.js)

```js
window.APP_CONFIG = {
    API_BASE_URL: "http://localhost:8080/api"
};
```

## Variables De Entorno

El proyecto usa estas variables:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRATION_MS`
- `CORS_ALLOWED_ORIGINS`

Dejé un archivo base en `.env.example`.

## Deploy

Este proyecto está deployado con:

- Backend en Render como Web Service con Docker
- Frontend en Render como Static Site
- PostgreSQL en Neon

También agregué:

- [Dockerfile](https://github.com/marcosfacchetti9n-ship-it/E-commerce/blob/main/Dockerfile)
- [render.yaml](https://github.com/marcosfacchetti9n-ship-it/E-commerce/blob/main/render.yaml)

## Validación

El backend compila correctamente con:

```bash
cd backend
mvn -DskipTests compile
```

Además probé manualmente el flujo completo ya deployado:

- registro e inicio de sesión
- navegación del catálogo
- agregar productos al carrito
- checkout
- visualización de órdenes
- gestión admin de productos y categorías

## Qué Aprendí / Qué Demuestra Este Proyecto

Con este proyecto pude practicar y demostrar que puedo:

- diseñar y construir una aplicación full stack desde cero
- modelar un dominio relacional de forma coherente
- trabajar con autenticación y control de roles
- conectar frontend, backend y base de datos cloud
- deployar una aplicación completa a producción
- cerrar un proyecto funcional de punta a punta, no solo dejarlo corriendo en local

## Próximas Mejoras Que Haría

- búsqueda y filtros avanzados
- paginación
- subida real de imágenes
- dashboard admin con métricas
- tests unitarios y de integración
- refresh tokens
- integración de pagos reales

## Nota Final

Este proyecto representa muy bien el tipo de trabajo que hoy estoy practicando: backend con Java/Spring, APIs, seguridad, SQL, lógica de negocio y despliegue real.

Actualmente estoy buscando mi primera oportunidad como desarrollador Java o Full Stack Junior, así que este repositorio forma parte directa de ese camino.
