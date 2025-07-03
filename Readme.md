# 📚 Bookstore REST API

A simple, Node.js + Express REST API using TypeScript and file-based storage. Includes JWT authentication, testing with Jest, and support for basic CRUD operations on books.

---

## Features

* User registration and login with hashed passwords (bcrypt)
* JWT-based authentication (stored in HTTP-only cookies)
* CRUD operations for books
* Filtering and pagination for book listing
* File-based persistent storage (JSON files)

---

## 📁 Project Structure

```
├── src
│   ├── index.ts                # App entry point
│   ├── routes
│   │   ├── authRoutes.ts       # Auth endpoints
│   │   └── bookRoutes.ts       # Book endpoints
│   ├── controller
│   │   ├── authController.ts   # Auth logic
│   │   └── booksController.ts  # Book logic
│   └── middleware
│       └── middleware.ts       # Auth middleware
├── data
│   ├── users.json              # User data
│   └── books.json              # Book data
```

---

## 🛠 Setup Instructions

### Prerequisites

* Node.js (v16 or higher)
* npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/Niteshkumar13/Book-Store.git
cd Book-Store
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Create `.env` File

```env
JWT_SECRET=your_secret_key
PORT=3001
```

### 4. Run the Server

```bash
npm run dev    # For development
npm run build  # To compile TypeScript
npm start      # To run production build
```

---

## 🧪 Testing Endpoints

### Using Postman

Import the following endpoints into Postman:

#### 1. Register

```http
POST /api/v1/auth/register
Body (JSON): { "email": "test@example.com", "password": "testpass" }
```

#### 2. Login

```http
POST /api/v1/auth/login
Body (JSON): { "email": "test@example.com", "password": "testpass" }
```

> The token will be set in an HTTP-only cookie.

#### 3. Add a Book

```http
POST /api/v1/books
Headers: Cookie (from login)
Body (JSON): {
  "title": "1984",
  "author": "George Orwell",
  "genre": "Dystopian",
  "publishedYear": 1949
}
```

#### 4. Get All Books

```http
GET /api/v1/books
Headers: Cookie
```

#### 5. Get Book by ID

```http
GET /api/v1/books/:id
Headers: Cookie
```

#### 6. Update Book

```http
PUT /api/v1/books/:id
Headers: Cookie
Body (JSON): { "title": "New Title" }
```

#### 7. Delete Book

```http
DELETE /api/v1/books/:id
Headers: Cookie
```

### Using cURL (example)

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpass"}'
```

---

## ✨ Author

Created by [Nitesh Kumar](https://krnitesh.xyz). Contributions and issues are welcome!
