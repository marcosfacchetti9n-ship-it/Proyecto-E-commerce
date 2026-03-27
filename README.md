# Northstar Shop

Full stack e-commerce portfolio project built from scratch with Java, Spring Boot, PostgreSQL, JWT, and a responsive vanilla JavaScript frontend.

The goal of this project is to show a recruiter-ready first version of a real product flow: authentication, roles, catalog, cart, checkout, orders, admin panel, deployment, and cloud database integration.

## Live Demo

- Frontend: [https://e-commerce-1-7jox.onrender.com](https://e-commerce-1-7jox.onrender.com)
- Backend API: [https://e-commerce-g82m.onrender.com/api](https://e-commerce-g82m.onrender.com/api)
- Repository: [https://github.com/marcosfacchetti9n-ship-it/E-commerce](https://github.com/marcosfacchetti9n-ship-it/E-commerce)

## Why This Project

This is not just a CRUD demo. It covers a full end-to-end e-commerce flow and shows:

- backend architecture with layers and DTOs
- authentication and authorization with JWT
- relational modeling with PostgreSQL
- admin and user role separation
- deploy to Render
- cloud database integration with Neon
- responsive frontend with multiple screens

## Tech Stack

- Backend: Java 17, Spring Boot, Spring Security, Spring Data JPA, Maven
- Database: PostgreSQL
- Auth: JWT
- Frontend: HTML, CSS, JavaScript
- Deploy: Render
- Cloud DB: Neon
- Containerization: Docker

## Main Features

- User registration and login
- JWT-based authentication
- Roles: `USER` and `ADMIN`
- Product catalog
- Categories
- Product detail page
- Persistent cart per user
- Simple checkout flow
- Order history per user
- Admin panel for products and categories
- Request validation
- Global exception handling
- Environment-based configuration

## Business Rules Implemented

- `USER` can register, sign in, browse products, add items to the cart, confirm purchases, and view order history
- `ADMIN` can create, edit, delete, and list products and categories
- Checkout does not use real payments yet; it creates an order, stores purchased items, and decreases stock

## Architecture

The backend follows a clean layered structure:

- `config`
- `controller`
- `dto`
- `entity`
- `exception`
- `repository`
- `security`
- `service`

Project structure:

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

## Domain Model

- `User` has roles, cart, and orders
- `Category` groups products
- `Product` belongs to a category and stores stock
- `Cart` belongs to a user
- `CartItem` links cart, product, and quantity
- `Order` belongs to a user and stores total, status, and creation date
- `OrderItem` stores the purchased product snapshot, unit price, and quantity

## Demo Credentials

Admin user created automatically on startup:

- Email: `admin@demo.com`
- Password: `Admin123`

The application also seeds demo categories and products so the catalog looks complete from the first run.

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Public

- `GET /api/products`
- `GET /api/products/{id}`
- `GET /api/categories`

### Authenticated User

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

## Local Setup

### Backend

```bash
cd backend
mvn spring-boot:run
```

The API runs on:

```text
http://localhost:8080/api
```

### Frontend

You can open `frontend/index.html` with Live Server or any static server.

If needed, update:

[`frontend/js/config.js`](/C:/Users/Marco/OneDrive/Desktop/Codex_test_2/frontend/js/config.js)

```js
window.APP_CONFIG = {
    API_BASE_URL: "http://localhost:8080/api"
};
```

## Environment Variables

Use `.env.example` as a base.

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRATION_MS`
- `CORS_ALLOWED_ORIGINS`

## Deployment

This project is deployed with:

- Backend on Render as a Docker web service
- Frontend on Render as a static site
- PostgreSQL on Neon

The repository also includes:

- [Dockerfile](https://github.com/marcosfacchetti9n-ship-it/E-commerce/blob/main/Dockerfile)
- [render.yaml](https://github.com/marcosfacchetti9n-ship-it/E-commerce/blob/main/render.yaml)

## Validation

The backend compiles successfully with:

```bash
cd backend
mvn -DskipTests compile
```

The project was also tested manually end to end after deployment:

- signup/login
- catalog browsing
- add to cart
- checkout
- order history
- admin product/category management

## Next Improvements

- search and advanced filters
- pagination
- image uploads
- dashboard metrics for admin
- unit and integration tests
- refresh tokens
- payment integration

## Recruiter Notes

This project was built to demonstrate the ability to:

- design and implement a full stack application from scratch
- model a relational domain in a realistic way
- work with authentication and role-based authorization
- deploy a backend and frontend to production
- connect a cloud-hosted PostgreSQL database
- finish a project end to end instead of leaving it as a local-only prototype
