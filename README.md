# 🔐 Role-Based Task Management System (Backend + Frontend)

A production-oriented REST API with JWT authentication and role-based access control, where **admins assign tasks** and **users update their status**. Built with a clean, scalable architecture and a minimal frontend to demonstrate real usage.

---

## 🚀 Key Features

* 🔑 **Authentication**

  * User Registration & Login
  * Password hashing using bcrypt
  * JWT-based secure authentication

* 👥 **Role-Based Access Control**

  * Admin: create, view, delete any task
  * User: view own tasks, update status only

* 📝 **Task Management (CRUD)**

  * Create task (Admin)
  * Read tasks (Admin: all, User: own)
  * Update task status (User)
  * Delete task (Admin)

* 🛡️ **Security & Best Practices**

  * Protected routes using middleware
  * Input validation using express-validator
  * Centralized error handling
  * API versioning (`/api/v1`)

* 📄 **API Documentation**

  * https://documenter.getpostman.com/view/54222821/2sBXqFN32D

---

## 🛠️ Tech Stack

**Backend**

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT (Authentication)
* bcrypt (Password hashing)
* express-validator

**Frontend**

* Next.js (Basic UI for testing APIs)

---

## 📁 Project Structure

```
project/
│── backend/
│   │── controllers/
│   │── models/
│   │── routes/
│   │── middleware/
│   │── config/
│   │── utils/
│   │── app.js
│   │── server.js
│
│── frontend/
│   │── app/
│       |-- admin-dashboard/
│       |-- login/
|       |-- user-dashboard/
|       |-- page.tsx
│── README.md
```

---

## ⚙️ Setup Instructions

### 1. Clone Repository

```bash
git clone <your-repo-link>
cd project
```

---

### 2. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file:
```
PORT=3001
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```

Run backend:
```bash
npm run dev
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔗 API Endpoints

### Auth

* POST `/api/v1/auth/register`
* POST `/api/v1/auth/login`

### Tasks

* GET `/api/v1/tasks` → Get tasks
* POST `/api/v1/tasks` → Create task (Admin)
* PUT `/api/v1/tasks/:id/status` → Update status (User)
* DELETE `/api/v1/tasks/:id` → Delete task (Admin)

---

## 🔐 Authentication

All protected routes require:

```
Authorization: Bearer <JWT_TOKEN>
```

---

## 📄 API Documentation

Postman Collection:
👉 <your-postman-link>

---

## 🌐 Deployment

* Frontend: <your-vercel-link>
* Backend: <your-render-link>
* Database: MongoDB Atlas

---

## 🧠 System Design & Flow

1. User/Admin logs in → receives JWT token
2. Token sent with every request
3. Middleware verifies user identity
4. Role-based middleware restricts actions
5. Controllers handle business logic
6. Database stores and retrieves data

---

## 📈 Scalability Considerations

* Modular architecture for easy expansion
* Can be extended into microservices
* Redis can be added for caching
* Logging (Winston) can be integrated
* Load balancing possible for high traffic systems

---

## ⚠️ Important Notes

* Backend enforces strict authorization (users cannot access others’ data)
* All inputs are validated before processing
* API follows REST principles with proper status codes

---

## 👨‍💻 Author
Tausif Khan
Built as part of a backend engineering assignment to demonstrate:

* Secure API development
* Scalable backend architecture
* Real-world role-based systems

---
